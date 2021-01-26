import * as React from 'react';
import withFixedFocusOnMorphology from './withFixedFocusOnMorphology';
import OrientationViewer from './libs/OrientationViewer';
import ScaleViewer from './libs/ScaleViewer';
import MorphoLegend from './MorphoLegend';

import './morpho-viewer.css';

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
  const scaleRef = React.useRef<HTMLDivElement>(null);
  const [mv, setMorphoViewer] = React.useState();
  const [
    orientationViewer,
    setOrientationViewer,
  ] = React.useState<OrientationViewer | null>(null);
  const [scaleViewer, setScaleViewer] = React.useState<ScaleViewer | null>(
    null
  );

  React.useEffect(() => {
    if (!mv) {
      return;
    }

    if (!mv.hasSomaData) {
      // Change soma color to black
      const somaMesh = mv._threeContext.getOrphanedSomaChildren();
      (somaMesh as any)?.material.color.setHex(0x000000);
    }

    if (mv.hasSomaData && !options.asPolyline) {
      // remove orphaned soma because real one exists, but two are shown
      // this is a bug with morphoviewer and will be fixed
      // TODO update morphoviewer and remove this code.
      mv._threeContext.removeOrphanedSomaChildren();

      // Change soma color to black
      mv._threeContext.getSomaChildren().forEach((somaMesh: any) => {
        somaMesh?.material.color.setHex(0x000000);
      });
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

      const hasSomaData = parsedFile.soma.points.length > 1;

      morphoViewer = withFixedFocusOnMorphology(
        new morphoviewer.MorphoViewer(ref.current)
      );
      morphoViewer.hasSomaData = hasSomaData;

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

  // Orientation Viewer Operations
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
      setOrientationViewer(null);
    };
  }, [orientationRef, mv, options]);

  // Scale Axis Operations
  React.useEffect(() => {
    let controlEventListenerChangedEvent: VoidFunction | null = null;
    if (!scaleRef.current) {
      return;
    }
    if (!scaleViewer) {
      setScaleViewer(new ScaleViewer(scaleRef.current, 0));
    }
    if (mv && scaleViewer) {
      scaleViewer.onScaleChange(mv._threeContext.getCameraHeightAtMorpho());
      controlEventListenerChangedEvent = () => {
        scaleViewer.onScaleChange(mv._threeContext.getCameraHeightAtMorpho());
      };
      mv._threeContext._controls.addEventListener(
        'change',
        controlEventListenerChangedEvent
      );
    }
    return () => {
      scaleViewer?.destroy();
      setScaleViewer(null);
      mv?._threeContext?._controls?.removeEventListener(
        'change',
        controlEventListenerChangedEvent
      );
    };
  }, [scaleRef, mv, options]);

  const handleOrientationClick = () => {
    mv?._threeContext._controls.reset();
    mv?._threeContext._camera.up.negate();
    mv?._threeContext.focusOnMorphology();
  };

  return (
    <>
      <MorphoLegend
        isInterneuron={!!mv?.isInterneuron()}
        hasApproximatedSoma={!mv?.hasSomaData}
      />
      <div>
        <div className="morpho-viewer" ref={ref}></div>
        <div
          className="scale"
          ref={scaleRef}
          onClick={handleOrientationClick}
        ></div>
        <div
          className="orientation"
          ref={orientationRef}
          onClick={handleOrientationClick}
        ></div>
      </div>
    </>
  );
};

export default MorphologyViewer;
