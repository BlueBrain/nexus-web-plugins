
import React, { useEffect, useState } from 'react';
import get from 'lodash/get';

import { Spin } from 'antd';
import { NexusClient } from '@bbp/nexus-sdk';

import { parseUrl } from '../../../common';
import { SimWriterConfigResource } from '../types';
import SimWriterConfigComponent from '../components/sim-writer-config';


interface SimWriterConfigContainerProps {
  resourceId: string;
  nexus: NexusClient;
}

const SimWriterConfigContainer = (props: SimWriterConfigContainerProps) => {
  const { resourceId, nexus } = props;

  const [simWriterConfig, setSimWriterConfig] = useState<SimWriterConfigResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSimWriterConf = (simWriterResource: SimWriterConfigResource) => {
      const configUrl = simWriterResource.configuration.url;

      const tmplUrl = simWriterResource.template.url;
      const tmplIdMatch = tmplUrl.match(/.*\/(.*?)$/);
      const tmplId = tmplIdMatch ? tmplIdMatch[1] : '';

      const targetUrl = get(simWriterResource, 'target.url', '');
      const targetIdMatch = targetUrl.match(/.*\/(.*?)$/);
      const targetId = targetIdMatch ? targetIdMatch[1] : '';

      const { name, description } = simWriterResource;

      const parsedTmplUrl = parseUrl(tmplUrl);

      const configuration = { data: '' };
      const template = { data: '' };
      const target = { data: '' };

      return nexus
        .httpGet({ path: configUrl })
        .then(configData => {
          configuration.data = configData;
        })
        .then(() =>
          nexus.File.get(parsedTmplUrl.org, parsedTmplUrl.project, tmplId, {
            as: 'text'
          })
        )
        .then(tmplData => {
          template.data = tmplData as string;
        })
        .then(() => {
          if (!targetId) return;

          const parsedTargetUrl = parseUrl(targetUrl);
          return nexus.File.get(
            parsedTargetUrl.org,
            parsedTargetUrl.project,
            targetId,
            { as: 'text' }
          ).then(targetData => {
            target.data = targetData as string;
          });
        })
        .then(() => ({ name, description, configuration, template, target }));
    };

    nexus
      .httpGet({ path: resourceId })
      .then(getSimWriterConf)
      .then(simWriterConfig => setSimWriterConfig(simWriterConfig as SimWriterConfigResource))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Spin spinning={loading}>
      {simWriterConfig &&
        <SimWriterConfigComponent resource={simWriterConfig} />
      }
    </Spin>
  );
};


export default SimWriterConfigContainer;
