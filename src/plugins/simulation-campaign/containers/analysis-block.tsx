import React from 'react';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import { Button, Icon } from 'antd';

import { NexusClient } from '@bbp/nexus-sdk';

import { NexusImage } from '../../../common';
import SimulationAnalysisBlock from '../components/analysis-block';

interface AnalysisReport {
  simulationId: string;
  simulationDescription: string;
  analysisId: string;
  analysisName: string;
  analysisDescription: string;
  imageUrl: string;
}

interface AnalysisBlockContainerProps {
  analysisReports: AnalysisReport[];
  nexus: NexusClient;
  goToResource?: (selfUrl: string) => void;
}

const AnalysisBlockContainer = (props: AnalysisBlockContainerProps) => {
  const { analysisReports, nexus, goToResource } = props;

  const params = get(analysisReports, '[0].simulationDescription', '')
    .replace(/=/g, ':')
    .split(' ')
    .filter(Boolean);

  const sortedReports = sortBy(analysisReports, [
    'analysisName',
    'analysisDescription',
  ]);

  const simulationSelf = get(props.analysisReports, '[0].simulationSelf');

  return (
    <SimulationAnalysisBlock>
      {sortedReports.map(report => (
        <NexusImage
          imageUrl={report.imageUrl}
          nexus={nexus}
          key={report.analysisId}
        />
      ))}
      {params.length ? params.map((param: string) => <p>{param}</p>) : ''}
      <div className="text-center mt">
        <Button onClick={() => goToResource && goToResource(simulationSelf)}>
          <Icon type="more" />
        </Button>
      </div>
    </SimulationAnalysisBlock>
  );
};

export default AnalysisBlockContainer;
