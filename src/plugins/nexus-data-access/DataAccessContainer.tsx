import * as React from 'react';
import { Table, Button, notification } from 'antd';
import { Resource, NexusClient } from '@bbp/nexus-sdk';

export const parseProjectUrl = (projectUrl: string) => {
  const projectUrlR = /projects\/([\w-]+)\/([\w-]+)\/?$/;
  const [, org, proj] = projectUrl.match(projectUrlR) as string[];
  return [org, proj];
};

const DataAccessContainer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'URI',
      dataIndex: 'contentUrl',
      key: 'contentUrl',
    },
    {
      title: 'Action',
      dataIndex: 'contentUrl',
      key: 'contentUrl',
      render: (text: string) => makeDownloadButton(text, nexus),
    },
  ];

  const makeDownloadButton = (url: string, nexus: NexusClient) => {
    try {
      const URI = new URL(url);

      if (URI.hostname.indexOf(window.location.hostname) >= 0) {
        const [orgLabel, projectLabel] = parseProjectUrl(url);
        const downloadCallback = downloader(nexus, orgLabel, projectLabel);
        return <Button onClick={() => downloadCallback(url)}>Download</Button>;
      }
      return (
        <Button
          onClick={() => {
            try {
              navigator.clipboard.writeText(url);
            } catch {
              notification.error({
                message: 'Failed to copy the url',
              });
            }
          }}
        >
          Copy Url
        </Button>
      );
    } catch {
      const downloadCallback = downloader(nexus, orgLabel, projectLabel);
      return <Button onClick={() => downloadCallback(url)}>Download</Button>;
    }
  };

  const downloader = (
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
          data = resource['distribution'].map((d: any) => {
            return {
              name: d['name'],
              contentUrl: d['contentUrl'],
            };
          });
        } else {
          data = [
            {
              name: resource['distribution']['name'],
              contentUrl: resource['distribution']['contentUrl'],
            },
          ];
        }
      }
      return <Table columns={columns} dataSource={data} />;
    }
    return null;
  };

  return <>{renderTable(resource)}</>;
};

export default DataAccessContainer;
