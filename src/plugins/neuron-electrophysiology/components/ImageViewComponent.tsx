import * as React from 'react';
import { Button, Empty, Select, Spin } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';

import { RemoteData } from '../../../common';

import './stimuli-list.css';

const { Option } = Select;

export type ImageCollection = Map<string, ImageItem>;

export type ImageItem = {
  stimulusType: string;
  repetitions: {
    [rep: number]: {
      imageSrc: string;
      fileName: string;
    }[];
  };
};

const ImageViewComponent: React.FC<{
  stimulusTypeMap: Map<string, number>;
  stimulusType: string;
  imageCollectionData: RemoteData<ImageCollection>;
  imagePreview: React.FC<{ imageUrl: string }>;
  onStimulusChange: (value: string) => void;
  onRepetitionClicked: (rep: string) => () => void;
}> = ({
  stimulusTypeMap,
  stimulusType,
  imageCollectionData,
  imagePreview,
  onStimulusChange,
  onRepetitionClicked,
}) => {
  return (
    <div>
      <div style={{ margin: '0 0 1em 0' }}>
        Select Stimulus ({stimulusTypeMap.size} Stimuli)
        <br />
        <Select
          style={{ width: 200 }}
          placeholder="Select a stimulus"
          value={stimulusType}
          onChange={onStimulusChange}
        >
          <Option value="All">All</Option>
          {Array.from(stimulusTypeMap.entries()).map(([key, amount]) => (
            <Option value={key} key={key}>
              {key} ({amount})
            </Option>
          ))}
        </Select>
      </div>
      <hr style={{ color: '#00000008' }} />
      <div>
        <Spin spinning={imageCollectionData.loading}>
          {[...(imageCollectionData.data?.entries() || [])].map(
            ([stimulusType, { repetitions }]) => {
              return (
                <div className="stimuli-list">
                  <h3>
                    {stimulusType} ({Object.keys(repetitions).length}{' '}
                    repetitions)
                  </h3>
                  <div className="reps" style={{ display: 'flex' }}>
                    {Object.keys(repetitions).map(repKey => {
                      const sweeps = repetitions[Number(repKey)]?.sort(
                        (a, b) => {
                          return a.fileName.includes('response')
                            ? 0
                            : b.fileName.includes('response')
                            ? 1
                            : 0;
                        }
                      );
                      return (
                        <div className="repetition-list">
                          <div
                            style={{
                              margin: '0 0 1em 0',
                            }}
                          >
                            Repetition {repKey}{' '}
                            <Button
                              size="small"
                              icon={<LineChartOutlined />}
                              onClick={onRepetitionClicked(repKey)}
                            >
                              Interactive View
                            </Button>
                          </div>
                          {sweeps.map(({ imageSrc }) => {
                            return (
                              <div
                                style={{
                                  margin: '0 0 1em 0',
                                }}
                              >
                                {imagePreview({ imageUrl: imageSrc })}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
          {imageCollectionData.data?.size === 0 && (
            <Empty
              style={{ padding: '2em' }}
              description={'There is no data to show'}
            ></Empty>
          )}
          {imageCollectionData.data?.size !== 0 &&
            imageCollectionData.loading && (
              <Empty
                style={{ padding: '2em' }}
                description="Fetching new stimulus types"
              ></Empty>
            )}
          {imageCollectionData.error && (
            <Empty
              style={{ padding: '2em' }}
              description={`There was a problem loading the required resources: ${imageCollectionData.error.message}`}
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default ImageViewComponent;
