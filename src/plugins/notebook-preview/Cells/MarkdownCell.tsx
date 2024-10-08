import * as React from 'react';
import ReactMarkdown from 'react-markdown';

import { Cell } from '../types';

const MarkdownCell: React.FC<{ cell: Cell }> = ({ cell }) => (
    <div className="markdown-cell">
      <ReactMarkdown>
        {Array.isArray(cell.source) ? cell.source.join('') : cell.source}
      </ReactMarkdown>
    </div>
  );

export default MarkdownCell;
