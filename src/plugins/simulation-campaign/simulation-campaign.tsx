
import React from 'react';
import { NexusClient } from '@bbp/nexus-sdk';

import { SimulationCampaignResource } from './types';

import BasicInfoComponent from './components/basic-info';

import SimulationListContainer from './containers/simulation-list';
import CircuitContainer from './containers/circuit';
import SimWriterConfigContainer from './containers/sim-writer-config';
import AnalysisCarouselContainer from './containers/analysis-carousel';
import AnalysisPdf from './containers/analysis-pdf';


interface SimulationCampaignContainerProps {
  resource: SimulationCampaignResource;
  nexus: NexusClient;
  goToResource?: (selfUrl: string) => void;
}

const SimulationCampaignContainer = (
  props: SimulationCampaignContainerProps
) => {
  const { resource, nexus } = props;

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
      <BasicInfoComponent resource={props.resource} />

      {simWriterConfigId &&
        <SimWriterConfigContainer
          resourceId={simWriterConfigId}
          nexus={nexus}
        />
      }

      {circuitId &&
        <CircuitContainer
          resourceId={circuitId}
          nexus={nexus}
          goToResource={props.goToResource}
        />
      }

      <AnalysisCarouselContainer
        resource={props.resource}
        nexus={nexus}
        goToResource={props.goToResource}
      />

      <AnalysisPdf resource={props.resource} nexus={nexus} />

      <SimulationListContainer
        resource={props.resource}
        nexus={nexus}
        goToResource={props.goToResource}
      />
    </div>
  );
};


export default SimulationCampaignContainer;
