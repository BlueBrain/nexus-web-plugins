import React from 'react';
import { Collapse, Card } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import prettyJsonStringify from 'json-stringify-pretty-compact';

import { SimCampaignConfigResource } from '../types';
import { CopyBtn } from '../copy-btn/copy-btn';

import 'codemirror/mode/javascript/javascript';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/duotone-light.css';

import './sim-campaign-config.css';


interface SimCampaignConfigProps {
  resource: SimCampaignConfigResource;
}

const { Panel } = Collapse;

const SimCampaignConfig = (props: SimCampaignConfigProps) => {
  const { resource } = props;

  return (
    <div>
      <div className="mt">
        <Card
          className="card--no-padding"
          title="Simulation campaign configuration"
          extra={<CopyBtn text={resource._self} label="URL" />}
        >
          <div className="config-info-container">
            <p>
              <strong>Name: </strong> {resource.name}
            </p>
            <p>
              <strong>Description: </strong> {resource.description || '-'}
            </p>
          </div>
        </Card>
      </div>

      <div className="mt">
        <Collapse>
          <Panel
            className="panel--no-padding"
            header="Config"
            key="simCampaignConfig"
          >
            <CodeMirror
              value={prettyJsonStringify(resource.configuration.data, {
                indent: '  ',
                maxLength: 80,
              })}
              options={{
                mode: { name: 'javascript', json: true },
                readOnly: true,
                theme: 'duotone-light',
                lineNumbers: true,
                lineWrapping: true,
              }}
              onBeforeChange={() => {}}
            />
          </Panel>
          {resource.template.data && (
            <Panel
              className="panel--no-padding"
              header="Template"
              key="template"
            >
              <CodeMirror
                value={resource.template.data}
                options={{
                  mode: { name: 'javascript', json: true },
                  readOnly: true,
                  theme: 'duotone-light',
                  lineNumbers: true,
                  lineWrapping: true,
                }}
                onBeforeChange={() => {}}
              />
            </Panel>
          )}
          {resource.target && resource.target.data && (
            <Panel className="panel--no-padding" header="Target" key="target">
              <CodeMirror
                value={resource.target.data}
                options={{
                  readOnly: true,
                  theme: 'duotone-light',
                  lineNumbers: true,
                  lineWrapping: true,
                }}
                onBeforeChange={() => {}}
              />
            </Panel>
          )}
        </Collapse>
      </div>
    </div>
  );
};

export default SimCampaignConfig;
