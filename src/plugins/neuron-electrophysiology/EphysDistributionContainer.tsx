import * as React from 'react';
import { Spin } from 'antd';
import { Resource, NexusClient } from '@bbp/nexus-sdk';
import EphysPlot, { DataSets, RABIndex, TraceData } from './EphysPlot';
import RandomAccessBuffer from './utils/RandomAccessBuffer';

type Distribution = {
  '@type': 'DataDownload';
  contentSize: { unitCode: 'bytes'; value: number };
  contentUrl: string;
  encodingFormat: string;
  name: string;
};

const EphysDistributionContainer: React.FC<{
  resource: Resource<any>;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const [traceDataSets, setTraceDataSets] = React.useState<DataSets>();
  const [index, setIndex] = React.useState<RABIndex>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | undefined>();
  React.useEffect(() => {
    if (!resource.distribution) {
      return;
    }

    const distribution = Array.isArray(resource.distribution)
      ? resource.distribution
      : [resource.distribution];

    const NWBDistro = distribution.find((distribution: Distribution) =>
      /^.*\.(nwb)$/.test(distribution.name)
    );

    if (!NWBDistro) {
      throw new Error(
        `No distribution found for resource ${resource['@id']} that is a .nwb file`
      );
    }

    const [projectLabel, orgLabel, ...rest] = resource._project
      .split('/')
      .reverse();

    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(resource['@id']),
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
          processRABDistro(
            setTraceDataSets,
            setIndex,
            setLoading,
            rabTrace.distribution,
            nexus,
            orgLabel,
            projectLabel
          );
        }
      })
      .catch(error => {
        setError(error);
      });
  }, [resource['@id']]);
  return (
    <>
      {traceDataSets && index ? (
        <EphysPlot options={traceDataSets} index={index} />
      ) : (
        <Spin spinning={loading} />
      )}
    </>
  );
};

export default EphysDistributionContainer;

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
  setTraceDataSets: React.Dispatch<React.SetStateAction<DataSets | undefined>>,
  setIndex: React.Dispatch<React.SetStateAction<RABIndex | undefined>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  RABDistro: any,
  nexus: NexusClient,
  orgLabel: any,
  projectLabel: any
) {
  const fileReader = new FileReader();

  fileReader.onload = () => {
    const {
      nameToDataSetMap,
      index,
    }: { nameToDataSetMap: DataSets; index: RABIndex } = parseRABData();
    setTraceDataSets(nameToDataSetMap);
    setIndex(index);
    setLoading(false);
  };
  const resourceIds = RABDistro.contentUrl.split('/');
  nexus.File.get(
    orgLabel,
    projectLabel,
    encodeURIComponent(resourceIds[resourceIds.length - 1]),
    { as: 'blob' }
  ).then(value => {
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
}
