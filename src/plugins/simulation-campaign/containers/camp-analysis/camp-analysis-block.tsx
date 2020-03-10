import React, { useState, useEffect, useContext } from 'react';

import { NexusClientContext } from '../../../../common';

interface CampAnalysisBlockProps {
  campaignAnalisysActivitySelfs: string[];
  goToResource?: (selfUrl: string) => void;
}

const CampAnalysisBlock = (props: CampAnalysisBlockProps) => {
  const { campaignAnalisysActivitySelfs, goToResource } = props;
  const nexus = useContext(NexusClientContext);

  return <span>test</span>;
};

export default CampAnalysisBlockProps;
