import * as React from 'react';

import { Descriptions, Spin } from 'antd';
import { Resource } from '@bbp/nexus-sdk';

import './metadata-component.css';

export type BrainLocation = {
  brainRegion: {
    '@id': string;
    label: string;
  };
  layer: {
    '@id': string;
    label: string;
  };
};

export type Subject = {
  species: {
    '@id': string;
    label: string;
  };
};

export type ObjectOfStudy = {
  '@id': string;
  '@type': string;
  label: string;
};

export type License = {
  '@id': string;
  label: string;
};

export type Contribution = {
  '@type': string;
  agent?: {
    '@id': string;
    '@type': ['Person', 'Agent'];
    affiliation?: {
      '@id': string;
      '@type': 'Organization';
    };
  };
  hadRole?: {
    '@id': string;
    '@type': 'prov:Role';
    label: string;
    prefLabel: string;
  };
};

export type Annotation = {
  '@type': string[];
  hasBody: {
    '@id': string;
    '@type': string[];
    label: string;
    prefLabel: string;
  };
  name: string;
};

export type Classification = {
  mType?: string;
  eType?: string;
};

export type ContributedBy = {
  role?: string;
  agent?: string;
};

export const MINDSMetadataComponent: React.FC<{
  loading: boolean;
  types: Resource['@type'];
  brainLocation?: BrainLocation;
  subject?: Subject;
  objectOfStudy?: ObjectOfStudy;
  license?: License;
  contribution?: ContributedBy;
  classification?: Classification;
}> = ({
  types,
  brainLocation,
  subject,
  classification,
  objectOfStudy,
  contribution,
  license,
  loading,
}) => {
  return (
    <Spin spinning={loading}>
      <Descriptions bordered>
        <Descriptions.Item label="Type">
          {!!types && Array.isArray(types) ? types.join(', ') : types}
        </Descriptions.Item>
        <Descriptions.Item label="Subject">
          {subject ? (
            subject.species.label
          ) : (
            <span className="none">No Subject</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Brain Location">
          {!!brainLocation ? (
            `${brainLocation?.brainRegion?.label} ${brainLocation?.layer
              ?.label || ''}`
          ) : (
            <span className="none">No Brain Location</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Classification">
          {classification ? (
            <Descriptions bordered>
              {!!classification.mType && (
                <Descriptions.Item label="M-Type">
                  {classification.mType}
                </Descriptions.Item>
              )}
              {!!classification.eType && (
                <Descriptions.Item label="E-Type">
                  {classification.eType}
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <span className="none">No Classification</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Object of Study">
          {!!objectOfStudy ? (
            objectOfStudy.label
          ) : (
            <span className="none">No Object of Study</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Contribution">
          {!!contribution ? (
            <span>
              {contribution.agent} {contribution.role}
            </span>
          ) : (
            <span className="none">No Contribution</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="License">
          {!!license ? (
            <a href={license['@id']} target="_blank">
              License
            </a>
          ) : (
            <span className="none">No License</span>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Spin>
  );
};

export default MINDSMetadataComponent;
