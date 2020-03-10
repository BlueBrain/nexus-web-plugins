import React, { FunctionComponent } from 'react';

import './camp-analysis.css';

const CampAnalysis: FunctionComponent<{}> = props => (
  <div className="camp-analysis mt">
    <h3>Campaign Analysis</h3>
    <div>{props.children}</div>
  </div>
);

export default CampAnalysis;
