import * as React from 'react';
import { NexusClient, Resource } from '@bbp/nexus-sdk';

import { NexusImage } from '../../../common';
import ImageViewComponent, {
  ImageItem,
} from '../components/ImageViewComponent';
import {
  EPhysImageItem,
  useImageCollectionDistribution,
} from '../hooks/useImageCollectionDistribution';
import { Button, Spin } from 'antd';

// Only fetch three traces at a time.
const PAGINATION_OFFSET = 3;

const getStimulusTypeString = (image: EPhysImageItem) => {
  const typeString = image.stimulusType['@id'].split('/');
  return typeString[typeString.length - 1];
};

const ImageViewContainer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
  stimulusTypeMap: Map<string, number>;
  stimulusType: string;
  onStimulusChange: (value: string) => void;
  onRepetitionClicked: (stimulusType: string, rep: string) => () => void;
}> = ({
  stimulusType,
  resource,
  nexus,
  stimulusTypeMap,
  onRepetitionClicked,
  onStimulusChange,
}) => {
  const [page, setPage] = React.useState<number>(0);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const imageFilterPredicate = React.useMemo(() => {
    return (image: EPhysImageItem) => {
      const typeString = getStimulusTypeString(image);
      // Pagination logic. When stimulusType is All, filter out types that does not belong to the page.
      // All stimulusTypes before the current page will already be in the imageCollection (useImageCollectionDistribution).
      // All stimulusTypes after the current page will be excluded and will not be fetched now.
      if (stimulusType === 'All') {
        const allStimulus = Array.from(stimulusTypeMap.keys());
        const pagedTypes = allStimulus.slice(
          page * PAGINATION_OFFSET,
          page * PAGINATION_OFFSET + PAGINATION_OFFSET
        );
        return pagedTypes.includes(typeString);
      }
      if (stimulusType === typeString) {
        return true;
      }
      return false;
    };
  }, [stimulusType, page]);

  const resultsFilterPredicate = React.useMemo(() => {
    return (imageItem: ImageItem) => {
      if (stimulusType === 'All') {
        return true;
      }
      return imageItem.stimulusType === stimulusType;
    };
  }, [stimulusType]);

  const imageCollectionData = useImageCollectionDistribution(resource, nexus, {
    imageFilterPredicate,
    resultsFilterPredicate,
  });

  const isLastPage = React.useMemo(() => {
    if (stimulusType !== 'All') {
      return true;
    }
    if (imageCollectionData.data) {
      const totalStimulus = Array.from(stimulusTypeMap.keys()).length;
      const remaining =
        totalStimulus - page * PAGINATION_OFFSET - PAGINATION_OFFSET <= 0;
      return remaining;
    }
    return false;
  }, [page, stimulusType, stimulusTypeMap]);

  const [projectLabel, orgLabel] = resource._project.split('/').reverse();

  return (
    <>
      <ImageViewComponent
        {...{
          stimulusTypeMap,
          stimulusType,
          imageCollectionData,
          onStimulusChange,
          onRepetitionClicked,
          imagePreview: ({ imageUrl }) => (
            // We need to put this as a prop because it contains effects (container, not component)
            <NexusImage
              {...{
                nexus,
                imageUrl,
                org: orgLabel,
                project: projectLabel,
              }}
            ></NexusImage>
          ),
        }}
      />
      {isLastPage ? null : (
        <div style={{ marginBottom: '30px' }}>
          <Spin spinning={imageCollectionData.loading}>
            <Button
              onClick={() => {
                setPage(page + 1);
              }}
            >
              Load More
            </Button>
          </Spin>
        </div>
      )}
    </>
  );
};

export default ImageViewContainer;
