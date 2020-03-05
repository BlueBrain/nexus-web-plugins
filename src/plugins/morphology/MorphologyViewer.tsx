import * as React from 'react';
import './style.css';
const morphoviewer = require('morphoviewer').default;
const swcmorphologyparser = require('swcmorphologyparser').default;

export const MorphologyViewer: React.FC<{ data: any }> = ({ data }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let morphoViewer: any;
    if (!ref.current) {
      return;
    }
    try {
      const swcParser = new swcmorphologyparser.SwcParser();
      swcParser.parse(data);
      const parsedFile = swcParser.getRawMorphology();

      morphoViewer = new morphoviewer.MorphoViewer(ref.current);
      morphoViewer.addMorphology(parsedFile, {
        focusOn: true,
        asPolyline: true,
        onDone: null,
        somaMode: 'fromOrphanSections',
      });
    } catch (error) {
      console.log(error);
    }
    return () => {
      morphoViewer && morphoViewer.destroy();
    };
  }, [ref, data]);

  return <div className="morpho-viewer" ref={ref}></div>;
};

export default MorphologyViewer;
