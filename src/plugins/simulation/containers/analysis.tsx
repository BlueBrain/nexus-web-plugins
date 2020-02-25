
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import { DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';
import { NexusClient } from '@bbp/nexus-sdk';

import { parseUrl, mapSparqlResults, NexusImage } from '../../../common';
import { SimulationResource } from '../types';

import './analysis.css';


interface AnalysisReport {
  name: string;
  description: string;
  imageUrl: string;
}

interface AnalysisContainerProps {
  resource: SimulationResource;
  nexus: NexusClient;
}

function getQuery(id: string) {
  return `
    prefix schema: <http://schema.org/>
    prefix prov: <http://www.w3.org/ns/prov#>

    SELECT ?analysis ?imageUrl ?name ?description
    WHERE {
        ?analysis prov:used <${id}> ;
        prov:generated / schema:distribution / schema:contentUrl ?imageUrl ;
        prov:generated / schema:name ?name ;
        prov:generated / schema:description ?description
    }
  `;
}

const sparqlMapperConfig = {
  mappings: [
    {
      source: 'imageUrl',
      target: 'imageUrl'
    },
    {
      source: 'name',
      target: 'name'
    },
    {
      source: 'description',
      target: 'description'
    }
  ]
};

const AnalysisContainer = (props: AnalysisContainerProps) => {
  const { resource, nexus } = props;

  const variableReportId = resource.generated['@id'];
  const [reports, setReports] = useState<AnalysisReport[]>([]);

  const query = getQuery(variableReportId);

  const { org, project } = parseUrl(resource._project);

  useEffect(() => {
    nexus.View.sparqlQuery(org, project, DEFAULT_SPARQL_VIEW_ID, query).then(
      viewData => {
        const reports = mapSparqlResults(
          viewData as any,
          sparqlMapperConfig
        ) as AnalysisReport[];

        setReports(reports);
      }
    );
  }, []);

  return (
    <div className="mt">
      <h3>Simulation overview plots</h3>
      <Row gutter={16}>
        {reports.map(report => (
          <Col span={8} className="analysis-image-column" key={report.imageUrl}>
            <h4>{report.name}</h4>
            <p>{report.description}</p>
            <NexusImage nexus={nexus} imageUrl={report.imageUrl} />
          </Col>
        ))}
      </Row>
    </div>
  );
};


export default AnalysisContainer;