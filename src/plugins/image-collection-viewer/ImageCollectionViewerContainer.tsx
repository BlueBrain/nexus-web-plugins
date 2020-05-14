import * as React from 'react';
import { Resource, NexusClient, NexusFile } from '@bbp/nexus-sdk';

import ImageCollectionViewerComponent, {
  ImageCollection,
} from './ImageCollectionViewerComponent';

const ImageCollectionViewerContainer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const [{ loading, error, data }, setData] = React.useState<{
    loading: boolean;
    error: Error | null;
    data: ImageCollection | null;
  }>({
    loading: true,
    error: null,
    data: null,
  });

  React.useEffect(() => {
    if (!resource.image) {
      throw new Error('No Image Collection Property Found');
    }

    const [projectLabel, orgLabel, ...rest] = resource._project
      .split('/')
      .reverse();

    const promises = (Array.isArray(resource.image)
      ? resource.image
      : [resource.image]
    ).map(({ '@id': id }) => {
      return nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(id)
      ).then(resource => {
        const MAX_BYTES_TO_PREVIEW = 3000000;

        const isFile = (resource: NexusFile) => {
          return resource['@type'] === 'File';
        };

        const isImage = (resource: NexusFile) => {
          return !!resource._mediaType.includes('image');
        };

        if (!isFile(resource as NexusFile) || !isImage(resource as NexusFile)) {
          console.warn(`${resource['@id']} is not an image File`);
          return null;
        }

        if (
          !(resource as NexusFile)._mediaType.includes('image') &&
          (resource as NexusFile)._bytes <= MAX_BYTES_TO_PREVIEW
        ) {
          console.warn('not showing because image is too large');
          return null;
        }

        return nexus.File.get(orgLabel, projectLabel, encodeURIComponent(id), {
          as: 'blob',
        }).then(rawData => {
          const blob = new Blob([rawData as string], {
            type: (resource as NexusFile)._mediaType,
          });
          const imageSrc = URL.createObjectURL(blob);
          return { imageSrc, name: resource['@id'] };
        });
      });
    });

    Promise.all(promises)
      .then(imageSrcList => {
        setData({
          data: imageSrcList.filter(
            image => !!image?.imageSrc
          ) as ImageCollection,
          error: null,
          loading: false,
        });
      })
      .catch(error => {
        setData({
          error,
          data: null,
          loading: false,
        });
      });

    return () => {
      // Images created via the URL.createObjectURL must be revoked
      // or it will persist in memory and lead to leaks and slowing performance
      if (data) {
        data.forEach(({ imageSrc }) => URL.revokeObjectURL(imageSrc));
      }
    };
  }, [resource['@id']]);

  return <ImageCollectionViewerComponent {...{ loading, error, data }} />;
};

export default ImageCollectionViewerContainer;
