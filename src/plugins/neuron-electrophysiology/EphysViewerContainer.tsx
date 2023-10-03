import { NexusClient, Resource } from '@bbp/nexus-sdk';
import * as React from 'react';
import { Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { FileImageOutlined, LineChartOutlined } from '@ant-design/icons';

import { propAsArray } from "../../common";
import { EPhysImageItem } from './hooks/useImageCollectionDistribution';
import ImageViewContainer from './containers/ImageViewContainer';
import GraphViewContainer from './containers/GraphViewContainer';

enum VIEWS {
  IMAGE = 'image',
  CHART = 'graph',
}

const getStimulusTypeString = (image: EPhysImageItem) => {
  const typeString = image.stimulusType['@id'].split('/');
  return typeString[typeString.length - 1];
};

const EphysViewerContainer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const [view, setView] = React.useState<VIEWS>(VIEWS.IMAGE);
  const [selectedRepetition, setSelectedRepetition] = React.useState<string>();

  const stimulusTypes = resource.image
    ? propAsArray<EPhysImageItem>(resource, 'image')
        .filter(image => image.about.match(/stimulation/i))
        .map(getStimulusTypeString)
        .sort()
    : [];

  const stimulusTypeMap = React.useMemo(() => {
    const typeToNumbers = new Map<string, number>();

    stimulusTypes.forEach(stimulusTypeName => {
      const amount = typeToNumbers.get(stimulusTypeName);
      if (amount) {
        typeToNumbers.set(stimulusTypeName, amount + 1);
      } else {
        typeToNumbers.set(stimulusTypeName, 1);
      }
    });

    return typeToNumbers;
  }, [resource]);

  const [stimulusType, setStimulusType] = React.useState<string>('All');

  const handleViewChange = (e: RadioChangeEvent) => {
    const view = e.target.value;
    setView(view);
  };

  const handleChange = (value: string) => {
    setStimulusType(value);
  };

  const handleRepetitionClicked = (
    stimulusType: string,
    repetition: string
  ) => () => {
    setStimulusType(stimulusType);
    setSelectedRepetition(repetition);
    setView(VIEWS.CHART);
  };

  return (
    <div>
      <div style={{ margin: '0 0 1em 0' }}>
        <Radio.Group onChange={handleViewChange} value={view}>
          <Radio.Button value={VIEWS.IMAGE}>
            <FileImageOutlined /> Overview
          </Radio.Button>
          <Radio.Button value={VIEWS.CHART}>
            <LineChartOutlined /> Interactive Details
          </Radio.Button>
        </Radio.Group>
      </div>
      <div>
        {view === VIEWS.IMAGE && (
          <ImageViewContainer
            {...{
              stimulusType,
              resource,
              nexus,
              stimulusTypeMap,
              onRepetitionClicked: handleRepetitionClicked,
              onStimulusChange: handleChange,
            }}
          />
        )}
        {view === VIEWS.CHART && (
          <GraphViewContainer
            nexus={nexus}
            resource={resource}
            defaultStimulusType={
              stimulusType === 'None' || stimulusType === 'All'
                ? undefined
                : stimulusType
            }
            defaultRepetition={selectedRepetition}
          />
        )}
      </div>
    </div>
  );
};

export default EphysViewerContainer;
