import * as React from 'react';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
import { Distribution, propAsArray, RemoteData } from '../../../common';
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
      console.warn(
        `no distribution found but expected for resource ${resourceID}`
      );
      return;
    }

    const distribution = propAsArray<Distribution>(resource, 'distribution');

    const NWBDistro = distribution.find((distribution: Distribution) =>
      /^.*\.(nwb)$/.test(distribution.name)
    );

    if (!NWBDistro) {
      throw new Error(
        `No distribution found for resource ${resourceID} that is a .nwb file`
      );
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
          link['@type']?.includes('https://neuroshapes.org/Trace')
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
    const resourceIds = RABDistro.contentUrl.split('/');

    const [cacheAdd, cacheGet] = useLazyCache<{
      RABIndex: RABIndex;
      datasets: DataSets;
    }>();
    const cacheKey = resourceIds[resourceIds.length - 1];
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

    nexus.File.get(orgLabel, projectLabel, encodeURIComponent(cacheKey), {
      as: 'blob',
    }).then(value => {
      fileReader.readAsArrayBuffer(value as Blob);
    });

    function parseRABData() {
      const randomAccessBuffer = new RandomAccessBuffer();
      randomAccessBuffer.parse(fileReader.result as ArrayBuffer);
      const dataSets = randomAccessBuffer.listDatasets();
      const index = randomAccessBuffer.getDataset('index') as RABIndex;
      const nameToDataSetMap: DataSets = {};
      let i = 0;
      while (i < dataSets.length - 2) {
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
