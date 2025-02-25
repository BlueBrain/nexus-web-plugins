import * as React from 'react';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
import { Distribution, RemoteData } from '../../../common';
import RandomAccessBuffer from '../utils/RandomAccessBuffer';
import { DataSets, RABIndex, TraceData } from '../EphysPlot';
import useLazyCache from './useLazyCache';

export function useEphysDistribution(resource: Resource, nexus: NexusClient) {
  const [{ loading, data, error }, setData] = React.useState<
    RemoteData<{
      RABIndex: RABIndex;
      datasets: DataSets;
    }>
  >({
    loading: true,
    error: null,
    data: null,
  });

  const resourceID = resource['@id'];

  const [projectLabel, orgLabel] = resource._project.split('/').reverse();

  React.useEffect(() => {
    if (!resource.distribution) {
      return;
    }

    setData({
      error: null,
      data: null,
      loading: true,
    });

    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(resourceID),
      'incoming'
    )
      .then(({ _results }) => {
        const traces = _results.filter(link =>
          link['@type']?.includes('https://bbp.epfl.ch/ontologies/core/bmo/TraceWebDataContainer')
        );
        const promises = traces.map(trace =>
          nexus.Resource.get(
            orgLabel,
            projectLabel,
            encodeURIComponent(trace['@id'])
          )
        );
        return Promise.all(promises);
      })
      .then(traceResources => {
        const rabTrace: any = traceResources.find((trace: any) => {
          if (trace.distribution) {
            return /^.*\.(rab)$/.test(trace.distribution.name);
          }
          return false;
        });
        if (rabTrace) {
          return processRABDistro(
            rabTrace.distribution,
            nexus,
            orgLabel,
            projectLabel
          );
        }
      })
      .then(data => {
        if (data) {
          const { RABIndex, datasets } = data;
          setData({
            error,
            loading: false,
            data: {
              RABIndex,
              datasets,
            },
          });
        } else {
          setData({
            error,
            loading: false,
            data: null, // No RAB available.
          });
        }
      })
      .catch(error => {
        setData({
          error,
          data,
          loading: false,
        });
      });
  }, [resourceID]);

  return { loading, error, data };
}

export default useEphysDistribution;

/**
 *
 * @param setTraceDataSets
 * @param setIndex
 * @param setLoading
 * @param RABDistro
 * @param nexus
 * @param orgLabel
 * @param projectLabel
 *
 * Process RAB blob Data. Parse and set Index and Data Sets.
 */
function processRABDistro(
  RABDistro: Distribution,
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string
): Promise<{
  RABIndex: RABIndex;
  datasets: DataSets;
}> {
  return new Promise((resolve, reject) => {
    const [cacheAdd, cacheGet] = useLazyCache<{
      RABIndex: RABIndex;
      datasets: DataSets;
    }>();

    const resourceId = RABDistro.contentUrl.split('/');
    const cacheKey = resourceId[resourceId.length - 1];

    const cacheMatch = cacheGet(cacheKey);

    if (cacheMatch) {
      resolve(cacheMatch);
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = () => {
      const {
        nameToDataSetMap,
        index,
      }: { nameToDataSetMap: DataSets; index: RABIndex } = parseRABData();
      cacheAdd(cacheKey, {
        RABIndex: index,
        datasets: nameToDataSetMap,
      });

      resolve({
        RABIndex: index,
        datasets: nameToDataSetMap,
      });
    };

    nexus.httpGet({
      path: RABDistro.contentUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      context: {
        parseAs: 'blob',
      },
    }).then(value => {
      fileReader.readAsArrayBuffer(value as Blob);
    })

    function parseRABData() {
      const randomAccessBuffer = new RandomAccessBuffer();
      randomAccessBuffer.parse(fileReader.result as ArrayBuffer);
      const dataSets = randomAccessBuffer.listDatasets();
      const index = randomAccessBuffer.getDataset('index') as RABIndex;
      const nameToDataSetMap: DataSets = {};
      let i = 0;
      // Last item is the 'index' Object.
      // In order to ignore it, use < length -1
      while (i < dataSets.length - 1) {
        const dataSet = randomAccessBuffer.getDataset(dataSets[i]) as RABIndex;
        const y = dataSet.data['numericalData'];
        const label: string = dataSets[i].trim();
        const data: TraceData = {
          y,
          name: label.slice(0, label.length - 2).trim(),
        };
        nameToDataSetMap[label] = data;
        i += 1;
      }
      return { nameToDataSetMap, index };
    }
  });
}
