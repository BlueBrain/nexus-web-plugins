import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';

import 'codemirror/mode/python/python';
import 'codemirror/theme/elegant.css';

import { Cell } from '../types';

const PythonCell: React.FC<{ cell: Cell }> = ({ cell }) => (
    <div className="code-cell">
      <CodeMirror
        value={Array.isArray(cell.source) ? cell.source.join('') : cell.source}
        options={{
          mode: { name: 'python' },
          theme: 'elegant',
          lineNumbers: false,
          viewportMargin: Infinity,
          lineWrapping: true,
        }}
      />
    </div>
  );

export default PythonCell;
