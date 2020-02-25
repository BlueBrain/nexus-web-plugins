
import React from 'react';

import './analysis-carousel.css';


const SimulationAnalisysCarousel = (props: React.Props<{}>) => (
  <div className="simulation-analysis-carousel-container mt">
    <h3>Simulation overview plots</h3>
    <div className="simulation-analysis-carousel">{props.children}</div>
  </div>
);


export default SimulationAnalisysCarousel;
