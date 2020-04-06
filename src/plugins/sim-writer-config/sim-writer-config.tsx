import React from 'react';

import {
  SimWriterConfigResource,
  SimWriterConfigContainer,
  parseUrl,
} from '../../common';

export interface SimWriterConfigProps {
  resource: SimWriterConfigResource;
}

export const SimWriterConfig = (props: SimWriterConfigProps) => {
  const { resource } = props;

  const { org, project } = parseUrl(resource._project);

  return (
    <SimWriterConfigContainer
      org={org}
      project={project}
      resourceId={resource['@id']}
    />
  );
};

export default SimWriterConfig;
