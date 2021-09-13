import * as React from 'react';
import { Button, Empty, Select } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';

import { RemoteData } from '../../../common';


const { Option } = Select;

export type ImageCollection = Map<string, ImageItem>;

export type ImageItem = {
  stimulusType: string;
  repetitions: {
    [rep: number]: {
      imageSrc: string;
      fileName: string;
      about?: string;
    }[];
  };
};

const ImageSetComponent: React.FC<{
  stimulusType: string;
  repetitions: {
    [rep: number]: {
      imageSrc: string;
      fileName: string;
      about?: string | undefined;
    }[];
  };
  onRepetitionClicked: (stimulusType: string, rep: string) => () => void;
  imagePreview: React.FC<{ imageUrl: string }>;
}> = ({ stimulusType, repetitions, onRepetitionClicked, imagePreview }) => {
  const repLength = Object.keys(repetitions).length;
  return (
    <div className="stimuli-list" key={`image-preview-${stimulusType}`}>
      <h3>
        {stimulusType} {repLength > 1 && `(${repLength} repetitions)`}
      </h3>
      <div className="trace-repetitions">
        {Object.keys(repetitions).map(repKey => {
          const sweeps = repetitions[Number(repKey)]?.sort((a: any, b: any) => {
            const aType = (a.about || a.fileName)
              .toLowerCase()
              .includes('response');

            const bType = (b.about || b.fileName)
              .toLowerCase()
              .includes('response');

            if (aType && !bType) {
              return -1;
            }

            if (bType && !aType) {
              return 1;
            }

            return 0;
          });
          return (
            <div className="repetition-list" key={`image-preview-${stimulusType}-${repKey}`}>
              <div className="mb-1em">
                Repetition {repKey}{' '}
                <Button
                  size="small"
                  icon={<LineChartOutlined />}
                  onClick={onRepetitionClicked(stimulusType, repKey)}
                >
                  Interactive View
                </Button>
              </div>
              {sweeps.map((imgData: any, index: any) => {
                return (
                  <div
                    className="mb-1em"
                    key={`image-preview-${stimulusType}-${repKey}-${index}`}
                  >
                    {imagePreview({ imageUrl: imgData.imageSrc })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ImageViewComponent: React.FC<{
  stimulusTypeMap: Map<string, number>;
  stimulusType: string;
  imageCollectionData: RemoteData<ImageCollection>;
  imagePreview: React.FC<{ imageUrl: string }>;
  onStimulusChange: (value: string) => void;
  onRepetitionClicked: (stimulusType: string, rep: string) => () => void;
}> = ({
  stimulusTypeMap,
  stimulusType,
  imageCollectionData,
  imagePreview,
  onStimulusChange,
  onRepetitionClicked,
}) => {
  const sortedImageCollectionData = React.useMemo(() => {
    return [...(imageCollectionData.data?.entries() || [])].sort(
      ([stimulusTypeA], [stimulusTypeB]) => {
        const textA = stimulusTypeA.toUpperCase();
        const textB = stimulusTypeB.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      }
    );
  }, [imageCollectionData]);
  return (
    <div>
      <div className="mb-1em">
        Select Stimulus ({stimulusTypeMap.size} Stimuli)
        <br />
        <Select
          className="stimulus-select"
          placeholder="Select a stimulus"
          value={stimulusType}
          onChange={onStimulusChange}
        >
          <Option value="All">All</Option>
          {Array.from(stimulusTypeMap.entries()).map(([key, amount]) => (
            <Option value={key} key={key}>
              {key} {amount > 1 && `(${amount})`}
            </Option>
          ))}
        </Select>
      </div>
      <hr className="trace-divider" />
      <div>
        <div>
          {sortedImageCollectionData.map(([stimulusType, { repetitions }]) => {
            return (
              <ImageSetComponent
                key={stimulusType}
                stimulusType={stimulusType}
                repetitions={repetitions}
                onRepetitionClicked={onRepetitionClicked}
                imagePreview={imagePreview}
              />
            );
          })}
          {imageCollectionData.data?.size === 0 && (
            <Empty className="p-2em" description={'There is no data to show'} />
          )}
          {imageCollectionData.data?.size !== 0 &&
            imageCollectionData.loading && (
              <Empty className="p-2em" description="Fetching new stimulus types" />
            )}
          {imageCollectionData.error && (
            <Empty
              className="p-2em"
              description={`There was a problem loading the required resources: ${imageCollectionData.error.message}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageViewComponent;
