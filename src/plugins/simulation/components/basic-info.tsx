import React from 'react';
import moment from 'moment';
import { Badge, Input, Button, Row, Col } from 'antd';
import { NexusClient } from '@bbp/nexus-sdk';

import {
  Copy,
  BraynsBtn,
  JupyterNotebookBtn,
  PairRecordingBtn,
} from "../../../common";
import { SimulationResource } from '../types';

interface BadgeStatus {
  [simStatus: string]:
    | 'default'
    | 'processing'
    | 'error'
    | 'success'
    | 'warning';
}

interface BasicInfoProps {
  resource: SimulationResource;
  nexus: NexusClient;
}

const badgeStatus: BadgeStatus = {
  Pending: 'default',
  Running: 'processing',
  Failed: 'error',
  Done: 'success',
};

function BasicInfo(props: BasicInfoProps) {
  const { resource, nexus } = props;
  const { status } = resource;

  const startedAtTime = moment(resource.startedAtTime).format('L HH:mm');
  const endedAtTime = resource.endedAtTime
    ? moment(resource.endedAtTime).format('L HH:mm')
    : '-';

  const blueConfigPath = `${resource.path}/BlueConfig`;

  const projMatch = blueConfigPath.match(/(proj\d{1,3})/);
  const proj = projMatch ? projMatch[1] : null;

  return (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <div className="white-box">
            <strong className="mr">Started:</strong>
            <span>{startedAtTime}</span>
          </div>
        </Col>
        <Col span={8}>
          <div className="white-box">
            <strong className="mr">Ended:</strong>
            <span className="float-right">{endedAtTime}</span>
          </div>
        </Col>
        <Col span={8}>
          <div className="white-box">
            <strong className="mr">Status:</strong>
            <span className="float-right">
              <Badge status={badgeStatus[status]} text={status} />
            </span>
          </div>
        </Col>
      </Row>

      <Input
        className="mt"
        readOnly
        addonBefore="BlueConfig"
        addonAfter={
          <Copy
            textToCopy={blueConfigPath}
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
        defaultValue={blueConfigPath}
      />

      <h3 className="mt">Actions</h3>

      <PairRecordingBtn
        className="mr"
        name={blueConfigPath}
        configPath={blueConfigPath}
      />

      {proj && (
        <BraynsBtn className="mr" account={proj} configPath={blueConfigPath} />
      )}

      {proj && (
        <JupyterNotebookBtn path={resource.path} account={proj} nexus={nexus} />
      )}
    </div>
  );
}

export default BasicInfo;
