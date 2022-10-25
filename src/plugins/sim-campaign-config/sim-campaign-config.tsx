import React from 'react';

import {
  SimCampaignConfigResource,
  SimCampaignConfigContainer,
  parseUrl,
} from '../../common';

export interface SimCampaignConfigProps {
  resource: SimCampaignConfigResource;
}

export const SimCampaignConfig = (props: SimCampaignConfigProps) => {
  const { resource } = props;

  const { org, project } = parseUrl(resource._project);

  return (
    <SimCampaignConfigContainer
      org={org}
      project={project}
      resourceId={resource['@id']}
    />
  );
};

export default SimCampaignConfig;
