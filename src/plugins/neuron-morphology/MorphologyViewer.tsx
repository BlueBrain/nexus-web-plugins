import * as React from 'react';
import { last } from 'lodash';
import withFixedFocusOnMorphology from './withFixedFocusOnMorphology';

import './morpho-viewer.css';
import { OrientationViewer } from './libs/OrientationViewer';

// TODO update morphoviewer library with typings
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
  const orientationRef = React.useRef<HTMLDivElement>(null);
  const [mv, setMorphoViewer] = React.useState();
  const [
    orientationViewer,
    setOrientationViewer,
  ] = React.useState<OrientationViewer | null>(null);

  React.useEffect(() => {
    if (mv) {
      // TODO flip camera orientation
      // mv._threeContext._camera.up.negate();

      // Change soma color to black
      const morphoMesh: any = last(mv._threeContext._scene.children);
      const somaMesh = last(morphoMesh.children);
      (somaMesh as any)?.material.color.setHex(0x000000);
      mv._threeContext._render();
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

      morphoViewer = withFixedFocusOnMorphology(
        new morphoviewer.MorphoViewer(ref.current)
      );

      morphoViewer._threeContext._camera.up.negate();
      setMorphoViewer(morphoViewer);
      const morphoViewerOptions = {
        name: 'morphology',
        ...options,
      };
      morphoViewer.addMorphology(parsedFile, morphoViewerOptions);
    } catch (error) {
      throw new Error(`Morphology parsing error: ${error.message}`);
    }
    return () => {
      morphoViewer && morphoViewer.destroy();
    };
  }, [ref, data, options]);

  React.useEffect(() => {
    if (!orientationRef.current) {
      return;
    }
    if (!orientationViewer) {
      setOrientationViewer(new OrientationViewer(orientationRef.current));
    }
    if (mv && orientationViewer) {
      orientationViewer.setFollowCamera(mv._threeContext._camera);
    }
    return () => {
      orientationViewer?.destroy();
    };
  }, [orientationRef, mv]);

  const handleOrientationClick = () => {
    mv?._threeContext._controls.reset();
    mv?._threeContext._camera.up.negate();
    mv?._threeContext.focusOnMorphology();
  };

  return (
    <div>
      <div className="morpho-viewer" ref={ref}></div>
      <div
        className="orientation"
        ref={orientationRef}
        onClick={handleOrientationClick}
      ></div>
    </div>
  );
};

export default MorphologyViewer;
