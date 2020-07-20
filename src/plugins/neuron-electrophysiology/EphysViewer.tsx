import * as React from 'react';
import { Resource, NexusClient } from '@bbp/nexus-sdk';
import { Spin, Select } from 'antd';
import { sortBy } from 'lodash';

import EphysContainer from './EphysContainer';
import EphysGraphComponent from './EphysGraph';

const { Option } = Select;

export type Distribution = {
  '@type': 'DataDownload';
  contentSize: { unitCode: 'bytes'; value: number };
  contentUrl: string;
  encodingFormat: string;
  name: string;
};

export type EphysResponse = Resource<{
  distribution: Distribution | Distribution[];
  stimulus: {
    '@type': 'Stimulus';
    stimulusType: {
      '@id': string;
      label: string;
    };
  };
}>;

const EphysViewer: React.FC<{ data: EphysResponse[]; nexus: NexusClient }> = ({
  data,
  nexus,
}) => {
  const stimulusTypes = sortBy(
    data.map(entry => entry.stimulus.stimulusType.label)
  );

  const [stimulusTypeSelection, setStimulusTypeSelection] = React.useState<
    string
  >(stimulusTypes[0]);

  const handleSelectStimulusType = (value: string) => {
    setStimulusTypeSelection(value);
  };

  const selectedHit = data.find(
    entry => entry.stimulus.stimulusType.label === stimulusTypeSelection
  );

  React.useEffect(() => {
    if (!stimulusTypeSelection && !!stimulusTypes.length) {
      setStimulusTypeSelection(stimulusTypes[0]);
    }
  }, [data]);


  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1em',
        }}
      >
        <div>
          {/* TODO: make a Form with interactive labels */}
          <label htmlFor="simulus-selector">Select Stimulus Type</label>
          <br />
          <Select
            id="stimulus-selector"
            value={stimulusTypeSelection}
            onChange={handleSelectStimulusType}
            disabled={stimulusTypes.length <= 1}
            style={{ width: 200 }}
          >
            {stimulusTypes.map(stimulusType => (
              <Option value={stimulusType}>{stimulusType}</Option>
            ))}
          </Select>
        </div>
      </div>

      {!!selectedHit && (
        <EphysContainer resource={selectedHit} nexus={nexus}>
          {({ loading, error, data }) => (
            // TODO: What to do with errors?
            <Spin spinning={loading}>
              {data && (
                <EphysGraphComponent
                  dataset={data.processedTrace}
                  iUnit={data.iUnit}
                  vUnit={data.vUnit}
                  tUnit={data.tUnit}
                />
              )}
            </Spin>
          )}
        </EphysContainer>
      )}
    </div>
  );
};

export default EphysViewer;
