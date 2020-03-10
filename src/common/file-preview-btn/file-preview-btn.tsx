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

import 'codemirror/mode/javascript/javascript';

import { Distribution } from '../types';
import { parseUrl } from '../nexus-tools/nexus-tools';
import { NexusClientContext } from '../nexus-client-context/nexus-client-context';

import './file-preview-btn.css';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-light.css';

interface ViewerComponentProps<T> {
  fileContent: T;
}

const ImageViewer: FunctionComponent<ViewerComponentProps<Blob>> = props => {
  return <span>test</span>;
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
  const data = JSON.parse(props.fileContent);
  const dataStr = prettyJsonStringify(data, { indent: '  ', maxLength: 80 });

  const [editor, setEditor] = useState<any>();

  useEffect(() => {
    if (!editor) return;
    setTimeout(() => editor.refresh(), 500);
  });

  return (
    <CodeMirror
      className="json-preview"
      value={dataStr}
      options={{
        mode: { name: 'javascript', json: true },
        readOnly: true,
        theme: 'base16-light',
        lineWrapping: true,
        viewportMargin: Infinity,
      }}
      onBeforeChange={() => {}}
      editorDidMount={editor => setEditor(editor)}
    />
  );
};

const fileDownloadEncoding = {
  'application/json': 'text',

  'application/pdf': 'blob',
  'application/x-hdf5': 'blob',
  'image/png': 'blob',
  'image/jpeg': 'blob',
};

const fileViewComponent = {
  'application/json': JsonViewer,
  'application/pdf': PdfViewer,
  'image/jpeg': ImageViewer,
  'image/png': ImageViewer,
};

interface FilePreviewBtnProps {
  size?: ButtonSize;
  type?: ButtonType;
  block?: boolean;
  icon?: string;

  distribution: Distribution;
}

export const FilePreviewBtn: FunctionComponent<FilePreviewBtnProps> = props => {
  const { size, type, block, icon, children, distribution } = props;
  const nexus = useContext(NexusClientContext);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [fileContent, setFileContent] = useState<any>(null);

  const fileId = distribution.contentUrl;
  const { org, project } = parseUrl(distribution.url);

  const show = async () => {
    setModalVisible(true);
    setLoading(true);

    const getFileOpts: any = {
      as: fileDownloadEncoding[distribution.encodingFormat],
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
    setModalVisible(false);
    setLoading(false);
    setFileContent(null);
  };

  const ViewComponent = (fileViewComponent as any)[distribution.encodingFormat];

  return (
    <div className="inline-block file-preview">
      <Button
        block={block}
        type={type}
        size={size ? size : 'small'}
        icon={icon}
        onClick={() => show()}
      >
        {children}
      </Button>

      <Modal
        title="File preview"
        visible={modalVisible}
        width={1024}
        bodyStyle={{
          height: 'calc(100vh - 250px)',
          overflowY: 'scroll',
        }}
        destroyOnClose
        footer={null}
        onCancel={() => close()}
      >
        {error && <p className="text-error">Failed to fetch the file</p>}
        {loading && <Spin />}
        {fileContent && !loading && modalVisible && (
          <ViewComponent fileContent={fileContent} />
        )}
      </Modal>
    </div>
  );
};

export default FilePreviewBtn;
