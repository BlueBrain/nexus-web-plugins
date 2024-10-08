import * as React from 'react';
import { Empty, Spin } from 'antd';

import EphysPlot, { DataSets, RABIndex } from '../EphysPlot';

const GraphViewComponent: React.FC<{
  defaultStimulusType?: string;
  defaultRepetition?: string;
  traceCollectionData: {
    loading: boolean;
    error: Error | null;
    data: {
      RABIndex: RABIndex;
      datasets: DataSets;
    } | null;
  };
}> = ({
  traceCollectionData,
  defaultStimulusType,
  defaultRepetition,
}) => (
    <div>
      <Spin spinning={traceCollectionData.loading}>
        {!!traceCollectionData.data && (
          <EphysPlot
            options={traceCollectionData.data.datasets}
            index={traceCollectionData.data.RABIndex}
            defaultRepetition={defaultRepetition}
            defaultStimulusType={defaultStimulusType}
          />
        )}
        {!traceCollectionData.data && traceCollectionData.loading && (
          <Empty className="p-2em" description="Fetching new data" />
        )}
        {!traceCollectionData.data && !traceCollectionData.loading && (
          <Empty className="p-2em" description="No data/ No RAB available" />
        )}
        {traceCollectionData.error && (
          <Empty
            className="p-2em"
            description={`There was a problem loading the required resources: ${traceCollectionData.error.message}`}
          />
        )}
      </Spin>
    </div>
  );

export default GraphViewComponent;
