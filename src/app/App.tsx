import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'oidc-client';
import { NexusClient } from '@bbp/nexus-sdk';
import get from 'lodash/get';
import { Form, Input, Select, Button, notification } from 'antd';

import { NexusClientContext } from '../common';
import { Circuit } from '../plugins/circuit';
import { Simulation } from '../plugins/simulation';
import { SimulationCampaign } from '../plugins/simulation-campaign';
import { EphysContainer } from '../plugins/ephys-viewer';
import { MorphoViewerContainer } from '../plugins/morphology';

import './app.css';

const { Option } = Select;

interface AppProps {
  nexus: NexusClient;
  user: User;
}

const plugins: { [pluginName: string]: React.FC<any> } = {
  circuit: Circuit,
  simulation: Simulation,
  simulationCampaign: SimulationCampaign,
  ephysViewer: EphysContainer,
  mophoViewer: MorphoViewerContainer,
};

const pluginNames = Object.keys(plugins);

export const App = (props: AppProps) => {
  const { nexus } = props;

  const configRaw = localStorage.getItem('config');
  const config = configRaw
    ? JSON.parse(configRaw)
    : { pluginName: pluginNames[0], pluginFormData: {} };

  const formData = config.pluginFormData[config.pluginName] || {};

  const [currentPluginName, setCurrentPluginName] = useState<string>(
    config.pluginName
  );

  const [loading, setLoading] = useState(true);

  const [org, setOrg] = useState<string>(formData.org || '');
  const [project, setProject] = useState<string>(formData.project || '');
  const [resourceId, setResourceId] = useState<string>(
    formData.resourceId || ''
  );

  const [resource, setResource] = useState(null);

  const valid = org && project && resourceId;
  const Plugin = plugins[currentPluginName];
  const pluginKey = `${currentPluginName}${org}${project}${resourceId}`;

  const fetchResource = useCallback(() => {
    if (!valid) return;

    setLoading(true);
    nexus.Resource.get(org, project, encodeURIComponent(resourceId))
      .then(resource => setResource(resource as any))
      .catch(err => {
        notification.error({
          message: get(err, '@type', 'Error'),
          description: get(err, 'reason', err.message),
          duration: 6,
        });
      })
      .finally(() => setLoading(false));
  }, [nexus.Resource, org, project, resourceId, valid]);

  const saveConfig = () => {
    localStorage.setItem('config', JSON.stringify(config));
  };

  const onPluginChange = (pluginName: string) => {
    const formData = config.pluginFormData[pluginName] || {};
    setResource(null);
    setOrg(formData.org || '');
    setProject(formData.project || '');
    setResourceId(formData.resourceId || '');
    setCurrentPluginName(pluginName);
  };

  const onOrgChange = (org: string) => {
    setResource(null);
    setOrg(org);
  };

  const onProjectChange = (project: string) => {
    setResource(null);
    setProject(project);
  };

  const onResourceIdChange = (resourceId: string) => {
    setResource(null);
    setResourceId(resourceId);
  };

  const load = () => {
    config.pluginName = currentPluginName;
    config.pluginFormData[currentPluginName] = {
      org,
      project,
      resourceId,
    };
    saveConfig();
    fetchResource();
  };

  useEffect(() => {
    fetchResource();
  }, [currentPluginName, fetchResource]);

  return (
    <div className="app">
      <div className="plugin-ctrl">
        <div className="text-right">
          <p>
            Current Environment:{' '}
            <a href={nexus.context.uri}>{nexus.context.uri}</a>
          </p>
        </div>
        <Form layout="inline">
          <Form.Item label="Plugin">
            <Select
              className="plugin-select"
              defaultValue={currentPluginName}
              size="small"
              onChange={(pluginName: string) => onPluginChange(pluginName)}
            >
              {pluginNames.map(pluginName => (
                <Option value={pluginName} key={pluginName}>
                  {pluginName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Org">
            <Input
              value={org}
              size="small"
              placeholder="org"
              onChange={e => onOrgChange(e.target.value)}
              onPressEnter={() => load()}
            />
          </Form.Item>
          <Form.Item label="Project">
            <Input
              value={project}
              size="small"
              placeholder="project"
              onChange={e => onProjectChange(e.target.value)}
              onPressEnter={() => load()}
            />
          </Form.Item>
          <Form.Item label="Resource Id">
            <Input
              className="resource-id-input"
              value={resourceId}
              placeholder="Resource id"
              size="small"
              onPressEnter={() => load()}
              onChange={e => onResourceIdChange(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              size="small"
              disabled={!valid}
              onClick={() => load()}
            >
              Load
            </Button>
          </Form.Item>
        </Form>
      </div>

      {!loading && Plugin && resource && (
        <div className="plugin-container">
          <NexusClientContext.Provider value={nexus}>
            <Plugin resource={resource as any} nexus={nexus} key={pluginKey} />
          </NexusClientContext.Provider>
        </div>
      )}
    </div>
  );
};

export default App;
