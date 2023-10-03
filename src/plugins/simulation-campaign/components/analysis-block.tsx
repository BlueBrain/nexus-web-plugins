import React from 'react';

import './analysis-block.css';

function SimulationAnalysisBlock({ children }: { children: React.ReactNode }) {
  return <div className="analysis-block">{children}</div>;
}

export default SimulationAnalysisBlock;
