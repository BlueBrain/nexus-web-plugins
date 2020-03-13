import React from 'react';

import {
  SimWriterConfigResource,
  SimWriterConfigContainer,
} from '../../common';

export interface SimWriterConfigProps {
  resource: SimWriterConfigResource;
}

export const SimWriterConfig = (props: SimWriterConfigProps) => {
  const { resource } = props;

  return <SimWriterConfigContainer resourceId={resource['@id']} />;
};

export default SimWriterConfig;
