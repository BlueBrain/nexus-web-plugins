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
      title: 'encoding type',
      dataIndex: 'encodingFormat',
      key: 'encodingFormat',
      render: (text: string) => (text ? text : '-'),
    },
    {
      title: 'Size',
      dataIndex: 'contentSize',
      key: 'contentSize',
      render: (contentSize: { value: string }) =>
        contentSize
          ? `${(parseInt(contentSize['value'], 10) / 1000000).toFixed(2)} MB`
          : '-',
    },
    {
      title: 'Action',
      dataIndex: 'contentUrl',
      key: 'contentUrl',
      render: (text: string) => renderAction(text, nexus),
    },
  ];

  const renderAction = (url: string, nexus: NexusClient) => {
    const copyButton = makeCopyButton()(url);
    const downloadCallback = createDownLoader(nexus, orgLabel, projectLabel);
    const resourceId = parseResourceId(url);
    if (resourceId) {
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
    projectLabel: string
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
          document.body.appendChild(a);
          a.href = src;
          a.click();
          URL.revokeObjectURL(src);
        })
        .catch(error => {
          notification.error({
            message: 'Failed to download the file',
          });
        });
    };
  };

  const renderTable = (resource: Resource) => {
    let data: any = [];
    if (
      resource['@type'] === 'Entity' ||
      resource['@type']?.includes('Entity')
    ) {
      if (resource['distribution']) {
        if (Array.isArray(resource['distribution'])) {
          data = resource['distribution'].map((d: any, index: any) => {
            return {
              index: index + 1,
              name: d['name'],
              contentUrl: d['contentUrl'],
              encodingFormat: d['encodingFormat'],
              contentSize: d['contentSize'],
            };
          });
        } else {
          data = [
            {
              index: 1,
              name: resource['distribution']['name'],
              contentUrl: resource['distribution']['contentUrl'],
              encodingFormat: resource['distribution']['encodingFormat'],
              contentSize: resource['distribution']['contentSize'],
            },
          ];
        }
      }
      return <Table columns={columns} dataSource={data} />;
    }
    return null;
  };
  const wrapperStyle = {
    margin: '10px'
  };
  return <div style={wrapperStyle}>{renderTable(resource)}</div>;
};

export default DataAccessContainer;
