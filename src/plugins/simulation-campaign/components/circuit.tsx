import React from 'react';
import get from 'lodash/get';
import { Collapse, Input, Button } from 'antd';

import { Copy, DetailedCircuitResource } from "../../../common";

interface CircuitProps {
  resource: DetailedCircuitResource;
  goToResource?: (selfUrl: string) => void;
}

const { Panel } = Collapse;

function DetailedCircuit(props: CircuitProps) {
  const { resource, goToResource } = props;
  const brainRegion = get(resource, 'brainLocation.brainRegion', {}) as {
    label: string;
    id: string;
  };

  const baseCircuitPath = get(resource, 'circuitBase.url', '').replace(
    'file://',
    ''
  );

  return (
    <div className="mt">
      <Collapse>
        <Panel header={`Circuit: ${resource.name}`} key="circuit">
          <div className="p">
            <p>
              Name:
              <Button
                type="link"
                size="small"
                onClick={() => goToResource && goToResource(resource._self)}
              >
                {resource.name}
              </Button>
            </p>

            <p>
              Species:{' '}
              {resource.speciesLabel ? (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={resource.speciesId}
                >
                  {resource.speciesLabel}
                </a>
              ) : (
                'NA'
              )}
            </p>

            <p>
              Brain region:{' '}
              {brainRegion.label ? (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={brainRegion.id}
                >
                  {brainRegion.label}
                </a>
              ) : (
                'NA'
              )}
            </p>

            <p>Description: {resource.description || 'NA'}</p>

            <Input
              className="mt"
              readOnly
              addonBefore="Base circuit path"
              addonAfter={
                <Copy
                  textToCopy={baseCircuitPath}
                  render={(copySuccess, triggerCopy) => (
                    <Button
                      block
                      type="link"
                      size="small"
                      icon="copy"
                      onClick={() => triggerCopy()}
                    >
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </Button>
                  )}
                />
              }
              defaultValue={baseCircuitPath}
            />
          </div>
        </Panel>
      </Collapse>
    </div>
  );
}

export default DetailedCircuit;
