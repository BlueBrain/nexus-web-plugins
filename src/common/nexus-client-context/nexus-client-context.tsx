
import { createContext } from 'react';
import { NexusClient } from '@bbp/nexus-sdk';

export const NexusClientContext = createContext<NexusClient>(null as any);
