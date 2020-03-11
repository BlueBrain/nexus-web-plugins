import * as React from 'react';
import { Resource, NexusClient } from '@bbp/nexus-sdk';
import { matches } from 'lodash';
import { parseUrl } from '../../common';
import { ProcessedTraceData, Trace } from './types';
import EphysViewer from './EphysViewer';
import processTrace from './EphysViewer/processTrace';

const SHAPE = {
  '@type': 'DataDownload',
  encodingFormat: 'application/json',
};

const EphysContainer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const [{ loading, error, data }, setData] = React.useState<{
    loading: boolean;
    error: Error | null;
    data: {
      processedTrace: ProcessedTraceData;
      iUnit: string;
      vUnit: string;
    } | null;
  }>({
    loading: true,
    error: null,
    data: null,
  });

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

    const { org: orgLabel, project: projectLabel } = parseUrl(resource._self);

    const [id, ...moreRest] = traceDistro.contentUrl.split('/').reverse();

    nexus.File.get(orgLabel, projectLabel, id, { as: 'text' })
      .then(file => {
        const trace = JSON.parse(file as string) as Trace;
        setData({
          data: {
            processedTrace: processTrace(trace),
            iUnit: trace.i_unit,
            vUnit: trace.v_unit,
          },
          loading: false,
          error: null,
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

  return (
    <div className={loading ? 'ephys-wapper loading' : 'ephys-wapper'}>
      {error && <p>{error.message}</p>}
      {data && !error && (
        <EphysViewer
          dataset={data.processedTrace}
          iUnit={data.iUnit}
          vUnit={data.vUnit}
        />
      )}
    </div>
  );
};

export default EphysContainer;
