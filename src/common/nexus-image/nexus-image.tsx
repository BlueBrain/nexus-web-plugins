import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Lightbox from 'react-image-lightbox';
import { NexusClient } from '@bbp/nexus-sdk';

import { parseUrl } from '../nexus-tools/nexus-tools';

import 'react-image-lightbox/style.css';
import './nexus-image.css';

interface NexusImageContainerProps {
  imageUrl: string; // nexus selfUrl, if org ond project will be treated as nexus id
  nexus: NexusClient;
  org?: string;
  project?: string;
}

interface NexusImageProps {
  imageData: any;
}

const NexusImageComponent = (props: NexusImageProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageObjectUrl] = useState<string>(
    URL.createObjectURL(props.imageData)
  );

  useEffect(() => {
    return () => URL.revokeObjectURL(imageObjectUrl);
  }, []);

  return (
    <>
      {isOpen && (
        <Lightbox
          mainSrc={imageObjectUrl}
          onCloseRequest={() => setIsOpen(false)}
        />
      )}
      <div
        className="nexus-image-container"
        onClick={(e: React.MouseEvent) => {
          setIsOpen(true);
          e.stopPropagation();
        }}
      >
        <img src={imageObjectUrl} alt="" />
      </div>
    </>
  );
};

export const NexusImage = (props: NexusImageContainerProps) => {
  const { imageUrl, nexus, org, project } = props;

  const [loading, setLoading] = React.useState(true);
  const [imageData, setImageData] = React.useState<string | null>(null);

  const { org: imageOrg, project: imageProject } =
    org && project ? { org, project } : parseUrl(imageUrl);

  React.useEffect(() => {
    nexus.File.get(imageOrg, imageProject, encodeURIComponent(imageUrl), {
      as: 'blob',
    })
      .then((imageData) => setImageData(imageData as string))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading && (
        <Spin spinning={loading}>
          <div className="nexus-image-container"></div>
        </Spin>
      )}
      {imageData && <NexusImageComponent imageData={imageData} />}
    </div>
  );
};

export default NexusImage;
