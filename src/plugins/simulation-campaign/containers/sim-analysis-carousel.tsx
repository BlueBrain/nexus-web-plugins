import React, { useState, useEffect, useContext } from 'react';
import groupBy from 'lodash/groupBy';
import { DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';

import {
  parseUrl,
  mapSparqlResults,
  NexusClientContext,
} from '../../../common';
import { SimulationCampaignResource } from '../types';

import SimulationAnalysisCarousel from '../components/sim-analysis-carousel';
import SimulationAnalysisBlock from './sim-analysis-block';

interface SimAnalysisReport {
  simulationId: string;
  simulationSelf: string;
  analysisId: string;
  analysisName: string;
  analysisDescription: string;
  imageUrl: string;
}

interface SimAnalysisCarouselContainerProps {
  resource: SimulationCampaignResource;
  goToResource?: (selfUrl: string) => void;
}

const sparqlMapperConfig = {
  mappings: [
    {
      source: 'simulationId',
      target: 'simulationId',
    },
    {
      source: 'simulationSelf',
      target: 'simulationSelf',
    },
    {
      source: 'simulationDescription',
      target: 'simulationDescription',
    },
    {
      source: 'analysisName',
      target: 'analysisName',
    },
    {
      source: 'analysisId',
      target: 'analysisId',
    },
    {
      source: 'analysisDescription',
      target: 'analysisDescription',
    },
    {
      source: 'imageUrl',
      target: 'imageUrl',
    },
  ],
};

function getQuery(resourceId: string) {
  return `
    prefix schema: <http://schema.org/>
    prefix prov: <http://www.w3.org/ns/prov#>
    prefix nexus: <https://bluebrain.github.io/nexus/vocabulary/>

    SELECT DISTINCT ?simulationId ?simulationSelf ?simulationDescription ?analysisId ?analysisName ?analysisDescription ?imageUrl
    WHERE {
      ?simulationId prov:wasInformedBy <${resourceId}> .
      ?simulationId nexus:self ?simulationSelf .
      OPTIONAL {?simulationId schema:description ?simulationDescription} .
      ?variableReportId prov:wasGeneratedBy ?simulationId .
      ?analysisId  prov:used ?variableReportId .
      ?analysisReportId prov:wasGeneratedBy ?analysisId .
      ?analysisReportId schema:distribution / schema:contentUrl ?imageUrl .
      OPTIONAL {?analysisReportId schema:description ?analysisDescription} .
      OPTIONAL {?analysisReportId schema:name ?analysisName} .
    }
  `;
}

const SimAnalysisCarouselContainer = (
  props: SimAnalysisCarouselContainerProps
) => {
  const { resource } = props;
  const nexus = useContext(NexusClientContext);

  const { org, project } = parseUrl(resource._project);

  const query = getQuery(resource['@id']);

  const [reportsGrouped, setReportsGrouped] = useState<{
    [reportId: string]: any;
  }>({});
  const [simulationIds, setSimulationIds] = useState<string[]>([]);

  useEffect(() => {
    nexus.View.sparqlQuery(org, project, DEFAULT_SPARQL_VIEW_ID, query).then(
      sparqlQueryData => {
        const reports = mapSparqlResults(
          sparqlQueryData as any,
          sparqlMapperConfig
        ) as SimAnalysisReport[];

        const reportsGrouped = groupBy(reports, 'simulationId');
        setReportsGrouped(reportsGrouped);
        const simulationIds = Array.from(new Set(Object.keys(reportsGrouped)));
        setSimulationIds(simulationIds);
      }
    );
  }, []);

  return simulationIds.length ? (
    <SimulationAnalysisCarousel>
      {simulationIds.map(simulationId => (
        <SimulationAnalysisBlock
          analysisReports={reportsGrouped[simulationId]}
          key={simulationId}
          goToResource={props.goToResource}
        />
      ))}
    </SimulationAnalysisCarousel>
  ) : (
    <div />
  );
};

export default SimAnalysisCarouselContainer;
