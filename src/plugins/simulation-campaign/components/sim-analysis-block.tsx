
import React from 'react';

import './sim-analysis-block.css';


const SimAnalysisBlock = (props: React.Props<{}>) => {
  return <div className="analysis-block">{props.children}</div>;
};


export default SimAnalysisBlock;
