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
            `${agent.givenName}${
              agent.familyName ? ` ${agent.familyName}` : ''
            }`;
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
      if (resource.subject['@id']) {
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
      } else {
        promises.push(
          labeledPromise('subject', Promise.resolve(resource.subject))
        );
      }
    }

    // Resolve Agent
    if (resource.contribution) {
      const contributors = Array.isArray(resource.contribution)
        ? resource.contribution
        : [resource.contribution];
      contributors.forEach(contribution => {
        if (contribution.agent && contribution.agent['@id']) {
          promises.push(
            labeledPromise(
              'contribution',
              resolveContribution(orgLabel, projectLabel, contribution, nexus)
            )
          );
        } else {
          const contributedBy: ContributedBy = {};

          if (contribution.agent) {
            const agent = contribution.agent;
            contributedBy.agent =
              agent.name ||
              agent.fullName ||
              `${agent.givenName}${
                agent.familyName ? ` ${agent.familyName}` : ''
              }`;
          } else {
            contributedBy.agent = 'Agent';
          }

          if (contribution.hadRole) {
            contributedBy.role =
              contribution.hadRole.prefLabel || contribution.hadRole.label;
          }
          promises.push(
            labeledPromise('contribution', Promise.resolve(contributedBy))
          );
        }
      });
    }

    // Resolve Annotations
    if (!!resource.annotation) {
      let classification: Classification = {};

      const addClassification = (
        annotation: Annotation,
        classification: Classification
      ) => {
        if (!annotation.hasBody || Array.isArray(annotation.hasBody)) {
          return classification;
        }

        if (
          [annotation.hasBody['@type']]
            .flat()
            .some(x => x === 'MType' || x === 'nsg:MType')
        ) {
          classification.mType =
            annotation.hasBody.prefLabel || annotation.hasBody.label;
        }
        if (
          [annotation.hasBody['@type']]
            .flat()
            .some(x => x === 'EType' || x === 'nsg:EType')
        ) {
          classification.eType =
            annotation.hasBody.prefLabel || annotation.hasBody.label;
        }
        return classification;
      };

      if (Array.isArray(resource.annotation)) {
        resource.annotation.forEach((annotation: Annotation) => {
          classification = addClassification(annotation, classification);
        });
      } else {
        const annotation = resource.annotation as Annotation;
        classification = addClassification(annotation, classification);
      }
      promises.push(
        labeledPromise('classification', Promise.resolve(classification))
      );
    }

    promiseAlmost(promises)
      .then(results => {
        const values = results.filter(result => !result.error);

        // We need to make sure that the results of the promise
        // that are each tagged with a label
        // will not overwrite eachother when combined
        // this will make the value an array instead
        const data = (values as { [label: string]: any }[]).reduce(
          (memo, value) => {
            return {
              ...memo,
              ...Object.keys(value).reduce((valueObj, key) => {
                if (memo[key]) {
                  return {
                    ...valueObj,
                    [key]: [
                      ...(Array.isArray(memo[key]) ? memo[key] : [memo[key]]),
                      value[key],
                    ],
                  };
                }
                return {
                  ...valueObj,
                  [key]: value[key],
                };
              }, {}),
            };
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
        throw error;
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
