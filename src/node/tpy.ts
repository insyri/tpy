import fetch, { RequestInit } from 'node-fetch';
import { Deployment, Guild, User } from './api';
import { numstr, PylonVerbs } from './minitypes';

/**
 * Tpy class, intialized with a pylon token.
 */
export default class Tpy {
  private readonly api_url = 'https://pylon.bot/api';
  // private readonly wss_url = 'wss://workbench.pylon.bot/ws/';
  private readonly token: string;

  /**
   * @param token The token to use for the API
   */
  constructor(token: string) {
    if (!token) throw new Error('Token is required');
    this.token = token;
  }

  getUser = async (stringify: boolean = false): Promise<User | undefined> =>
    await this.httpRaw<User>('/user', 'GET', stringify);

  getAvailableGuilds = async (
    stringify: boolean = false
  ): Promise<Guild.Available[] | undefined> =>
    await this.httpRaw<Guild.Available[]>(
      '/user/guilds/available',
      'GET',
      stringify
    );

  getGuildInfo = async (
    id: numstr,
    stringify: boolean = false
  ): Promise<Guild.Info | undefined> =>
    await this.httpRaw<Guild.Info>(`/guilds/${id}`, 'GET', stringify);

  getGuildStats = async (
    id: numstr,
    stringify: boolean = false
  ): Promise<Guild.Stats[] | undefined> =>
    await this.httpRaw<Guild.Stats[]>(`/guilds/${id}/stats`, 'GET', stringify);

  getEditableGuilds = async (
    stringify: boolean = false
  ): Promise<Guild.Editable | undefined> =>
    await this.httpRaw<Guild.Editable>(`/guilds`, 'GET', stringify);

  publishDeployment = async (
    id: numstr,
    body: Deployment.Post<false>,
    stringify: boolean = false
  ): Promise<
    | Deployment.Get<
        typeof stringify extends false
          ? false
          : typeof stringify extends true
          ? true
          : false
      >
    | undefined
  > =>
    await this.httpRaw<
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

  async httpRaw<T>(
    resource: `/${string}`,
    method: PylonVerbs,
    stringify: boolean = false,
    other?: RequestInit
  ): Promise<T | undefined> {
    let r = await fetch(this.api_url + resource, this.headers(method, other));

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
