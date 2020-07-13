import * as React from 'react';
import ReactDOM from 'react-dom';
import { NexusPluginProps } from '../../common/types';
import EphysDistributionContainer from './EphysDistributionContainer';

export { EphysDistributionContainer };

export default ({ ref, resource, nexusClient }: NexusPluginProps<{}>) => {
  ReactDOM.render(
    <EphysDistributionContainer resource={resource} nexus={nexusClient} />,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
