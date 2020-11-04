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
      about?: string;
    }[];
  };
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
          {[...(imageCollectionData.data?.entries() || [])]
            .sort(([stimulusTypeA], [stimulusTypeB]) => {
              const textA = stimulusTypeA.toUpperCase();
              const textB = stimulusTypeB.toUpperCase();
              return textA < textB ? -1 : textA > textB ? 1 : 0;
            })
            .map(([stimulusType, { repetitions }]) => {
              const repLength = Object.keys(repetitions).length;

              return (
                <div
                  className="stimuli-list"
                  key={`image-preview-${stimulusType}`}
                >
                  <h3>
                    {stimulusType} ({repLength}{' '}
                    {repLength > 1 ? 'repetitions' : 'repetition'})
                  </h3>
                  <div className="reps" style={{ display: 'flex' }}>
                    {Object.keys(repetitions).map(repKey => {
                      const sweeps = repetitions[Number(repKey)]?.sort(
                        (a, b) => {
                          const aType = (a.about || a.fileName).toLowerCase();
                          const bType = (b.about || b.fileName).toLowerCase();

                          return aType.includes('response')
                            ? 0
                            : bType.includes('response')
                            ? 1
                            : 0;
                        }
                      );
                      return (
                        <div
                          className="repetition-list"
                          key={`image-preview-${stimulusType}-${repKey}`}
                        >
                          <div
                            style={{
                              margin: '0 0 1em 0',
                            }}
                          >
                            Repetition {repKey}{' '}
                            <Button
                              size="small"
                              icon={<LineChartOutlined />}
                              onClick={onRepetitionClicked(
                                stimulusType,
                                repKey
                              )}
                            >
                              Interactive View
                            </Button>
                          </div>
                          {sweeps.map(({ imageSrc }, index) => {
                            return (
                              <div
                                style={{
                                  margin: '0 0 1em 0',
                                }}
                                key={`image-preview-${stimulusType}-${repKey}-${index}`}
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
            })}
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
