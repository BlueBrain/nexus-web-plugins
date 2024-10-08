import * as React from 'react';

import MarkdownCell from './Cells/MarkdownCell';
import PythonCell from './Cells/PythonCell';
import { Cell, Notebook } from './types';

import './NotebookPreview.css';

const NotebookPreview: React.FC<{ notebook?: Notebook }> = ({ notebook }) => (
    <div className="notebook-preview">
      {notebook &&
        notebook.cells.map((cell: Cell, index: number) => {
          if (cell.cell_type === 'code') {
            return <PythonCell cell={cell} key={`cell-${index}`} />;
          }

          if (cell.cell_type === 'markdown') {
            return <MarkdownCell cell={cell} key={`cell-${index}`} />;
          }

          return null;
        })}
    </div>
  );

export default NotebookPreview;
