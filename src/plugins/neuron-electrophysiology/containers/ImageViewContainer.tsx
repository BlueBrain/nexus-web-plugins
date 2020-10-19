import * as React from 'react';
import { NexusClient, Resource } from '@bbp/nexus-sdk';

import { NexusImage } from '../../../common';
import ImageViewComponent from '../components/ImageViewComponent';
import {
  EPhysImageItem,
  ImageItem,
  useImageCollectionDistribution,
} from '../hooks/useImageCollectionDistribution';

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
  const imageFilterPredicate = React.useMemo(() => {
    return (image: EPhysImageItem) => {
      const typeString = getStimulusTypeString(image);
      if (stimulusType === 'All') {
        return true;
      }
      if (stimulusType === typeString) {
        return true;
      }
      return false;
    };
  }, [stimulusType]);

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

  const [projectLabel, orgLabel] = resource._project.split('/').reverse();

  return (
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
  );
};

export default ImageViewContainer;
