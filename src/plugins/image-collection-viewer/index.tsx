import * as React from 'react';
import ReactDOM from 'react-dom';
import { NexusPluginProps } from "../../common/types";
import ImageCollectionViewerContainer from './ImageCollectionViewerContainer';


export { ImageCollectionViewerContainer };

export default ({ ref, resource, nexusClient }: NexusPluginProps<{}>) => {
  ReactDOM.render(
    <ImageCollectionViewerContainer resource={resource} nexus={nexusClient} />,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
