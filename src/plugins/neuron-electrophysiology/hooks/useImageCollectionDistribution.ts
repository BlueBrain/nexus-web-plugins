import * as React from 'react';
import { NexusClient, NexusFile, Resource } from '@bbp/nexus-sdk';

import { propAsArray, RemoteData } from '../../../common';
import {
  chainPredicates,
  isFile,
  hasImage,
  not,
} from '../../../common/nexus-maybe';
import { uniqueArrayOfObjectsByKey } from '../../../common/arrays';
import { ImageCollection, ImageItem } from '../components/ImageViewComponent';

const MAX_BYTES_TO_PREVIEW = 3000000;

export type EPhysImageItem = {
  '@id': string;
  repetition: number;
  about?: string;
  stimulusType: {
    '@id': string;
  };
};

export function useImageCollectionDistribution(
  resource: Resource,
  nexus: NexusClient,
  opt?: {
    imageFilterPredicate?: (imageItem: EPhysImageItem) => boolean;
    resultsFilterPredicate?: (imageItem: ImageItem) => boolean;
  }
) {
  const {
    imageFilterPredicate = () => true,
    resultsFilterPredicate = () => true,
  } = opt || {};

  const [{ loading, error, data }, setData] = React.useState<
    RemoteData<ImageCollection>
  >({
    loading: true,
    error: null,
    data: null,
  });

  const resourceId = resource['@id'];

  const [projectLabel, orgLabel] = resource._project.split('/').reverse();

  const imageCollection = React.useMemo(() => new Map<string, ImageItem>(), [
    resourceId,
  ]);

  React.useEffect(() => {
    try {
      if (!resource.image && !resource.distribution) {
        throw new Error('No Image Collection Property Found');
      }

      const processImageCollection = async ({
        stimulusType,
        '@id': id,
        repetition,
        about,
      }: EPhysImageItem) => {
        const ImageResourceMaybe = (await nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(id)
        )) as NexusFile;

        if (chainPredicates([not(isFile), not(hasImage)])(ImageResourceMaybe)) {
          return;
        }

        if (
          !ImageResourceMaybe._mediaType.includes('image') &&
          ImageResourceMaybe._bytes <= MAX_BYTES_TO_PREVIEW
        ) {
          console.warn(
            `not previewing ${ImageResourceMaybe['@id']} because image is too large`
          );
          return;
        }

        const imageSrc = id;

        const [stimulusTypeKey] = stimulusType['@id'].split('/').reverse();
        const fileName = ImageResourceMaybe._filename;

        const stimulusCollection = imageCollection.get(stimulusTypeKey);
        if (stimulusCollection) {
          // Make sure rep list is unique
          stimulusCollection.repetitions[
            repetition
          ] = uniqueArrayOfObjectsByKey<
            { imageSrc: string; fileName: string; about?: string },
            keyof { imageSrc: string; fileName: string; about: string }
          >(
            [
              ...(stimulusCollection.repetitions[repetition] || []),
              { imageSrc, fileName, about },
            ],
            'imageSrc'
          );
        } else {
          imageCollection.set(stimulusTypeKey, {
            stimulusType: stimulusTypeKey,
            repetitions: {
              [repetition]: [{ imageSrc, fileName, about }],
            },
          });
        }
      };

      setData({
        data: null,
        error: null,
        loading: true,
      });

      const promises = propAsArray<EPhysImageItem>(resource, 'image')
        .filter(imageFilterPredicate)
        .map(imageItem => processImageCollection(imageItem));

      Promise.all(promises)
        .then(() => {
          // filter values we want
          const data = new Map(
            [...imageCollection].filter(([key, value]) =>
              resultsFilterPredicate(value)
            )
          );

          setData({
            data,
            error: null,
            loading: false,
          });
        })
        .catch(error => {
          throw error;
        });
    } catch (error) {
      setData({
        error,
        data: null,
        loading: false,
      });
    }
  }, [resourceId, imageFilterPredicate]);

  return { loading, error, data };
}
