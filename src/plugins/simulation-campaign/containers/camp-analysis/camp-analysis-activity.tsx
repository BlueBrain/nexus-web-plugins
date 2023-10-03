import React, { useState, useEffect, useContext } from 'react';

import {
  FilePreviewBtn,
  NexusClientContext,
  isViewable,
  FileDownloadBtn,
  FileViewer,
  distributionFormatLabel,
} from "../../../../common";
import {
  CampaignAnalysisResource as Analysis,
  CampaignAnalysisConfigResource as Config,
  CampaignAnalysisReportResource as Report,
} from '../../types';


import CampAnalysisActivity from '../../components/camp-analysis/camp-analysis-activity';

interface CampAnalysisActivityProps {
  analysisReportId: string;
  goToResource?: (selfUrl: string) => void;
}

function CampAnalysisActivityContainer(props: CampAnalysisActivityProps) {
  const { analysisReportId } = props;
  const nexus = useContext(NexusClientContext);

  const [, setLoading] = useState(true);

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [configResource, setConfigResource] = useState<Config | null>(null);
  const [analysisReport, setAnalysisReport] = useState<Report | null>(null);

  const fetchConfigResource = (analysis: Analysis) => {
    const configResourceId = analysis.used['@id'];
    return nexus.httpGet({ path: configResourceId });
  };

  const fetchData = async () => {
    const analysisReport: Report = await nexus.httpGet({
      path: analysisReportId,
    });
    setAnalysisReport(analysisReport);

    const analysisId = analysisReport.wasGeneratedBy['@id'];
    const analysis: Analysis = await nexus.httpGet({ path: analysisId });
    setAnalysis(analysis);

    const configResource = await fetchConfigResource(analysis);
    setConfigResource(configResource);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const footer = analysisReport?.distribution ? (
    <FileDownloadBtn distribution={analysisReport.distribution} icon="download">
      {distributionFormatLabel(analysisReport.distribution)}
    </FileDownloadBtn>
  ) : null;

  const reportPreview =
    analysisReport?.distribution && isViewable(analysisReport?.distribution) ? (
      <FileViewer
        mainDistribution={analysisReport.distribution}
        previewDistribution={analysisReport?.image}
      />
    ) : null;

  const configBtn = configResource ? (
    <FilePreviewBtn distribution={configResource.distribution}>
      Show config
    </FilePreviewBtn>
  ) : null;

  return analysis && configResource ? (
    <CampAnalysisActivity
      analysis={analysis}
      configBtn={configBtn}
      footer={footer}
      reportPreview={reportPreview}
    />
  ) : (
    <span>Loading</span>
  );
}

export default CampAnalysisActivityContainer;
