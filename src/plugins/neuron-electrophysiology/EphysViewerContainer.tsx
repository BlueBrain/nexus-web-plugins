import { NexusClient, Resource } from '@bbp/nexus-sdk';
import * as React from 'react';
import { Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { FileImageOutlined, LineChartOutlined } from '@ant-design/icons';

import { EPhysImageItem } from './hooks/useImageCollectionDistribution';
import { propAsArray } from '../../common';
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

  const stimulusTypes = propAsArray<EPhysImageItem>(resource, 'image')
    .map(getStimulusTypeString)
    .sort();

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

  const [stimulusType, setStimulusType] = React.useState<string>(
    stimulusTypes[0] || 'None'
  );

  const handleViewChange = (e: RadioChangeEvent) => {
    const view = e.target.value;
    setView(view);
  };

  const handleChange = (value: string) => {
    setStimulusType(value);
  };

  const handleRepetitionClicked = (rep: string) => () => {
    setSelectedRepetition(rep);
    setView(VIEWS.CHART);
  };

  const handleGoToImage = (stimulusType: string, repetition: string) => {
    setStimulusType(stimulusType);
    setSelectedRepetition(repetition);
    setView(VIEWS.IMAGE);
  };

  return (
    <div>
      <div style={{ margin: '0 0 1em 0' }}>
        <Radio.Group onChange={handleViewChange} value={view}>
          <Radio.Button value={VIEWS.IMAGE}>
            Image Overview <FileImageOutlined />
          </Radio.Button>
          <Radio.Button value={VIEWS.CHART}>
            Interactive Details <LineChartOutlined />
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
              stimulusType === 'None' ? undefined : stimulusType
            }
            defaultRepetition={selectedRepetition}
            goToImage={handleGoToImage}
          />
        )}
      </div>
    </div>
  );
};

export default EphysViewerContainer;
