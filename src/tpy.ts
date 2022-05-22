import HttpStatusCode from 'https://gist.githubusercontent.com/scokmen/f813c904ef79022e84ab2409574d1b45/raw/cd8709a2fccb005bb53e9bfb2461e07d40b4e8d8/HttpStatusCode.ts';
import { TpyErr } from './tpy_err.ts';
import type Deployment from './types/deployments.d.ts';
import type Guild from './types/guild.d.ts';
import type User from './types/user.d.ts';
import { MaybeArr, numstr, PylonVerbs, TpyTup } from './utils.ts';

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

  getUser = async (): Promise<TpyTup<User.GET.User>> =>
    await this.httpRaw<User.GET.User>('/user', 'GET');

  getAvailableGuilds = async (): Promise<
    TpyTup<User.GET.Guilds.Available>
  > =>
    await this.httpRaw<User.GET.Guilds.Available>(
      '/user/guilds/available',
      'GET',
    );

  getGuildInfo = async (id: numstr): Promise<TpyTup<Guild.GET.Guild>> =>
    await this.httpRaw<Guild.GET.Guild>(`/guilds/${id}`, 'GET');

  getGuildStats = async (id: numstr): Promise<TpyTup<Guild.GET.Stats>> =>
    await this.httpRaw<Guild.GET.Stats>(`/guilds/${id}/stats`, 'GET');

  getEditableGuilds = async (): Promise<TpyTup<User.GET.Guilds.Guilds>> =>
    await this.httpRaw<User.GET.Guilds.Guilds>(`/guilds`, 'GET');

  publishDeployment = async (
    id: numstr,
    body: Deployment.POST.Request<false>,
  ): Promise<TpyTup<Deployment.POST.Response>> => {
    return await this.httpRaw<Deployment.POST.Response>(
      `/deployments/${id}`,
      'POST',
      {
        body: JSON.stringify(body),
      },
    );
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
   */
  connectSocket(ws_ops?: ConstructorParameters<typeof WebSocket>): WebSocket {
    return new WebSocket(
      `${this.wss_url}${this.token}/${(ws_ops?.[0] || new String())}`,
      ws_ops?.[1],
    );
  }

  /**
   * Makes a request to the API with additional error handling.
   *
   * @param resource The resource to request that will be concatenated with the api url.
   * @param method HTTP method to use. Currently, the Pylon API only uses GET and POST.
   */
  httpRaw = async <T extends MaybeArr<Record<string, unknown>>>(
    resource: `/${string}`,
    method: PylonVerbs = 'GET',
    other?: RequestInit,
  ): Promise<
    [TpyErr.NO_ERR, T] | [Exclude<TpyErr, TpyErr.NO_ERR>, undefined]
  > => {
    const rawres = await fetch(
      this.api_url + resource,
      this.headers(method, other),
    );

    let res: MaybeArr<Record<string, unknown>> | string = await rawres.text();
    try {
      res = JSON.parse(res) as MaybeArr<Record<string, unknown>>;
    } catch { /* do nothing */ }

    // The only known cases where responses are not JSON are:
    // - 404 * = `⚠️ 404 — Not Found\n==================\nReq`
    // - 404 /guilds/:id = `could not find guild`
    // - 404 /deployments/:id = `could not find deployment`
    // So we assume that the response is a failed response.

    let stringresponse: TpyTup<T> | null = null;

    if (typeof res === 'string') {
      // deno-fmt-ignore
      if (res.startsWith('\u26A0\uFE0F')) return stringresponse = [TpyErr.RESOURCE_NOT_FOUND, undefined];
      // deno-fmt-ignore
      if (res === "could not find deployment") return stringresponse = [TpyErr.DEPLOYMENT_NOT_FOUND, undefined];
      // deno-fmt-ignore
      if (res === "could not find guild") return stringresponse = [TpyErr.GUILD_NOT_FOUND, undefined];
    }

    if (stringresponse != null) return stringresponse;

    let data:
      | [TpyErr.NO_ERR, T]
      | [Exclude<TpyErr, TpyErr.NO_ERR>, undefined] = [
        TpyErr.UNIDENTIFIABLE,
        undefined,
      ];

    // typeof [] === 'object' -> true
    if (typeof res === 'object') {
      switch (<HttpStatusCode> rawres.status) {
        case HttpStatusCode.OK: {
          data = [TpyErr.NO_ERR, res as T];
          break;
        }

        case HttpStatusCode.UNAUTHORIZED: {
          data = [TpyErr.UNAUTHORIZED, undefined];
          break;
        }

        case HttpStatusCode.METHOD_NOT_ALLOWED: {
          data = [TpyErr.METHOD_NOT_ALLOWED, undefined];
          break;
        }

        // deno-fmt-ignore

        case HttpStatusCode.BAD_REQUEST: {
          if ('msg' in res && res['msg'] === 'missing json body')
            data = [TpyErr.MISSING_JSON_BODY, undefined];

          if ('message' in res && res['message'] === 'not authorized')
            data = [TpyErr.UNAUTHORIZED, undefined];
          break;
        }

        case HttpStatusCode.NOT_FOUND: {
          data = [TpyErr.RESOURCE_NOT_FOUND, undefined];
          break;
        }
      }
    }
    return data;
  };
}
