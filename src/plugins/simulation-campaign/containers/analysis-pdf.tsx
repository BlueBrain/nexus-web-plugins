
import React, { useEffect, useState } from 'react';
import get from 'lodash/get';
import { DEFAULT_SPARQL_VIEW_ID, NexusClient } from '@bbp/nexus-sdk';

import { parseUrl, mapSparqlResults } from '../../../common';
import { SimulationCampaignResource } from '../types';

import AnalysisPdf from '../components/analysis-pdf';


interface AnalysisPdfContainerProps {
  resource: SimulationCampaignResource;
  nexus: NexusClient;
}

const sparqlMapperConfig = {
  mappings: [
    {
      source: 'pdfUrl',
      target: 'pdfUrl'
    }
  ]
};

function getQuery(resourceId: string) {
  return `
    prefix schema: <http://schema.org/>
    prefix prov: <http://www.w3.org/ns/prov#>
    prefix nexus: <https://bluebrain.github.io/nexus/vocabulary/>
    prefix nxs: <https://neuroshapes.org/>

    SELECT DISTINCT ?pdfUrl
    WHERE {
      ?campaignAnalysisId nxs:wasInformedBy <${resourceId}> .
      ?campaignAnalysisId prov:generated / schema:distribution / schema:contentUrl ?pdfUrl .
    }
  `;
}

const AnalysisPdfContainer = (props: AnalysisPdfContainerProps) => {
  const { resource, nexus } = props;

  const query = getQuery(resource['@id']);
  const { org, project } = parseUrl(resource._project);

  const [src, setSrc] = useState<string | null>(null);

  const extractPdfUrl = (sparqlData: any) =>
    get(mapSparqlResults(sparqlData, sparqlMapperConfig), '[0].pdfUrl');

  const downloadPdf = (url: string) =>
    url
      ? nexus.File.get(org, project, encodeURIComponent(url), { as: 'blob' })
      : null;

  const createSrc = (blob: any) => (blob ? URL.createObjectURL(blob) : null);

  useEffect(() => {
    nexus.View.sparqlQuery(org, project, DEFAULT_SPARQL_VIEW_ID, query)
      .then(extractPdfUrl)
      .then(downloadPdf)
      .then(createSrc)
      .then(src => setSrc(src));
  }, []);

  return src ? <AnalysisPdf src={src} /> : <div />;
};


export default AnalysisPdfContainer;
