import React, { useContext } from 'react';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import { Button } from 'antd';
import Icon from '@ant-design/icons';

import { NexusImage, NexusClientContext } from "../../../common";
import SimAnalysisBlock from '../components/sim-analysis-block';

interface SimAnalysisReport {
  simulationId: string;
  simulationDescription: string;
  analysisId: string;
  analysisName: string;
  analysisDescription: string;
  imageUrl: string;
  org: string;
  project: string;
}

interface SimAnalysisBlockContainerProps {
  analysisReports: SimAnalysisReport[];
  goToResource?: (selfUrl: string) => void;
}

function SimAnalysisBlockContainer(props: SimAnalysisBlockContainerProps) {
  const { analysisReports, goToResource } = props;
  const nexus = useContext(NexusClientContext);

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
    <SimAnalysisBlock>
      {sortedReports.map(report => (
        <NexusImage
          imageUrl={report.imageUrl}
          org={report.org}
          project={report.project}
          nexus={nexus}
          key={report.analysisId}
        />
      ))}

      {params.length
        ? params.map((param: string) => <p key={param}>{param}</p>)
        : ''}

      <div className="text-center mt">
        <Button onClick={() => goToResource && goToResource(simulationSelf! as string)}>
          <Icon type="more" />
        </Button>
      </div>
    </SimAnalysisBlock>
  );
}

export default SimAnalysisBlockContainer;
