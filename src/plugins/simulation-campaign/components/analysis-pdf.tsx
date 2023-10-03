import React from 'react';

import './analysis-pdf.css';

interface AnalysisPdfProps {
  src: string;
}

function AnalysisPdf(props: AnalysisPdfProps) {
  return (
    <div className="mt">
      <h3>Cumulative campaign analysis report</h3>
      <object
        className="campaign-analysis-pdf"
        data={props.src}
        type="application/pdf"
      >
        <embed className="campaign-analysis-pdf" src={props.src} />
      </object>
    </div>
  );
}

export default AnalysisPdf;
