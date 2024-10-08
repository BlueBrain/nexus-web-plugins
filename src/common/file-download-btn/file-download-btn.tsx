import React, { FunctionComponent, useContext, useState } from 'react';
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
  children: React.ReactNode;
  distribution: Distribution;
}

export const FileDownloadBtn: FunctionComponent<FileDownloadBtnProps> = props => {
  const { size, type, block, icon, children, distribution } = props;
  const nexus = useContext(NexusClientContext);

  const [loading, setLoading] = useState<boolean>(false);

  const { name, contentUrl } = distribution;

  const { org, project } = parseUrl(contentUrl);
  const fileId = encodeURIComponent(contentUrl);

  const notifyError = (err: Error) =>
    notification.error({
      message: 'Error',
      description: <span>{JSON.stringify(get(err, 'message', err))}</span>,
    });

  const download = async () => {
    setLoading(true);

    let fileBlob;
    try {
      fileBlob = (await nexus.File.get(org, project, fileId, {
        as: 'blob',
      })) as Blob;
    } catch (err) {
      notifyError(err as any);
    }

    setLoading(false);
    if (!fileBlob) return;

    saveAs(fileBlob, name);
  };

  return (
    <Button
      block={block}
      type={type}
      size={size || 'small'}
      disabled={loading}
      icon={loading ? 'loading' : icon}
      onClick={() => download()}
    >
      {children}
    </Button>
  );
};

export default FileDownloadBtn;
