
import React from 'react';
import { Button } from 'antd';
import { ButtonType, ButtonSize } from 'antd/es/button';

import { Copy } from '../copy/copy';


interface CopyBtnProps {
  text: string;
  label: string;
  size?: ButtonSize;
  type?: ButtonType;
  block?: boolean;
};

export const CopyBtn = (props: CopyBtnProps) => {
  const { label, size, type, block, text } = props;

  // TODO: use children instead of label
  return (
    <Copy
      textToCopy={text}
      render={(copySuccess, triggerCopy) => (
        <Button
          block={block}
          type={type}
          size={size ? size : 'small'}
          icon="copy"
          onClick={() => triggerCopy()}
        >
          {copySuccess ? 'Copied!' : label}
        </Button>
      )}
    />
  );
};


export default CopyBtn;
