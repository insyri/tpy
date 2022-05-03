import fetch, { RequestInit } from 'node-fetch';
import { Deployment, Guild, User } from './endpoint';
import { numstr, PylonVerbs } from './minitypes';

export default class Tpy {
  private readonly api_url = 'https://pylon.bot/api';
  // private readonly wss_url = "wss://workbench.pylon.bot/ws/";
  private readonly token: string;

  constructor(token: string) {
    if (!token) throw new Error('Token is required');
    this.token = token;
  }

  getUser = async (stringify?: boolean): Promise<User | undefined> =>
    await this.raw<User>('/user', 'GET', stringify);

  getAvailableGuilds = async (
    stringify?: boolean
  ): Promise<Guild.Available[] | undefined> =>
    await this.raw<Guild.Available[]>(
      '/user/guilds/available',
      'GET',
      stringify
    );

  getGuildInfo = async (
    id: numstr,
    stringify?: boolean
  ): Promise<Guild.Info | undefined> =>
    await this.raw<Guild.Info>(`/guilds/${id}`, 'GET', stringify);

  getGuildStats = async (
    id: numstr,
    stringify?: boolean
  ): Promise<Guild.Stats[] | undefined> =>
    await this.raw<Guild.Stats[]>(`/guilds/${id}/stats`, 'GET', stringify);

  getEditableGuilds = async (
    stringify?: boolean
  ): Promise<Guild.Editable | undefined> =>
    await this.raw<Guild.Editable>(`/guilds`, 'GET', stringify);

  publishDeployment = async (
    id: numstr,
    body: Deployment.Post<false>,
    stringify?: boolean
  ): Promise<
    | Deployment.Get<
        typeof stringify extends undefined
          ? false
          : typeof stringify extends true
          ? true
          : false
      >
    | undefined
  > =>
    await this.raw<
      Deployment.Get<
        typeof stringify extends undefined
          ? false
          : typeof stringify extends true
          ? true
          : false
      >
    >(`/deployments/${id}`, 'POST', undefined, {
      body: JSON.stringify(body),
    });

  findGuildStatWithStuff = (
    s: Guild.Stats[]
  ): Required<Guild.Stats> | undefined => {
    let i = s.findIndex(s => s.cpuMs === undefined);
    if (i === -1) return undefined;
    return s[i] as Required<Guild.Stats>;
  };

  private headers(method: PylonVerbs, other?: RequestInit): RequestInit {
    return {
      method,
      headers: { Authorization: this.token },
      other,
    } as RequestInit;
  }

  async raw<T>(
    resource: `/${string}`,
    method: PylonVerbs,
    stringify: boolean = false,
    other?: RequestInit
  ): Promise<T | undefined> {
    let r = (await fetch(
      this.api_url + resource,
      this.headers(method, other)
    )) as Response;

    if (!r.ok) return undefined;

    let parsed = (await r.json()) as {
      config?: string;
      script?: { project: string };
    };

    if (!stringify) return parsed as unknown as T;

    if ('config' in parsed) parsed.config = JSON.stringify(parsed.config);

    if ('script' in parsed && 'project' in parsed.script!)
      parsed.script.project = JSON.stringify(parsed.script.project);

    return parsed as unknown as T;
  }
}
