import * as React from 'react';

import './morpho-viewer.css';

const morphoviewer = require('morphoviewer').default;
const swcmorphologyparser = require('swcmorphologyparser').default;

export type MorphoViewerOptions = {
  asPolyline?: boolean;
  focusOn?: boolean;
  onDone?: VoidFunction;
  somaMode?: string;
};

export const MorphologyViewer: React.FC<{
  data: any;
  options: MorphoViewerOptions;
}> = ({ data, options }) => {
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

      console.log({ parsedFile });

      morphoViewer = new morphoviewer.MorphoViewer(ref.current);
      morphoViewer.addMorphology(parsedFile, {
        ...options,
      });

      console.log({ morphoViewer });
    } catch (error) {
      console.log(error);
    }
    return () => {
      morphoViewer && morphoViewer.destroy();
    };
  }, [ref, data, options]);

  return <div className="morpho-viewer" ref={ref}></div>;
};

export default MorphologyViewer;
