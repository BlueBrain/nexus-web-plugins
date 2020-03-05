export interface ApiServer {
  name: string;
  last_activity: string;
  started: string;
  pending: string;
  ready: boolean;
  state: string;
  url: string;
  user_options: {
    account: string;
    partition: string;
    cpus: number;
    memory: string;
    timelimit: string;
    nprocs: number;
    runtime: string;
    options: string;
  };
  progress_url: string;
}

export interface ApiUser {
  name: string;
  admin: boolean;
  created: string;
  servers: {
    [serverName: string]: ApiServer;
  };
}
