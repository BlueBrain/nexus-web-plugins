import React, { useEffect, useState, useContext } from 'react';
import get from 'lodash/get';

import { Spin } from 'antd';

import { parseUrl, NexusClientContext } from '..';
import { SimCampaignConfigResource } from '../types';
import SimCampaignConfigComponent from './sim-campaign-config-component';

interface SimCampaignConfigContainerProps {
  resourceId: string;
  org: string;
  project: string;
}

export const SimCampaignConfigContainer = (
  props: SimCampaignConfigContainerProps
) => {
  const { org, project, resourceId } = props;
  const nexus = useContext(NexusClientContext);

  const [
    simCampaignConfig,
    setSimCampaignConfig,
  ] = useState<SimCampaignConfigResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSimCampaignConf = (simCampaignResource: SimCampaignConfigResource) => {
      const configUrl = simCampaignResource.configuration.contentUrl;

      const tmplUrl = simCampaignResource.template.contentUrl;
      const tmplIdMatch = tmplUrl.match(/.*\/(.*?)$/);
      const tmplId = tmplIdMatch ? tmplIdMatch[1] : '';

      const targetUrl = get(simCampaignResource, 'target.contentUrl', '');
      const targetIdMatch = targetUrl.match(/.*\/(.*?)$/);
      const targetId = targetIdMatch ? targetIdMatch[1] : '';

      const { name, description, _self } = simCampaignResource;

      const parsedTmplUrl = parseUrl(tmplUrl);

      const configuration = { data: '' };
      const template = { data: '' };
      const target = { data: '' };

      return nexus
        .httpGet({ path: configUrl })
        .then(configData => {
          configuration.data = configData;
        })
        .then(() =>
          nexus.File.get(parsedTmplUrl.org, parsedTmplUrl.project, tmplId, {
            as: 'text',
          })
        )
        .then(tmplData => {
          template.data = tmplData as string;
        })
        .then(() => {
          if (!targetId) return;

          const parsedTargetUrl = parseUrl(targetUrl);
          return nexus.File.get(
            parsedTargetUrl.org,
            parsedTargetUrl.project,
            targetId,
            { as: 'text' }
          ).then(targetData => {
            target.data = targetData as string;
          });
        })
        .then(() => ({
          name,
          description,
          configuration,
          template,
          target,
          _self,
        }));
    };

    nexus.Resource
      .get<SimCampaignConfigResource>(org, project, encodeURIComponent(resourceId))
      .then(getSimCampaignConf)
      .then(simCampaignConfig =>
        setSimCampaignConfig(simCampaignConfig as SimCampaignConfigResource)
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <Spin spinning={loading}>
      {simCampaignConfig && (
        <SimCampaignConfigComponent resource={simCampaignConfig} />
      )}
    </Spin>
  );
};

export default SimCampaignConfigContainer;
