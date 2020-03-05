import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { DEFAULT_SPARQL_VIEW_ID, NexusClient } from '@bbp/nexus-sdk';

import { SimulationCampaignResource, Simulation } from '../types';

import { parseUrl, mapSparqlResults } from '../../../common';
import SimulationList from '../components/simulation-list';

interface SimulationListContainerProps {
  resource: SimulationCampaignResource;
  nexus: NexusClient;
  goToResource?: (selfUrl: string) => void;
}

function getSimulationsQuery(resourceId: string) {
  return `
    prefix nxs: <https://neuroshapes.org/>
    prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/>
    prefix schema: <http://schema.org/>
    prefix nexus: <https://bluebrain.github.io/nexus/vocabulary/>
    prefix prov: <http://www.w3.org/ns/prov#>

    SELECT DISTINCT ?name ?self ?startedAtTime ?endedAtTime ?status ?job_id ?path ?ca ?depolarization

    WHERE {
      ?simulation prov:wasInformedBy <${resourceId}> .
      ?simulation nexus:self ?self .
      OPTIONAL { ?simulation schema:name ?name }
      OPTIONAL { ?simulation nxv:project ?project }
      OPTIONAL { ?simulation nxs:status ?status }
      OPTIONAL { ?simulation nxs:job_id ?job_id }
      OPTIONAL { ?simulation prov:startedAtTime ?startedAtTime }
      OPTIONAL { ?simulation prov:endedAtTime ?endedAtTime }
      OPTIONAL { ?simulation nxs:ca ?ca }
      OPTIONAL { ?simulation nxs:depolarization ?depolarization }
    }
  `;
}

const sparqlMapperConf = {
  mappings: [
    {
      source: 'job_id',
      target: 'jobId',
    },
    {
      source: 'name',
      target: 'name',
    },
    {
      source: 'status',
      target: 'status',
    },
    {
      source: 'startedAtTime',
      target: 'startedAtTime',
    },
    {
      source: 'endedAtTime',
      target: 'endedAtTime',
    },
    {
      source: 'ca',
      target: 'ca',
    },
    {
      source: 'depolarization',
      target: 'depolarization',
    },
    {
      source: 'self',
      target: 'self',
    },
  ],
};

const SimulationListContainer = (props: SimulationListContainerProps) => {
  const { resource, nexus, goToResource } = props;

  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  const query = getSimulationsQuery(resource['@id']);
  const { org, project } = parseUrl(resource._project);

  useEffect(() => {
    nexus.View.sparqlQuery(org, project, DEFAULT_SPARQL_VIEW_ID, query).then(
      sparqlQueryResult => {
        const simulations = mapSparqlResults(
          sparqlQueryResult as any,
          sparqlMapperConf
        ) as Simulation[];

        setSimulations(simulations);
        setLoading(false);
      }
    );
  }, []);

  return (
    <Spin spinning={loading}>
      {simulations.length && (
        <SimulationList simulations={simulations} goToResource={goToResource} />
      )}
    </Spin>
  );
};

export default SimulationListContainer;
