import moment from 'moment';

export const PARTITIONS = ['prod', 'prod_small', 'interactive'];
export const DEFAULT_PARTITION = PARTITIONS[0];

export const DEFAULT_CPUS = 1;

export const DEFAULT_MEM = 4;

export const DEFAULT_ALLOCATION_TIME = moment('04:00', 'HH:mm');

export const API_TOKEN_KEY = 'jupyterHubApiToken';

export const JUPYTER_HUB_BASE_URL = 'https://bbpcb103.bbp.epfl.ch';
