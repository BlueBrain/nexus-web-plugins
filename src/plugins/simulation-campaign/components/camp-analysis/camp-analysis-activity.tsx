import React, { FunctionComponent, ReactNode } from 'react';
import { Divider, Row, Col } from 'antd';
import moment from 'moment';

import get from 'lodash/get';
import startCase from 'lodash/startCase';
import upperFirst from 'lodash/upperFirst';

import { CampaignAnalysisResource } from '../../types';
import { ActivityStatus, CopyBtn } from '../../../../common';

import './camp-analysis-activity.css';

interface CampAnalysisActivityProps {
  analysis: CampaignAnalysisResource;
  configBtn: ReactNode;
  footer?: ReactNode;
  reportPreview?: ReactNode;
}

const TIME_FORMAT = 'DD/MM/YY HH:mm';

const CampAnalysisActivity: FunctionComponent<CampAnalysisActivityProps> = props => {
  const { analysis, configBtn, footer, reportPreview } = props;

  const rawName = get(analysis, '@id', '')
    .split('/')
    .slice(-1)[0]
    .split('_')[0];

  const name = upperFirst(startCase(rawName).toLowerCase());

  const started = moment(analysis.startedAtTime).format(TIME_FORMAT);
  const ended = analysis.endedAtTime
    ? moment(analysis.endedAtTime).format(TIME_FORMAT)
    : '-';

  return (
    <div className="camp-analysis-activity">
      <div className="info">
        <Row>
          <Col span={16} className="ellipsis">
            <strong>{name}</strong>
          </Col>
          <Col span={8} className="text-right">
            <ActivityStatus status={analysis.status} />
          </Col>
        </Row>

        <p className="ellipsis">Detailed description</p>

        <div className="mt time-block">
          <Row>
            <Col span={12}>
              <strong>Started:</strong>
            </Col>
            <Col span={12} className="text-right">
              {started}
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <strong>Ended:</strong>
            </Col>
            <Col span={12} className="text-right">
              {ended}
            </Col>
          </Row>
        </div>

        <Row className="mt">
          <Col span={15}>{configBtn}</Col>
          <Col span={9} className="text-right">
            <CopyBtn block label="Id" text={analysis['@id']} />
          </Col>
        </Row>

        <Divider className="ant-divider-small" />

        <div className="text-right">{footer}</div>
      </div>

      {reportPreview && (
        <div className="report-preview-container-outer">
          <div className="report-preview-container-inner">{reportPreview}</div>
        </div>
      )}
    </div>
  );
};

export default CampAnalysisActivity;
