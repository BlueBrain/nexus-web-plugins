import { Resource } from '@bbp/nexus-sdk';

export interface BrainRegion {
  '@id': string;
  label: string;
}

export interface Layer {
  '@id': string;
  label: string;
}

export interface Distribution {
  '@type': string;
  contentUrl: string;
}

export interface BrainLocation {
  brainRegion: BrainRegion;
  layer: Layer[] | undefined;
}

export interface MINDSResource {
  brainLocation: BrainLocation;
  name: string;
  description: string;
  distribution: Distribution;
}

export interface ResourceLink {
  '@id': string;
  '@type': string;
  label?: string;
}

export interface DetailedCircuitResource extends Resource, MINDSResource {
  edgeCollection: ResourceLink;
  nodeCollection: ResourceLink;
  species: ResourceLink;
  target: ResourceLink;
  wasAttributedTo: ResourceLink;
  circuitBase: {
    url: string;
  };
  circuitType?: string;
  speciesLabel?: string;
  speciesId?: string;
}
