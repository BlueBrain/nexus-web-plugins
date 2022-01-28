import * as React from 'react';

import { Descriptions, Spin } from 'antd';
import { Resource } from '@bbp/nexus-sdk';

import './metadata-component.css';
import { labelOf } from '../../common/nexus-tools/nexus-tools';

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
  contribution?: ContributedBy | ContributedBy[];
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
      <Descriptions
        column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        bordered
      >
        <Descriptions.Item
          label={<span className="metadata-label">Subject</span>}
        >
          {subject ? subject.species?.label : <span className="none">-</span>}
        </Descriptions.Item>
        <Descriptions.Item
          span={5}
          label={<span className="metadata-label">Type</span>}
        >
          {!!types && Array.isArray(types)
            ? types.map((type, ix) => (
                <span key={ix}>
                  {labelOf(type)}
                  <br />
                </span>
              ))
            : types}
        </Descriptions.Item>
        <Descriptions.Item
          label={<span className="metadata-label">Brain Location</span>}
        >
          {!!brainLocation ? (
            `${brainLocation.brainRegion?.label} ${brainLocation.layer?.label ||
              ''}`
          ) : (
            <span className="none">-</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item
          label={<span className="metadata-label">Object of Study</span>}
        >
          {!!objectOfStudy ? (
            objectOfStudy.label
          ) : (
            <span className="none">-</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item
          label={<span className="metadata-label">Classification</span>}
        >
          {classification ? (
            <Descriptions bordered>
              {!!classification.mType && (
                <Descriptions.Item
                  label={<span className="metadata-label">M-Type</span>}
                >
                  {classification.mType}
                </Descriptions.Item>
              )}
              {!!classification.eType && (
                <Descriptions.Item
                  label={<span className="metadata-label">E-Type</span>}
                >
                  {classification.eType}
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <span className="none">-</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item
          label={<span className="metadata-label">Contribution</span>}
        >
          {!!contribution && Array.isArray(contribution)
            ? contribution.map((contributor, index) => (
                <div key={index}>
                  <span>
                    {contributor.agent}
                    {!!contributor.role ? `: ${contributor.role}` : ''}
                  </span>
                  {index < contribution.length - 1 && <br />}
                </div>
              ))
            : !!contribution && (
                <span>
                  {contribution.agent || '-'}
                  {!!contribution.role ? `: ${contribution.role}` : ''}
                </span>
              )}
        </Descriptions.Item>
        <Descriptions.Item
          label={<span className="metadata-label">License</span>}
        >
          {!!license ? (
            <a href={license['@id']} target="_blank">
              License
            </a>
          ) : (
            <span className="none">-</span>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Spin>
  );
};

export default MINDSMetadataComponent;
