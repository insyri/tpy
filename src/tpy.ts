import HttpStatusCode from 'https://gist.githubusercontent.com/scokmen/f813c904ef79022e84ab2409574d1b45/raw/cd8709a2fccb005bb53e9bfb2461e07d40b4e8d8/HttpStatusCode.ts';
import TpyErr from './tpy_err.d.ts';
import Deployment from './types/deployments.d.ts';
import Guild from './types/guild.d.ts';
import User from './types/user.d.ts';
import { numstr, PylonVerbs, TpyExpectType } from './utils.ts';

type HttpRawType<T> = [TpyErr, T?];

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

  getUser = async (): Promise<TpyExpectType<User.GET.User>> =>
    await this.httpRaw<User.GET.User>('/user', 'GET');

  // getAvailableGuilds = async (): Promise<
  // TpyExpectType<User.GET.Guilds.Available>
  // > =>
  //   await this.httpRaw<User.GET.Guilds.Available>(
  //     '/user/guilds/available',
  //     'GET',
  //   );

  // getGuildInfo = async (id: numstr): Promise<TpyExpectType<Guild.GET.Guild>> =>
  //   await this.httpRaw<Guild.GET.Guild>(`/guilds/${id}`, 'GET');

  // getGuildStats = async (id: numstr): Promise<TpyExpectType<Guild.GET.Stats>> =>
  //   await this.httpRaw<Guild.GET.Stats>(`/guilds/${id}/stats`, 'GET');

  // getEditableGuilds = async (): Promise<TpyExpectType<User.GET.Guilds.Guilds>> =>
  //   await this.httpRaw<User.GET.Guilds.Guilds>(`/guilds`, 'GET');

  publishDeployment = async (
    id: numstr,
    body: Deployment.POST.Request<false>,
  ): Promise<TpyExpectType<Deployment.POST.Response>> => {
    return await this.httpRaw<Deployment.POST.Response>(
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
   * @returns {HttpRawType}
   */
  httpRaw = async <T>(
    resource: `/${string}`,
    method: PylonVerbs,
    // handle_unauth: boolean,
    other?: RequestInit,
  ): Promise<HttpRawType<T>> => {
    const res = await fetch(
      this.api_url + resource,
      this.headers(method, other),
    );
    
    const parsed: [Record<string, unknown>, string] = [{}, ''];

    try {
      // failable
      parsed[0] = await res.json() as Record<string, unknown>;
    } catch {
      // non-failable
      parsed[1] = await res.text();
    }

    let data: HttpRawType<T> = [TpyErr.NOT_SET, undefined];

    switch (<HttpStatusCode> res.status) {

      case HttpStatusCode.OK: {
        data = [await res.json() as T, TpyErr.NO_ERR];
        break;
      }

      case HttpStatusCode.UNAUTHORIZED: {
        data = [res, TpyErr.UNAUTHORIZED];
        break;
      }

      case HttpStatusCode.METHOD_NOT_ALLOWED: {
        data = [res, TpyErr.METHOD_NOT_ALLOWED];
        break;
      }

      case HttpStatusCode.BAD_REQUEST: {
        const pres = await res.json();
        if ('msg' in pres && pres['msg'] === 'missing json body')
          data = [res, TpyErr.MISSING_JSON_BODY];

        if ('message' in pres && pres['message'] === 'not authorized')
          data = [res, TpyErr.UNAUTHORIZED];
        
        break;
        
      }

      case HttpStatusCode.NOT_FOUND: {
        const tes = await res.text();
        const pres = await res.json();

        // ⚠️
        if (tes[0] === "\u26A0\uFE0F")
          data = [res, TpyErr.NOT_FOUND];

        switch (tes) {
          case 'could not find guild':
            data = [res, TpyErr.GUILD_NOT_FOUND];
            break;

          case 'could not find deployment':
            data = [res, TpyErr.DEPLOYMENT_NOT_FOUND];
            break;
        
          default:
            break;
        }

        // data = [res, TpyErr.NOT_FOUND];
        break;
      }

    }
    return data;
  };
}
