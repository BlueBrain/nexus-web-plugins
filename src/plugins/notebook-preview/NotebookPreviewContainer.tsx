import * as React from 'react';
import { notification, Spin, Alert } from 'antd';
import { NexusClient, Resource } from '@bbp/nexus-sdk';

import NotebookPreview from './NotebookPreview';
import { Notebook } from './types';

const isNotebookFile = (url: string) => {
  return url.split('.').pop() === 'ipynb';
};

const NotebookPreviewContainer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const [code, setCode] = React.useState<Notebook>();
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    // TODO support code files stored in Nexus
    if (resource.url && isNotebookFile(resource.url)) {
      setLoading(true);

      fetch(resource.url)
        .then(response => {
          return response.json();
        })
        .then(response => {
          setCode(response);
          setLoading(false);
        })
        .catch(error => {
          notification.error({
            message: 'Failed to load the file',
          });
          setLoading(false);
        });
    }
  }, []);

  if (!resource.url) {
    return (
      <Alert
        message="Url is not found in the resource payload"
        type="error"
        showIcon
      />
    );
  }

  if (resource.url && !isNotebookFile(resource.url)) {
    return (
      <Alert
        message="This plugin supports Jupyter Notebook files (.ipynb) only."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <Spin spinning={loading}>
      <NotebookPreview notebook={code} />
    </Spin>
  );
};

export default NotebookPreviewContainer;
