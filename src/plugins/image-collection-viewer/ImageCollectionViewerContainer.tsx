import * as React from 'react';
import { Resource, NexusClient, NexusFile } from '@bbp/nexus-sdk';
import { List, Popover, Card, Spin, Menu, Dropdown } from 'antd';
import 'antd/dist/antd.css';
import { ClickParam } from 'antd/lib/menu';

type ImageCollection = {
  imageSrc: string;
  name?: string;
}[];

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

  const memoizedSTypes = React.useMemo(() => {
    const t = Array.isArray(resource.image)
      ? resource.image.map(({ stimulusType: sType }) => {
          if (sType) {
            const typeString = sType['@id'].split('/');
            return typeString[typeString.length - 1];
          }
          return '';
        })
      : [];
    // remove duplicates.
    const returnArray = [...new Set(t)];
    // remove empty strings, if any.
    returnArray.splice(returnArray.indexOf(''), 1);
    return returnArray;
  }, [resource]);

  const [selectedType, setSelectedType] = React.useState<String>('All');
  const filteredData = React.useMemo(() => {
    if (selectedType === 'All') {
      return data;
    }
    const selectedImages = Array.isArray(resource.image)
      ? resource.image.filter(i => {
          const typeString = i.stimulusType['@id'].split('/');
          return typeString[typeString.length - 1] === selectedType;
        })
      : [resource.image];
    const selectedImageIds = selectedImages.map(i => i['@id']);
    return data?.filter(d => selectedImageIds.includes(d.name));
  }, [resource, data, selectedType]);

  const menu = (
    <Menu
      onClick={(param: ClickParam) => {
        setSelectedType(param.key);
      }}
    >
      <Menu.Item key={'All'}>All</Menu.Item>
      {memoizedSTypes.map(v => (
        <Menu.Item key={v}>{v}</Menu.Item>
      ))}
    </Menu>
  );

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

  if (error) {
    return <>{error.message}</>;
  }
  if (loading) {
    return (
      <div className="image-collection-viewer">
        <div className="wrapper -loading">
          <div className="skeleton">
            <Spin />
          </div>
        </div>
      </div>
    );
  }

  if (filteredData) {
    return (
      <div className="image-collection-viewer">
        <Dropdown overlay={menu}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            {selectedType}
          </a>
        </Dropdown>
        <List
          grid={{
            gutter: 12,
            column: 3,
          }}
          dataSource={filteredData}
          renderItem={item => {
            const content = (
              <Card
                hoverable
                style={{ width: '700px' }}
                cover={<img alt={item.name} src={item.imageSrc} />}
              >
                <a download href={item.imageSrc} title={item.name}>
                  Download
                </a>
              </Card>
            );
            return (
              <List.Item>
                <Popover content={content} trigger="click">
                  <img
                    alt={item.name}
                    src={item.imageSrc}
                    style={{ width: '200px', cursor: 'pointer' }}
                  />
                </Popover>
              </List.Item>
            );
          }}
        />
      </div>
    );
  }

  return null;
};

export default ImageCollectionViewerContainer;
