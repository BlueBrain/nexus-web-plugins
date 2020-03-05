import React from 'react';

import './analysis-block.css';

const SimulationAnalysisBlock = (props: React.Props<{}>) => {
  return <div className="analysis-block">{props.children}</div>;
};

export default SimulationAnalysisBlock;
