
import React from 'react';
import { Collapse, Card } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import prettyJsonStringify from 'json-stringify-pretty-compact';

import { SimWriterConfigResource } from '../types';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/shell/shell';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-light.css';

import './sim-writer-config.css';


interface SimWriterConfigProps {
  resource: SimWriterConfigResource;
}

const { Panel } = Collapse;

const SimWriterConfig = (props: SimWriterConfigProps) => {
  return (
    <div>
      <div className="mt">
        <Card className="card--no-padding" title="SimWriter configuration">
          <div className="config-info-container">
            <p>
              <strong>Name: </strong> {props.resource.name}
            </p>
            <p>
              <strong>Description: </strong> {props.resource.description}
            </p>
          </div>
        </Card>
      </div>

      <div className="mt">
        <Collapse>
          <Panel
            className="panel--no-padding"
            header="Config"
            key="simWriterConfig"
          >
            <CodeMirror
              value={prettyJsonStringify(props.resource.configuration.data, {
                indent: '  ',
                maxLength: 80
              })}
              options={{
                mode: { name: 'javascript', json: true },
                readOnly: true,
                theme: 'base16-light',
                lineNumbers: true,
                lineWrapping: true
              }}
              onBeforeChange={() => {}}
            />
          </Panel>
          {props.resource.template.data &&
            <Panel className="panel--no-padding" header="Template" key="template">
              <CodeMirror
                value={props.resource.template.data}
                options={{
                  mode: { name: 'shell' },
                  readOnly: true,
                  theme: 'base16-light',
                  lineNumbers: true,
                  lineWrapping: true
                }}
                onBeforeChange={() => {}}
              />
            </Panel>
          }
          {props.resource.target && props.resource.target.data && (
            <Panel className="panel--no-padding" header="Target" key="target">
              <CodeMirror
                value={props.resource.target.data}
                options={{
                  readOnly: true,
                  theme: 'base16-light',
                  lineNumbers: true,
                  lineWrapping: true
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

export default SimWriterConfig;