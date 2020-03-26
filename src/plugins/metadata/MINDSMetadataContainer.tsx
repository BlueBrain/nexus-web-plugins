import * as React from 'react';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
import MINDSMetadataComponent, {
  Subject,
  Annotation,
  Classification,
  Contribution,
  ContributedBy,
} from './MINDSMetadataComponent';

// will resolve all promises
// whether rejected or not
const promiseAlmost = (r: Promise<any>[]) =>
  Promise.all(
    r.map(p => (p.catch ? p.catch(e => ({ error: e })) : { result: p }))
  );

// wraps each promise in an object
// whose key is the label provided
// and whose value is the resolved promise
const labeledPromise = (label: string, promise: Promise<any>) => {
  return new Promise((resolve, reject) => {
    promise
      .then((value: any) => {
        resolve({
          [label]: value,
        });
      })
      .catch(reject);
  });
};

const resolveContribution = (
  orgLabel: string,
  projectLabel: string,
  contribution: Contribution,
  nexus: NexusClient
) => {
  return new Promise((resolve, reject) => {
    try {
      if (!contribution.agent) {
        return reject(new Error('No Agent'));
      }
      nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(contribution.agent['@id'])
      )
        .then((agent: Resource<any>) => {
          const contributedBy: ContributedBy = {};
          contributedBy.agent =
            agent.name ||
            agent.fullName ||
            `${agent.firstName}${agent.lastName ? ` ${agent.lastName}` : ''}`;
          if (contribution.hadRole) {
            contributedBy.role =
              contribution.hadRole.prefLabel || contribution.hadRole.label;
          }
          resolve(contributedBy);
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};

export const MINDSMetadataContainer: React.FC<{
  resource: Resource;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const [{ loading, error, data }, setData] = React.useState<{
    loading: boolean;
    error: Error | null;
    data: {
      subject?: Subject;
    } | null;
  }>({
    loading: true,
    error: null,
    data: null,
  });

  React.useEffect(() => {
    setData({
      loading: true,
      error: null,
      data: null,
    });

    const [projectLabel, orgLabel, ...rest] = resource._project
      .split('/')
      .reverse();

    const promises = [];

    // Resolve Subject
    if (resource.subject) {
      promises.push(
        labeledPromise(
          'subject',
          nexus.Resource.get(
            orgLabel,
            projectLabel,
            encodeURIComponent(resource.subject['@id'])
          )
        )
      );
    }

    // Resolve Agent
    if (resource.contribution) {
      promises.push(
        labeledPromise(
          'contribution',
          resolveContribution(
            orgLabel,
            projectLabel,
            resource.contribution,
            nexus
          )
        )
      );
    }

    // Resolve Annotations
    if (!!resource.annotation) {
      const classification: Classification = {};
      if (Array.isArray(resource.annotation)) {
        resource.annotation.forEach((annotation: Annotation) => {
          if (!annotation.hasBody) {
            return;
          }
          if (annotation.hasBody['@type'].includes('nsg:MType')) {
            classification.mType =
              annotation.hasBody.prefLabel || annotation.hasBody.label;
          }
          if (annotation.hasBody['@type'].includes('nsg:EType')) {
            classification.mType =
              annotation.hasBody.prefLabel || annotation.hasBody.label;
          }
        });
      } else {
        const annotation = resource.annotation as Annotation;
        if (!annotation.hasBody) {
          return;
        }
        if (annotation.hasBody['@type'].includes('nsg:MType')) {
          classification.mType =
            annotation.hasBody.prefLabel || annotation.hasBody.label;
        }
        if (annotation.hasBody['@type'].includes('nsg:EType')) {
          classification.mType =
            annotation.hasBody.prefLabel || annotation.hasBody.label;
        }
      }
      promises.push(
        labeledPromise('classification', Promise.resolve(classification))
      );
    }

    promiseAlmost(promises)
      .then(results => {
        const values = results.filter(result => !result.error);

        const data = (values as { [label: string]: any }[]).reduce(
          (memo, value) => {
            Object.keys(value).forEach(key => {
              memo[key] = value[key];
            });
            return memo;
          },
          {}
        );

        setData({
          data,
          error: null,
          loading: false,
        });
      })
      .catch(error => {
        console.error(error);
        setData({
          error,
          loading: false,
          data: null,
        });
      });
  }, [resource['@id']]);

  const props = {
    loading,
    types: resource['@type'],
    objectOfStudy: resource.objectOfStudy,
    brainLocation: resource.brainLocation,
    license: resource.license,
    ...(data || {}),
  };
  return <MINDSMetadataComponent {...props} />;
};

export default MINDSMetadataContainer;
