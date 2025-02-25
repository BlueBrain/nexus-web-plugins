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
    // @ts-ignore
    if (!mv.hasSomaData) {
      // Change soma color to black
      // @ts-ignore
      const somaMesh = mv._threeContext.getOrphanedSomaChildren();
      (somaMesh as any)?.material.color.setHex(0x000000);
    }
    // @ts-ignore
    if (mv.hasSomaData && !options.asPolyline) {
      // remove orphaned soma because real one exists, but two are shown
      // this is a bug with morphoviewer and will be fixed
      // TODO update morphoviewer and remove this code.
      // @ts-ignore
      mv._threeContext.removeOrphanedSomaChildren();

      // Change soma color to black
      // @ts-ignore
      mv._threeContext.getSomaChildren().forEach((somaMesh: any) => {
        somaMesh?.material.color.setHex(0x000000);
      });
      // @ts-ignore
      mv._threeContext._render();
    }
    // @ts-ignore
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
      if (morphoViewer) {
        morphoViewer.destroy();
        if(morphoViewer && morphoViewer._threeContext) {
          morphoViewer._threeContext = null;
        }
      }
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
      // @ts-ignore
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
      // @ts-ignore
      scaleViewer.onScaleChange(mv._threeContext.getCameraHeightAtMorpho());
      controlEventListenerChangedEvent = () => {
        // @ts-ignore
        scaleViewer.onScaleChange(mv._threeContext.getCameraHeightAtMorpho());
      };
      // @ts-ignore
      mv._threeContext._controls.addEventListener(
        'change',
        controlEventListenerChangedEvent
      );
    }
    return () => {
      scaleViewer?.destroy();
      setScaleViewer(null);
      // @ts-ignore
      mv?._threeContext?._controls?.removeEventListener(
        'change',
        controlEventListenerChangedEvent
      );
    };
  }, [scaleRef, mv, options]);

  const handleOrientationClick = () => {
    // @ts-ignore
    mv?._threeContext._controls.reset();
    // @ts-ignore
    mv?._threeContext._camera.up.negate();
    // @ts-ignore
    mv?._threeContext.focusOnMorphology();
  };

  return (
    <>
      <MorphoLegend
        isInterneuron={
          // @ts-ignore
          !!mv?.isInterneuron()
        }
        hasApproximatedSoma={
          // @ts-ignore
          !mv?.hasSomaData
        }
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
