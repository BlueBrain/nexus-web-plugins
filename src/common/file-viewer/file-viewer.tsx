import React, {
  FunctionComponent,
  useState,
  useContext,
  useEffect,
} from 'react';
import { Button, Modal, Spin } from 'antd';
import { ButtonType, ButtonSize } from 'antd/es/button';
import prettyJsonStringify from 'json-stringify-pretty-compact';
import { Controlled as CodeMirror } from 'react-codemirror2';
import Lightbox from 'react-image-lightbox';

import 'codemirror/mode/javascript/javascript';

import { Distribution } from '../types';
import { parseUrl } from '../nexus-tools/nexus-tools';
import { NexusClientContext } from '../nexus-client-context/nexus-client-context';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-light.css';

import 'react-image-lightbox/style.css';

import './file-viewer.css';

interface ViewerComponentProps<T> {
  fileContent: T;
}

interface ImageViewerProps {
  src: string;
  onClose: Function;
}

const ImageViewer = (props: ImageViewerProps) => {
  const { src, onClose } = props;
  return <Lightbox mainSrc={src} onCloseRequest={() => onClose()} />;
};

interface NexusImageProps {
  distribution: Distribution;
  alt?: string;
  className?: string;
  onClick?: Function;
}
const NexusImage = (props: NexusImageProps) => {
  const { distribution, alt, className, onClick } = props;
  const nexus = useContext(NexusClientContext);

  const [loading, setLoading] = useState<boolean>(true);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const fileId = distribution.contentUrl;
  const { org, project } = parseUrl(distribution.url);

  const fetch = async () => {
    const imageBlob = (await nexus.File.get(
      org,
      project,
      encodeURIComponent(fileId),
      { as: 'blob' }
    )) as Blob;

    setImageBlob(imageBlob);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  if (loading) {
    return <Spin />;
  }

  if (imageBlob) {
    return (
      <img
        className={className}
        src={URL.createObjectURL(imageBlob)}
        alt={alt}
        onClick={() => onClick && onClick()}
      />
    );
  }

  return <span>Error loading image</span>;
};

const PdfViewer: FunctionComponent<ViewerComponentProps<Blob>> = props => {
  const src = URL.createObjectURL(props.fileContent);

  return (
    <object className="modal-pdf-viewer" data={src} type="application/pdf">
      <embed className="modal-pdf-viewer" src={src} />
    </object>
  );
};

const JsonViewer: FunctionComponent<ViewerComponentProps<string>> = props => {
  return (
    <CodeMirror
      value={prettyJsonStringify(props.fileContent, {
        indent: '  ',
        maxLength: 80,
      })}
      options={{
        mode: { name: 'javascript', json: true },
        readOnly: true,
        theme: 'base16-light',
        lineNumbers: true,
        lineWrapping: true,
      }}
      onBeforeChange={() => {}}
    />
  );
};

// TODO: merge encoding and type objects into one
const fileDownloadEncoding = {
  'application/json': 'text',

  'application/pdf': 'blob',
  'application/x-hdf5': 'blob',
  'image/png': 'blob',
  'image/jpeg': 'blob',
};

const componentTypes = {
  'application/json': 'json',
  'application/pdf': 'pdf',
  'image/jpeg': 'image',
  'image/png': 'image',
};

interface FilePreviewBtnProps {
  size?: ButtonSize;
  type?: ButtonType;
  block?: boolean;
  icon?: string;

  mainDistribution: Distribution;
  previewDistribution?: Distribution;
}

export const FileViewer: FunctionComponent<FilePreviewBtnProps> = props => {
  const {
    size,
    type,
    block,
    icon,
    children,
    mainDistribution,
    previewDistribution,
  } = props;
  const nexus = useContext(NexusClientContext);

  const [opened, setOpened] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [fileContent, setFileContent] = useState<any>(null);

  const fileId = mainDistribution.contentUrl;
  const { org, project } = parseUrl(mainDistribution.url);

  const show = async () => {
    setOpened(true);
    setLoading(true);

    const getFileOpts: any = {
      as: fileDownloadEncoding[mainDistribution.encodingFormat],
    };

    let content = null;
    try {
      content = await nexus.File.get(
        org,
        project,
        encodeURIComponent(fileId),
        getFileOpts
      );
    } catch (error) {
      setError(error);
    }

    setFileContent(content);
    setLoading(false);
  };

  const close = () => {
    setOpened(false);
    setLoading(false);
    setFileContent(null);
  };

  const componentType: string = (componentTypes as any)[
    mainDistribution.encodingFormat
  ];

  return (
    <>
      {previewDistribution ? (
        <NexusImage
          className="file-viewer--preview"
          distribution={previewDistribution}
          onClick={() => show()}
        />
      ) : (
        <Button
          block={block}
          type={type}
          size={size ? size : 'small'}
          icon={icon}
          onClick={() => show()}
        >
          {children || 'View'}
        </Button>
      )}

      {componentType === 'image' && opened && fileContent && (
        <ImageViewer
          src={URL.createObjectURL(fileContent)}
          onClose={() => close()}
        />
      )}

      {['pdf', 'json'].includes(componentType) && (
        <Modal
          title="File preview"
          visible={opened}
          width={1024}
          bodyStyle={{
            height: 'calc(100vh - 250px)',
            overflowY: 'scroll',
          }}
          destroyOnClose
          footer={null}
          onCancel={() => close()}
        >
          {loading && <Spin />}
          {error && (
            <span className="text-error">Error fetching a resource</span>
          )}
          {fileContent && !loading && componentType === 'pdf' && (
            <PdfViewer fileContent={fileContent} />
          )}
          {fileContent && !loading && componentType === 'json' && (
            <JsonViewer fileContent={fileContent} />
          )}
        </Modal>
      )}
    </>
  );
};

export default FileViewer;
