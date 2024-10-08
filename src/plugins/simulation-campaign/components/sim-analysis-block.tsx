import React from 'react';

import './sim-analysis-block.css';

function SimAnalysisBlock({ children }: { children: React.ReactNode }) {
  return <div className="analysis-block">{children}</div>;
}

export default SimAnalysisBlock;
