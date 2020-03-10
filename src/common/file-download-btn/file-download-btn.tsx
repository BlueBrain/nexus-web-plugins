import React, { FunctionComponent, useContext } from 'react';
import { saveAs } from 'file-saver';
import get from 'lodash/get';
import { Button, notification } from 'antd';
import { ButtonType, ButtonSize } from 'antd/es/button';

import { Distribution } from '../types';
import { parseUrl } from '../nexus-tools/nexus-tools';
import { NexusClientContext } from '../nexus-client-context/nexus-client-context';

interface FileDownloadBtnProps {
  size?: ButtonSize;
  type?: ButtonType;
  block?: boolean;
  icon?: string;

  distribution: Distribution;
}

export const FileDownloadBtn: FunctionComponent<FileDownloadBtnProps> = props => {
  const { size, type, block, icon, children, distribution } = props;
  const nexus = useContext(NexusClientContext);

  const { name, contentUrl } = distribution;

  const { org, project } = parseUrl(contentUrl);
  const fileId = encodeURIComponent(contentUrl);

  const notifyError = (err: Error) =>
    notification.error({
      message: 'Error',
      description: get(err, 'message', err),
    });

  const download = async () => {
    let fileBlob;
    try {
      fileBlob = (await nexus.File.get(org, project, fileId, {
        as: 'blob',
      })) as Blob;
    } catch (err) {
      notifyError(err);
    }

    if (!fileBlob) return;

    saveAs(fileBlob, name);
  };

  return (
    <Button
      block={block}
      type={type}
      size={size ? size : 'small'}
      icon={icon}
      onClick={() => download()}
    >
      {children}
    </Button>
  );
};

export default FileDownloadBtn;
