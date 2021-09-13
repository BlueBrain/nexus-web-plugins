import * as React from 'react';
import { Resource, NexusClient } from '@bbp/nexus-sdk';

import useEphysDistribution from '../hooks/useEphysDistribution';
import GraphViewComponent from '../components/GraphViewComponent';

const GraphViewContainer: React.FC<{
  resource: Resource<any>;
  nexus: NexusClient;
  defaultStimulusType?: string;
  defaultRepetition?: string;
}> = ({
  resource,
  nexus,
  defaultStimulusType,
  defaultRepetition,
}) => {
  const traceCollectionData = useEphysDistribution(resource, nexus);

  return (
    <GraphViewComponent
      {...{
        traceCollectionData,
        defaultRepetition,
        defaultStimulusType,
      }}
    />
  );
};

export default GraphViewContainer;
