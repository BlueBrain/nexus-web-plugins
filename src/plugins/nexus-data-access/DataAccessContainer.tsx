import * as React from 'react';
import { Table, Button, notification } from 'antd';
import { Resource, NexusClient } from '@bbp/nexus-sdk';

export const parseProjectUrl = (projectUrl: string) => {
  const projectUrlR = /projects\/([\w-]+)\/([\w-]+)\/?$/;
  const [, org, proj] = projectUrl.match(projectUrlR) as string[];
  return [org, proj];
};

export const parseResourceId = (url: string) => {
  const fileUrlPattern = /files\/([\w-]+)\/([\w-]+)\/(.*)/;
  if (fileUrlPattern.test(url)) {
    const [, , , resourceId] = url.match(fileUrlPattern) as string[];
    return decodeURIComponent(resourceId);
  }

  if (/[w-]+/.test(url)) {
    return url;
  }
};

const DataAccessContainer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
  const columns = [
    {
      title: 'No.',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (text ? text : '-'),
    },
    {
      title: 'Encoding Format',
      dataIndex: 'encodingFormat',
      key: 'encodingFormat',
      render: (text: string) => (text ? text : '-'),
    },
    {
      title: 'Size',
      dataIndex: 'contentSize',
      key: 'contentSize',
      render: (contentSize: { value: string }) => renderFileSize(contentSize),
    },
    {
      title: 'Action',
      dataIndex: 'contentUrl',
      key: 'contentUrl',
      render: (
        contentUrl: { url: string; name: string; hasDigest: boolean },
        externalUrl: string
      ) => renderAction(contentUrl, externalUrl, nexus),
    },
  ];

  const renderFileSize = (contentSize: { value: string }) => {
    if (!contentSize) {
      return '-';
    }
    const sizeInMB = (parseInt(contentSize.value, 10) / 1000000).toFixed(2);
    if (sizeInMB !== '0.00') {
      return `${sizeInMB} MB`;
    }
    return `${contentSize.value} Bytes`;
  };

  const renderAction = (
    contentUrl: { url: string; name: string; hasDigest: boolean },
    externalUrl: string,
    nexus: NexusClient
  ) => {
    const copyButton = makeCopyButton()(contentUrl.url || externalUrl);

    const downloadCallback = createDownLoader(
      nexus,
      orgLabel,
      projectLabel,
      contentUrl.name
    );

    const resourceId = parseResourceId(contentUrl.url);

    if (resourceId && contentUrl.hasDigest) {
      return (
        <>
          {' '}
          {copyButton}{' '}
          <Button onClick={() => downloadCallback(resourceId)}>
            Download File
          </Button>{' '}
        </>
      );
    }
    return copyButton;
  };

  const makeCopyButton = () => {
    return (Id: string) => {
      return (
        <Button
          onClick={() => {
            try {
              navigator.clipboard.writeText(Id);
              notification.success({ message: 'URL Copied to Clip Board' });
            } catch {
              notification.error({
                message: 'Failed to copy the url',
              });
            }
          }}
        >
          Copy URI
        </Button>
      );
    };
  };

  const createDownLoader = (
    nexus: NexusClient,
    orgLabel: string,
    projectLabel: string,
    name: string
  ) => {
    return (resourceId: string) => {
      nexus.File.get(orgLabel, projectLabel, encodeURIComponent(resourceId), {
        as: 'blob',
      })
        .then(rawData => {
          const blob = new Blob([rawData as string], { type: 'octet/stream' });
          const src = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.download = name;
          document.body.appendChild(a);
          a.href = src;
          a.click();
          URL.revokeObjectURL(src);
        })
        .catch(error => {
          notification.error({
            message: 'Failed to download the file',
            description: error.reason || error.message,
          });
        });
    };
  };

  const distributionItem = (distribution: any, index: number = 0) => {
    const {
      name,
      repository,
      contentUrl,
      url,
      encodingFormat,
      contentSize,
      digest,
    } = distribution;

    return {
      index: index + 1,
      name: name || repository.name || repository['@id'],
      contentUrl: {
        url: contentUrl,
        name: name,
        hasDigest: !!digest,
      },
      externalUrl: url,
      encodingFormat: encodingFormat || '-',
      contentSize,
    };
  };

  const renderTable = (resource: Resource) => {
    let data: any = [];

    if (resource.distribution) {
      const { distribution } = resource;

      if (Array.isArray(distribution)) {
        data = distribution.map((d: any, index: any) => {
          return distributionItem(d, index);
        });
      } else {
        data = [distributionItem(distribution)];
      }
    }

    return <Table columns={columns} dataSource={data} />;
  };

  const wrapperStyle = {
    margin: '10px',
  };

  return <div style={wrapperStyle}>{renderTable(resource)}</div>;
};

export default DataAccessContainer;
