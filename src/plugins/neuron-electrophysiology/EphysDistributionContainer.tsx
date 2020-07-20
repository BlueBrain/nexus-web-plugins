import * as React from 'react';
import { matches } from 'lodash';
import { Resource, NexusClient } from '@bbp/nexus-sdk';
import EphysViewer, { Distribution, EphysResponse } from './EphysViewer';
import EphysPlot, { DataSets, RABIndex, TraceData } from './EphysPlot';
import RandomAccessBuffer from './utils/RandomAccessBuffer';

const JSON_PREVIEW_SHAPE = {
  '@type': 'DataDownload',
  encodingFormat: 'application/json',
};

// There are two types of resources
// we care about for ehpys
// one is NWB with multiple stimuli
// and the other is the single json
// ephys preview file
// This switch will attempt to match
// to each one
const EphysDistributionContainer: React.FC<{
  resource: Resource<any>;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const [{ loading, error, data }, setData] = React.useState<{
    loading: boolean;
    error: Error | null;
    data: EphysResponse[] | null;
  }>({
    loading: true,
    error: null,
    data: null,
  });

  const [traceDataSets, setTraceDataSets] = React.useState<DataSets>();
  const [index, setIndex] = React.useState<RABIndex>();

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

    const tracePreviewDistro = distribution.find(matches(JSON_PREVIEW_SHAPE));
    const NWBDistro = distribution.find((distribution: Distribution) =>
      /^.*\.(nwb)$/.test(distribution.name)
    );
    const RABDistro = distribution.find((distribution: Distribution) =>
      /^.*\.(rab)$/.test(distribution.name)
    );

    if (!tracePreviewDistro && !NWBDistro && !RABDistro) {
      throw new Error(
        `No distribution found for resource ${resource['@id']} that is a trace json preview or .nwb file`
      );
    }

    // This is a simple case where the current resource is already a trace preview
    if (tracePreviewDistro) {
      return setData({
        loading: false,
        error: null,
        data: [resource],
      });
    }

    setData({
      loading: true,
      error: null,
      data: null,
    });

    const [projectLabel, orgLabel, ...rest] = resource._project
      .split('/')
      .reverse();

    if (RABDistro) {
      processRABDistro(
        setTraceDataSets,
        setIndex,
        RABDistro,
        nexus,
        orgLabel,
        projectLabel
      );
      return;
    }

    const linkResourceId = RABDistro
      ? resource.isPartOf['@id']
      : resource['@id'];

    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(linkResourceId),
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
        setData({
          data: traceResources.map((trace: any, index: number) => ({
            ...trace,
            stimulus: {
              stimulusType: {
                label:
                  trace?.stimulus?.stimulusType?.label || `unlabled ${index}`,
              },
            },
          })) as EphysResponse[],
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
    <>
      {traceDataSets && index ? (
        <EphysPlot options={traceDataSets} index={index} />
      ) : (
        <EphysViewer data={data || []} nexus={nexus} />
      )}
    </>
  );
};

export default EphysDistributionContainer;

/**
 *
 * @param setTraceDataSets
 * @param setIndex
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
