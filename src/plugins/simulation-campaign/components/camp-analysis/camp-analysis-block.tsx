import React, { FC } from 'react';

import './camp-analysis-block.css';

const CampaignAnalysisBlock: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="camp-analysis-block mt">{children}</div>
);

export default CampaignAnalysisBlock;
