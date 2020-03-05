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
    data: ProcessedTraceData | null;
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

    const traceDistro = resource.distribution.find(matches(SHAPE));

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
        // TODO: remove this when nexus SDK
        // File has a type argument
        // Ticket: https://github.com/BlueBrain/nexus/issues/1073
        // @ts-ignore
        const data = processTrace(file as Trace);
        setData({
          data,
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
      {data && !error && <EphysViewer dataset={data} />}
    </div>
  );
};

export default EphysContainer;
