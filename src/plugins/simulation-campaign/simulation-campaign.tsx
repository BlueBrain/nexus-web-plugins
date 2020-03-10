import React from 'react';

import { SimulationCampaignResource as SimCampaignResource } from './types';

import BasicInfoComponent from './components/basic-info';

import SimListContainer from './containers/sim-list';
import CircuitContainer from './containers/circuit';
import SimWriterConfigContainer from './containers/sim-writer-config';
import SimAnalysisCarouselContainer from './containers/sim-analysis-carousel';
import AnalysisPdfContainer from './containers/analysis-pdf';
import CampAnalysisContainer from './containers/camp-analysis/camp-analysis';


interface SimCampaignContainerProps {
  resource: SimCampaignResource;
  goToResource?: (selfUrl: string) => void;
}

const SimCampaignContainer = (
  props: SimCampaignContainerProps
) => {
  const { resource } = props;

  const circuitEntry = (resource.used || []).find(
    entry => entry['@type'] === 'DetailedCircuit'
  );

  const circuitId = circuitEntry && circuitEntry['@id'];

  const simWriterConfigEntry = (resource.used || []).find(
    entry => entry['@type'] === 'SimWriterConfiguration'
  );

  const simWriterConfigId = simWriterConfigEntry && simWriterConfigEntry['@id'];

  return (
    <div className="simulation-campaign-container">
      <BasicInfoComponent resource={resource} />

      {simWriterConfigId &&
        <SimWriterConfigContainer
          resourceId={simWriterConfigId}
        />
      }

      {circuitId &&
        <CircuitContainer
          resourceId={circuitId}
          goToResource={props.goToResource}
        />
      }

      <CampAnalysisContainer simId="dummy" />

      <SimAnalysisCarouselContainer
        resource={props.resource}
        goToResource={props.goToResource}
      />

      <AnalysisPdfContainer resource={props.resource} />

      <SimListContainer
        resource={props.resource}
        goToResource={props.goToResource}
      />
    </div>
  );
};


export default SimCampaignContainer;
