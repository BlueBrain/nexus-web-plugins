
import React, { useState, useEffect } from 'react';
import get from 'lodash/get';
import { Spin } from 'antd';
import { DEFAULT_SPARQL_VIEW_ID, NexusClient } from '@bbp/nexus-sdk';

import { parseUrl, DetailedCircuitResource } from '../../../common';
import Circuit from '../components/circuit';


interface CircuitContainerProps {
  resourceId: string;
  nexus: NexusClient;
  goToResource?: (selfUrl: string) => void;
}

function getQuery(resourceId: string) {
  return `
    prefix nxs: <https://neuroshapes.org/>
    prefix schema: <http://schema.org/>

    SELECT DISTINCT ?baseCircuitPath ?speciesLabel ?speciesId
    WHERE {
      OPTIONAL { <${resourceId}> nxs:edgeCollection / nxs:edgePopulation / schema:distribution / schema:url ?baseCircuitPath }
      OPTIONAL { <${resourceId}> nxs:subject / nxs:species ?speciesId }
      OPTIONAL { <${resourceId}> nxs:subject / nxs:species / rdfs:label ?speciesLabel }
    }
  `;
}

const CircuitContainer = (props: CircuitContainerProps) => {
  const { resourceId, nexus, goToResource } = props;

  const query = getQuery(resourceId);

  const [resource, setResource] = useState<DetailedCircuitResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const addBasicInfo = (resource: DetailedCircuitResource) => {
      const { org, project } = parseUrl(resource._project);
      return nexus.View.sparqlQuery(
        org,
        project,
        DEFAULT_SPARQL_VIEW_ID,
        query
      ).then(basicInfo => {
        const baseCircuitPath = get(
          basicInfo,
          'results.bindings[0].baseCircuitPath.value',
          ''
        ) as string;
        const speciesLabel = get(
          basicInfo,
          'results.bindings[0].speciesLabel.value',
          ''
        ) as string;
        const speciesId = get(
          basicInfo,
          'results.bindings[0].speciesId.value',
          ''
        ) as string;
        return { ...resource, ...{ baseCircuitPath, speciesLabel, speciesId } };
      });
    };

    nexus
      .httpGet({ path: props.resourceId })
      .then(addBasicInfo)
      .then(resource => setResource(resource))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Spin spinning={loading}>
      {resource && <Circuit resource={resource} goToResource={goToResource}/>}
    </Spin>
  );
};


export default CircuitContainer;
