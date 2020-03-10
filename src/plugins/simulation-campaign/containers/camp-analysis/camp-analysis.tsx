import React, { useContext } from 'react';
import { Icon } from 'antd';

import CampAnalysisActivityContainer from './camp-analysis-activity';
import { NexusClientContext } from '../../../../common';

import CampAnalysis from '../../components/camp-analysis/camp-analysis';
import CampAnalysisBlock from '../../components/camp-analysis/camp-analysis-block';

interface CampAnalysisContainerProps {
  simId: string;
  goToResource?: (selfUrl: string) => void;
}

const CampAnalysisContainer = (props: CampAnalysisContainerProps) => {
  const nexus = useContext(NexusClientContext);

  const analysisList = [
    [
      'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/studio_data/_/PairwiseCorrelations_entity_managemen_seed____data______typ_6a59ab5355',
      'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/studio_data/_/CorrelationsToRichClub_entity_managemen____data______typ_4766bceb31',
      'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/studio_data/_/PlotRichClubCurve_entity_managemen____data______typ_4d123fdf89',
    ],
    [
      'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/studio_data/_/PairwiseCorrelations_entity_managemen_seed____data______typ_6a59ab5355',
      'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/studio_data/_/CorrelationsToRichClub_entity_managemen____data______typ_4766bceb31',
      'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/studio_data/_/PlotRichClubCurve_entity_managemen____data______typ_4d123fdf89',
    ],
  ];

  return (
    <CampAnalysis>
      {analysisList.map((analysisReportIds, idx) => (
        <CampAnalysisBlock key={idx}>
          {analysisReportIds.map((analysisReportId, analysisReportIdx) => (
            <span key={analysisReportId}>
              <CampAnalysisActivityContainer
                analysisReportId={analysisReportId}
              />
              {analysisReportIdx < analysisReportIds.length - 1 && (
                <Icon
                  type="arrow-right"
                  style={{
                    marginLeft: '0.6em',
                    marginRight: '0.6em',
                  }}
                />
              )}
            </span>
          ))}
        </CampAnalysisBlock>
      ))}
    </CampAnalysis>
  );
};

export default CampAnalysisContainer;
