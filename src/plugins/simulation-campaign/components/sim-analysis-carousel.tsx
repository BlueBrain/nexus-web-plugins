import React, { ReactNode } from 'react';

import './sim-analysis-carousel.css';

function SimAnalisysCarousel({ children }: { children: ReactNode }) {
  return <div className="simulation-analysis-carousel-container mt">
    <h3>Simulation overview plots</h3>
    <div className="simulation-analysis-carousel">{children}</div>
  </div>
}

export default SimAnalisysCarousel;
