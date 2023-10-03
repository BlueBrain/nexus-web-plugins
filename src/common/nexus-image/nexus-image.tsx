import React, { useState, useEffect } from 'react';
import { Skeleton, Spin } from 'antd';
import Lightbox from 'react-image-lightbox';
import { NexusClient } from '@bbp/nexus-sdk';

import { parseUrl } from '../nexus-tools/nexus-tools';

import 'react-image-lightbox/style.css';
import './nexus-image.css';

export interface NexusImageContainerProps {
  imageUrl: string; // nexus selfUrl, if org ond project will be treated as nexus id
  nexus: NexusClient;
  org?: string;
  project?: string;
}

interface NexusImageProps {
  imageData: any;
}

export function NexusImageComponent(props: NexusImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<string>();

  useEffect(() => {
    const data = URL.createObjectURL(props.imageData);
    setData(data);
    return () => URL.revokeObjectURL(data);
  }, [props.imageData]);

  const handleClick = (e: React.MouseEvent) => {
    setIsOpen(true);
    e.stopPropagation();
  };

  return data ? (
    <>
      {isOpen && (
        <Lightbox mainSrc={data} onCloseRequest={() => setIsOpen(false)} />
      )}
      <div className="nexus-image-container" onClick={handleClick}>
        <img src={data} alt="" />
      </div>
    </>
  ) : null;
}

export function NexusImage(props: NexusImageContainerProps) {
  const { imageUrl, nexus, org, project } = props;

  const [loading, setLoading] = React.useState(true);
  const [imageData, setImageData] = React.useState<string | null>(null);

  const { org: imageOrg, project: imageProject } =
    org && project ? { org, project } : parseUrl(imageUrl);

  React.useEffect(() => {
    // TODO: We can implement a caching layer here based on file revision
    nexus.File.get(imageOrg, imageProject, encodeURIComponent(imageUrl), {
      as: 'blob',
    })
      .then(imageData => setImageData(imageData as string))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading && (
        <Spin spinning={loading}>
          <div className="nexus-image-container">
            <Skeleton.Image />
          </div>
        </Spin>
      )}
      {imageData && <NexusImageComponent imageData={imageData} />}
    </div>
  );
}

export default NexusImage;
