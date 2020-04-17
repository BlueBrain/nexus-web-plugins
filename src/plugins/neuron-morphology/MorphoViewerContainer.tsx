import * as React from 'react';
import { Resource, NexusClient } from '@bbp/nexus-sdk';
import { matches } from 'lodash';
import { InputNumber, Button, Descriptions } from 'antd';
import MorphoWrapper from './MorphoWrapper';
import { MorphoViewerOptions } from './MorphologyViewer';

const SHAPE = {
  '@type': 'DataDownload',
  encodingFormat: 'application/swc',
};

const MorphoViewerContainer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const [{ loading, error, data }, setData] = React.useState<{
    loading: boolean;
    error: Error | null;
    data: any;
  }>({
    loading: true,
    error: null,
    data: null,
  });

  const [options, setOptions] = React.useState<MorphoViewerOptions>({
    asPolyline: false,
    focusOn: true,
    somaMode: 'fromOrphanSections',
    distance: 500,
  });

  const defaultZoomSize = 500;
  const [morphDistance, setMorphDistance] = React.useState<number>(
    defaultZoomSize
  );

  React.useEffect(() => {
    if (!resource.distribution) {
      setData({
        loading: false,
        error: new Error(
          `No distribution found for resource ${resource['@id']}`
        ),
        data: null,
      });
      return;
    }

    const distribution = Array.isArray(resource.distribution)
      ? resource.distribution
      : [resource.distribution];

    const traceDistro = distribution.find(matches(SHAPE));

    if (!traceDistro) {
      setData({
        loading: false,
        error: new Error(
          `No distribution found for resource ${resource['@id']} with shape ${SHAPE}`
        ),
        data: null,
      });
      return;
    }

    const [projectLabel, orgLabel, ...rest] = resource._project
      .split('/')
      .reverse();

    const [id] = traceDistro.contentUrl.split('/').reverse();

    nexus.File.get(orgLabel, projectLabel, id, { as: 'text' })
      .then(data => {
        setData({
          data,
          error: null,
          loading: false,
        });
      })
      .catch(error => {
        setData({
          error,
          data: null,
          loading: false,
        });
      });
  }, [resource['@id']]);

  const handleAsPolyline = () => {
    setOptions({
      ...options,
      asPolyline: !options.asPolyline,
    });
  };

  return (
    <>
      <div className="zoom-control">
        Distance :{' '}
        <InputNumber
          size="small"
          min={0}
          max={10000}
          defaultValue={defaultZoomSize}
          onChange={value => {
            setMorphDistance(value as number);
          }}
        ></InputNumber>
        <Button
          size="small"
          className="zoom-input"
          onClick={() => {
            setOptions({ ...options, distance: morphDistance });
          }}
        >
          Apply Distance
        </Button>
      </div>
      <MorphoWrapper
        {...{
          loading,
          error,
          data,
          options,
          onPolylineClick: handleAsPolyline,
        }}
      />
    </>
  );
};

export default MorphoViewerContainer;
