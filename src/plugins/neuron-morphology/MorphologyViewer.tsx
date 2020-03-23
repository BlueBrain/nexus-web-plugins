import * as React from 'react';
import { last } from 'lodash';

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
  somaColorCallback?: (color: any) => void;
}> = ({ data, options, somaColorCallback }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [mv, setMorphoViewer] = React.useState();

  React.useEffect(() => {
    if (mv) {
      // TODO flip camera orientation
      // mv._threeContext._camera.up.negate();
      const morphoMesh: any = last(mv._threeContext._scene.children);
      const somaMesh = last(morphoMesh.children);
      const hexColor = (somaMesh as any)?.material.color.getHexString();
      somaColorCallback && somaColorCallback(`#${hexColor}`);
    }
  }, [mv && mv._threeContext]);

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
      setMorphoViewer(morphoViewer);
      morphoViewer.addMorphology(parsedFile, {
        name: 'morphology',
        ...options,
      });
    } catch (error) {
      throw new Error(`Morphology parsing error: ${error.message}`);
    }
    return () => {
      morphoViewer && morphoViewer.destroy();
    };
  }, [ref, data, options]);

  return <div className="morpho-viewer" ref={ref}></div>;
};

export default MorphologyViewer;
