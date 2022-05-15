import { Deployment, Guild, User } from './old.api.d.ts';
import { numstr, PylonVerbs } from './minitypes.d.ts';

/**
 * Tpy class, intialized with a pylon token.
 */
export default class Tpy {
  private readonly api_url = 'https://pylon.bot/api';
  private readonly wss_url = 'wss://workbench.pylon.bot/ws/';
  private readonly token: string;

  /**
   * @param token The token to use for the API
   */
  constructor(token: string) {
    if (!token) throw new Error('Token is required');
    this.token = token;
  }

  getUser = async (): Promise<User | undefined> =>
    await this.httpRaw<User>('/user', 'GET');

  getAvailableGuilds = async (): Promise<Guild.Available[] | undefined> =>
    await this.httpRaw<Guild.Available[]>('/user/guilds/available', 'GET');

  getGuildInfo = async (id: numstr): Promise<Guild.Info | undefined> =>
    await this.httpRaw<Guild.Info>(`/guilds/${id}`, 'GET');

  getGuildStats = async (id: numstr): Promise<Guild.Stats[] | undefined> =>
    await this.httpRaw<Guild.Stats[]>(`/guilds/${id}/stats`, 'GET');

  getEditableGuilds = async (): Promise<Guild.Editable | undefined> =>
    await this.httpRaw<Guild.Editable>(`/guilds`, 'GET');

  publishDeployment = async (
    id: numstr,
    body: Deployment.Post<false>,
  ): Promise<Deployment.Post<true>> => {
    return await this.httpRaw<Deployment.Post<true>>(
      `/deployments/${id}`,
      'POST',
      {
        body: JSON.stringify(body),
      },
    );
  };

  // publishDeployment = async (
  //   id: numstr,
  //   body: Deployment.Post<false>
  // ): Promise<
  //   | Deployment.Get<
  //       typeof stringify extends false
  //         ? false
  //         : typeof stringify extends true
  //         ? true
  //         : false
  //     >
  //   | undefined
  // > =>
  //   await this.httpRaw<
  //     Deployment.Get<
  //       typeof stringify extends undefined
  //         ? false
  //         : typeof stringify extends true
  //         ? true
  //         : false
  //     >
  //   >(`/deployments/${id}`, "POST");

  findGuildStatWithStuff = (
    s: Guild.Stats[],
  ): Required<Guild.Stats> | undefined => {
    const i = s.findIndex((s) => s.cpuMs === undefined);
    if (i === -1) return undefined;
    return s[i] as Required<Guild.Stats>;
  };

  headers(method: PylonVerbs, other?: RequestInit): RequestInit {
    return {
      method,
      headers: { Authorization: this.token },
      other,
    } as RequestInit;
  }

  /**
   * Connects to the websocket with an optional resource.
   * @returns WebSocket
   */
  connectSocket(ws_ops?: ConstructorParameters<typeof WebSocket>): WebSocket {
    return new WebSocket(
      this.wss_url + (ws_ops?.[0] || new String()),
      ws_ops?.[1],
    );
  }

  /**
   * Some parts of the Pylon API return a stringified object.
   *
   * @param resource The resource to request that will be concatenated with the api url.
   * @param method HTTP method to use. Currently, the Pylon API only uses GET and POST.
   * @returns {T}
   */
  async httpRaw<T>(
    resource: `/${string}`,
    method: PylonVerbs,
    // handle_unauth: boolean,
    other?: RequestInit,
  ): Promise<T> {
    return (await (
      await fetch(this.api_url + resource, this.headers(method, other))
    ).json()) as T;
    // as Partial<Unauthorized>;
    // if (!handle_unauth) return m as T;
    // return m.message && m.message === "not authorized" ? undefined : m as T;
  }
}
