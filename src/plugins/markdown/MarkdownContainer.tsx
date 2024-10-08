import * as React from 'react';
import { Empty, Skeleton } from 'antd';
import Handlebars from 'handlebars';
import { match, when } from 'ts-pattern';
import { NexusClient, Resource } from '@bbp/nexus-sdk';

import useAsyncCall from "../../common/hooks/useAsyncCall";
import MarkdownComponent from './MarkdownComponent';

const parseMarkdown = async (resource: Resource): Promise<string> =>
  Handlebars.compile(resource.description)(resource);

const MarkdownContainer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
}> = ({ resource }) => {
  const resourceID = resource['@id'];
  const asyncData = useAsyncCall<string>(parseMarkdown(resource), [resourceID]);

  return match(asyncData)
    .with({ loading: true }, () => <Skeleton active />)
    .with({ error: when(error => !!error) }, ({ error }) =>
      error ? (
        <Empty
          description={`There was an error parsing the description: \n ${error?.message}`}
        />
      ) : (
        <></>
      )
    )
    .with({ data: when(data => !!data) }, ({ data: markdown }) =>
      markdown ? <MarkdownComponent markdown={markdown} /> : <></>
    )
    .otherwise(() => <Empty description="An unknown error occured" />);
};

export default MarkdownContainer;
