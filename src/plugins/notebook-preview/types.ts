export type Cell = {
  source: string | string[];
  cell_type: string;
  [key: string]: any;
};

export type Notebook = {
  cells: Cell[];
  metadata: {
    [key: string]: any;
  };
  [key: string]: any;
};
