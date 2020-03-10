import React, { FunctionComponent } from 'react';

import './camp-analysis-block.css';

const CampaignAnalysisBlock: FunctionComponent<{}> = props => (
  <div className="camp-analysis-block mt">{props.children}</div>
);

export default CampaignAnalysisBlock;
