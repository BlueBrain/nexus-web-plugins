import * as React from 'react';
import { Resource, NexusClient, NexusFile } from '@bbp/nexus-sdk';
import { Spin, Input, Button, Image, Row, Col, Empty } from 'antd';
import { chunk } from 'lodash';
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import 'antd/dist/antd.css';

type ImageCollection = {
  imageSrc: string;
  name?: string;
  size?: string;
  storage?: string;
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

  const [search, setSearch] = React.useState<string>();
  const [sortDirection, setSortDirection] = React.useState<boolean>(true);
  const [page, setPage] = React.useState<number>(1);
  const OFFSET = 10;
  const { Search } = Input;

  const [isGrid, setIsGrid] = React.useState<boolean>(true);

  const sortName = (a: string | undefined, b: string | undefined) => {
    if (a && b) {
      return a > b ? 1 : b > a ? -1 : 0;
    }
    return 0;
  };
  const filteredData = React.useMemo(
    () =>
      search && search.length > 0
        ? data
            ?.filter(d =>
              d.name?.toLocaleLowerCase().includes(search?.toLocaleLowerCase())
            )
            .sort((a, b) =>
              sortDirection
                ? sortName(a.name, b.name)
                : sortName(b.name, a.name)
            )
        : data?.sort((a, b) =>
            sortDirection ? sortName(a.name, b.name) : sortName(b.name, a.name)
          ),
    [resource, data, search, sortDirection]
  );
  const isFile = (resource: NexusFile) => {
    return resource['@type'] === 'File';
  };

  const isImage = (resource: NexusFile) => {
    return !!resource._mediaType.includes('image');
  };

  const dataChunks = React.useMemo(() => {
    return chunk(filteredData, 5);
  }, [filteredData]);

  const processImageDistribution = (
    id: string,
    orgLabel: string,
    projectLabel: string
  ) => {
    const fileUrlPattern = /files\/([\w-]+)\/([\w-]+)\/(.*)/;
    if (!fileUrlPattern.test(id)) {
      console.warn('not a nexus file.');
      return null;
    }
    const [, , , resourceId] = id.match(fileUrlPattern) as string[];
    return processImageCollection(
      decodeURIComponent(resourceId),
      orgLabel,
      projectLabel
    );
  };

  const processImageCollection = (
    id: string,
    orgLabel: string,
    projectLabel: string
  ) => {
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
      return makeImageItem(
        nexus,
        orgLabel,
        projectLabel,
        id,
        resource as Resource
      );
    });
  };

  React.useEffect(() => {
    const [projectLabel, orgLabel, ...rest] = resource._project
      .split('/')
      .reverse();
    let promises: (Promise<{
      imageSrc: string;
      name: string;
      size: number;
    } | null> | null)[] = [];

    if (!isFile(resource as NexusFile) || !isImage(resource as NexusFile)) {
      if (!resource.distribution) {
        promises = [];
      } else if (
        resource.distribution &&
        !Array.isArray(resource.distribution)
      ) {
        promises = [
          processImageDistribution(
            resource.distribution.contentUrl,
            orgLabel,
            projectLabel
          ),
        ];
      } else {
        promises = resource.distribution
          .slice(0, page * OFFSET)
          .map((distribution: any) => {
            return processImageDistribution(
              distribution.contentUrl,
              orgLabel,
              projectLabel
            );
          });
      }
    } else {
      // Do image stuff
      const imageItem = makeImageItem(
        nexus,
        orgLabel,
        projectLabel,
        resource['@id'],
        resource
      );
      promises = [imageItem];
    }

    Promise.all(promises)
      .then(imageSrcList => {
        setData({
          data: (imageSrcList.filter((image: any) => {
            return !!image?.imageSrc;
          }) as unknown) as ImageCollection,
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
  }, [resource['@id'], page]);

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

  const renderColumns = (data: ImageCollection) => {
    return data?.map((item, index) => {
      return (
        <Col span={4}>
          <Image
            alt={item.name}
            src={item.imageSrc}
            style={{
              width: '200px',
              cursor: 'pointer',
              margin: '10px 10px 10px 10px',
            }}
          />
        </Col>
      );
    });
  };

  const renderList = (data: ImageCollection) => {
    return data?.map((item, index) => {
      return (
        <Row>
          <Col span={4}>
            <Image
              alt={item.name}
              src={item.imageSrc}
              style={{
                width: '200px',
                cursor: 'pointer',
                margin: '10px 10px 10px 10px',
              }}
            />
          </Col>
          <Col span={4}>
            <div style={{ marginTop: '20px', alignItems: 'center' }}>
              <div>{item.name}</div>
              <div> Size : {item.size} MB</div>
            </div>
          </Col>
        </Row>
      );
    });
  };

  const renderGrid = () => {
    return dataChunks.map(d => {
      return <Row>{renderColumns(d)}</Row>;
    });
  };

  const renderImageRows = () => {
    return filteredData ? renderList(filteredData) : null;
  };

  if (filteredData) {
    return (
      <div className="image-collection-viewer">
        <div
          style={{
            marginBottom: '30px',
          }}
        >
          <Search
            style={{
              width: '500px',
            }}
            onSearch={val => {
              setSearch(val);
            }}
            allowClear
            placeholder="Search images by filename"
          />
          <Button
            icon={
              sortDirection ? (
                <SortAscendingOutlined />
              ) : (
                <SortDescendingOutlined />
              )
            }
            onClick={() => {
              setSortDirection(!sortDirection);
            }}
          />
          <Button
            onClick={() => {
              setIsGrid(true);
            }}
          >
            Grid
          </Button>
          <Button
            onClick={() => {
              setIsGrid(false);
            }}
          >
            List
          </Button>
        </div>
        <div>
          <Image.PreviewGroup>
            {isGrid ? renderGrid() : renderImageRows()}
          </Image.PreviewGroup>
        </div>
        {resource && resource.distribution?.length >= page * OFFSET && (
          <Button
            onClick={() => {
              setPage(page + 1);
            }}
          >
            Load More
          </Button>
        )}
        {(!resource ||
          !resource.distribution ||
          (resource.distribution &&
            Array.isArray(resource.distribution) &&
            resource.distribution.length === 0)) && <Empty />}
      </div>
    );
  }

  return <Empty />;
};

export default ImageCollectionViewerContainer;
function makeImageItem(
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  id: string,
  resource: Resource
) {
  const ImageItem = nexus.File.get(
    orgLabel,
    projectLabel,
    encodeURIComponent(id),
    {
      as: 'blob',
    }
  ).then(rawData => {
    const blob = new Blob([rawData as string], {
      type: (resource as NexusFile)._mediaType,
    });
    const imageSrc = URL.createObjectURL(blob);
    const fileResource = resource as NexusFile;
    return {
      imageSrc,
      name: fileResource._filename,
      size: fileResource._bytes / 1000,
    };
  });
  return ImageItem;
}
