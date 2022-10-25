import React from 'react';

import { SimulationCampaignResource as SimCampaignResource } from './types';

import BasicInfoComponent from './components/basic-info';

import SimListContainer from './containers/sim-list';
import CircuitContainer from './containers/circuit';
import { SimCampaignConfigContainer, parseUrl } from '../../common';
import SimAnalysisCarouselContainer from './containers/sim-analysis-carousel';
import AnalysisPdfContainer from './containers/analysis-pdf';
import CampAnalysisContainer from './containers/camp-analysis/camp-analysis';

interface SimCampaignContainerProps {
  resource: SimCampaignResource;
  goToResource?: (selfUrl: string) => void;
}

const SimCampaignContainer = (props: SimCampaignContainerProps) => {
  const { resource } = props;

  const { org, project } = parseUrl(resource._project);

  const circuitEntry = (resource.used || []).find(
    entry => entry['@type'] === 'DetailedCircuit'
  );

  const circuitId = circuitEntry && circuitEntry['@id'];

  const simCampaignConfigEntry = (resource.used || []).find(
    entry => entry['@type'] === 'SimCampaignConfiguration'
  );

  const simCampaignConfigId = simCampaignConfigEntry && simCampaignConfigEntry['@id'];

  return (
    <div className="simulation-campaign-container">
      <BasicInfoComponent resource={resource} />

      {simCampaignConfigId && (
        <SimCampaignConfigContainer
          org={org}
          project={project}
          resourceId={simCampaignConfigId}
        />
      )}

      {circuitId && (
        <CircuitContainer
          resourceId={circuitId}
          goToResource={props.goToResource}
        />
      )}

      {resource['@id'] ===
        'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/studio_data/_/SimulationCampaignNexusTask_entity_managemen_https___staging___gpfs_bbp_cscs_c_b760eab0fc' && (
        <CampAnalysisContainer simId="dummy" />
      )}

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
