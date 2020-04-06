import * as React from 'react';
import { matches } from 'lodash';
import { Resource, NexusClient } from '@bbp/nexus-sdk';

import { ProcessedTraceData, Trace } from './types';
import processTrace from './processTrace';

const SHAPE = {
  '@type': 'DataDownload',
  encodingFormat: 'application/json',
};

const EphysContainer: React.FC<{
  resource: Resource<any>;
  nexus: NexusClient;
  children: (data: {
    loading: boolean;
    error: Error | null;
    data: {
      processedTrace: ProcessedTraceData;
      iUnit: string;
      vUnit: string;
      tUnit: string;
    } | null;
  }) => React.ReactNode;
}> = ({ resource, nexus, children }) => {
  const [{ loading, error, data }, setData] = React.useState<{
    loading: boolean;
    error: Error | null;
    data: {
      processedTrace: ProcessedTraceData;
      iUnit: string;
      vUnit: string;
      tUnit: string;
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

    setData({
      loading: true,
      error: null,
      data: null,
    });

    const [projectLabel, orgLabel, ...rest] = resource._project
      .split('/')
      .reverse();

    const [id] = traceDistro.contentUrl.split('/').reverse();

    nexus.File.get(orgLabel, projectLabel, id, { as: 'text' })
      .then(file => {
        const trace = JSON.parse(file as string) as Trace;
        setData({
          data: {
            processedTrace: processTrace(trace),
            iUnit: trace.i_unit,
            vUnit: trace.v_unit,
            tUnit: trace.t_unit,
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

  return <>{children({ loading, error, data })}</>;
};

export default EphysContainer;
