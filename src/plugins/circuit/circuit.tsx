import * as React from 'react';
import { Button, Input } from 'antd';
import get from 'lodash/get';
import { NexusClient } from '@bbp/nexus-sdk';

import './circuit.css';

import { DetailedCircuitResource } from './types';
import {
  Copy,
  BraynsBtn,
  JupyterNotebookBtn,
  PairRecordingBtn,
} from '../../common/';

export interface CircuitProps {
  resource: DetailedCircuitResource;
  nexus: NexusClient;
}

export const Circuit = (props: CircuitProps) => {
  const { resource, nexus } = props;

  console.log({ props });

  const circuitBase = get(resource, 'circuitBase.url', '').replace(
    'file://',
    ''
  );
  const circuitConfigPath = `${circuitBase}/CircuitConfig`;

  const projMatch = circuitBase.match(/(proj\d{1,3})/);
  const proj = projMatch ? projMatch[1] : null;

  return (
    <div>
      <p>
        <strong>Circuit type:</strong> {resource.circuitType || 'NA'}
      </p>
      <Input
        className="mt"
        readOnly
        addonBefore="Base circuit path"
        addonAfter={
          <Copy
            textToCopy={circuitBase || ''}
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
        defaultValue={circuitBase || ''}
      />
      {circuitBase ? (
        <div>
          <h3 className="mt">Actions</h3>

          {
            // TODO change type of name to string | undefined?
          }
          {resource.circuitType && (
            <PairRecordingBtn
              className="mr"
              name={resource.circuitType}
              configPath={circuitConfigPath}
            />
          )}

          <BraynsBtn
            className="mr"
            account={proj}
            configPath={circuitConfigPath}
          />

          <JupyterNotebookBtn path={circuitBase} account={proj} nexus={nexus} />
        </div>
      ) : (
        <h3 className="mt">No actions available due to missing circuit path</h3>
      )}
    </div>
  );
};

export default Circuit;
