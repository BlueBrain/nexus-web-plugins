import React, { FC } from 'react';

import './camp-analysis.css';

const CampAnalysis: FC<{ children : React.ReactNode }> = ({ children }) => (
  <div className="camp-analysis mt">
    <h3>Campaign Analysis</h3>
    <div>{children}</div>
  </div>
);

export default CampAnalysis;
