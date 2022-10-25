import * as React from 'react';
import { Button, Input, Row, Col } from 'antd';
import get from 'lodash/get';
import { NexusClient } from '@bbp/nexus-sdk';
import { CopyOutlined} from '@ant-design/icons';

import './circuit.css';

import { DetailedCircuitResource } from './types';
import {
  Copy,
  CopyBtn,
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

  const circuitConfigPath = get(resource, 'circuitConfigPath.url', '').replace(
    'file://',
    ''
  );

  const projMatch = circuitConfigPath.match(/(proj\d{1,3})/);
  const proj = projMatch ? projMatch[1] : null;

  return (
    <div>
      <Row gutter={12}>
        <Col span={16}>
          <strong>Circuit type:</strong> {resource.circuitType || 'NA'}
        </Col>
        <Col className="text-right" span={8}>
          <CopyBtn text={resource._self} label="URL" />
        </Col>
      </Row>

      <Input
        className="mt"
        readOnly
        addonBefore="Circuit config path"
        addonAfter={
          <Copy
            textToCopy={circuitConfigPath || ''}
            render={(copySuccess, triggerCopy) => (
              <Button
                block
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => triggerCopy()}
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </Button>
            )}
          />
        }
        defaultValue={circuitConfigPath || ''}
      />
      {circuitConfigPath ? (
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

          <JupyterNotebookBtn path={circuitConfigPath} account={proj} nexus={nexus} />
        </div>
      ) : (
        <h3 className="mt">No actions available due to missing circuit path</h3>
      )}
    </div>
  );
};

export default Circuit;
