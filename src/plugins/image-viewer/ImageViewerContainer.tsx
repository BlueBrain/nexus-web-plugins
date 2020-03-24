import * as React from 'react';
import { Resource, NexusClient, NexusFile } from '@bbp/nexus-sdk';

import ImageViewerComponent from './ImageViewerComponent';

const MAX_BYTES_TO_PREVIEW = 3000000;

const isFile = (resource: NexusFile) => {
  return resource['@type'] === 'File';
};

const isImage = (resource: NexusFile) => {
  return !!resource._mediaType.includes('image');
};

const ImageViewerContainer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const [{ loading, error, data }, setData] = React.useState<{
    loading: boolean;
    error: Error | null;
    data: string | null;
  }>({
    loading: true,
    error: null,
    data: null,
  });

  React.useEffect(() => {
    if (!isFile(resource as NexusFile) || !isImage(resource as NexusFile)) {
      throw new Error('Resource is not a file');
    }

    if (
      !(resource as NexusFile)._mediaType.includes('image') &&
      (resource as NexusFile)._bytes <= MAX_BYTES_TO_PREVIEW
    ) {
      return;
    }

    const [projectLabel, orgLabel, ...rest] = resource._project
      .split('/')
      .reverse();

    nexus.File.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(resource['@id']),
      { as: 'blob' }
    )
      .then(rawData => {
        const blob = new Blob([rawData as string], {
          type: (resource as NexusFile)._mediaType,
        });
        const imageSrc = URL.createObjectURL(blob);
        setData({
          data: imageSrc,
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
      !!data && URL.revokeObjectURL(data);
    };
  }, [resource['@id']]);

  return <ImageViewerComponent {...{ loading, error, data }} />;
};

export default ImageViewerContainer;
