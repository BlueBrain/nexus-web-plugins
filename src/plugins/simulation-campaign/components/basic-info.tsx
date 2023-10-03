import React from 'react';
import moment from 'moment';
import { Row, Col } from 'antd';

import { ActivityStatus } from "../../../common";
import { SimulationCampaignResource } from '../types';

interface BasicInfoProps {
  resource: SimulationCampaignResource;
}

function BasicInfo(props: BasicInfoProps) {
  const { resource } = props;

  const startedAtTime = moment(resource.startedAtTime).format('L HH:mm');
  const endedAtTime = resource.endedAtTime
    ? moment(resource.endedAtTime).format('L HH:mm')
    : '-';

  const { status } = resource;

  return (
    <div className="mt">
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
              <ActivityStatus status={status} />
            </span>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default BasicInfo;
