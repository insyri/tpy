import HttpStatusCode from 'https://gist.githubusercontent.com/scokmen/f813c904ef79022e84ab2409574d1b45/raw/cd8709a2fccb005bb53e9bfb2461e07d40b4e8d8/HttpStatusCode.ts';
import { TpyErr } from './tpy_err.ts';
import type Deployment from './types/deployments.d.ts';
import type Guild from './types/guild.d.ts';
import type User from './types/user.d.ts';
import { MaybeArr, numstr, PylonVerbs, TpyTup } from './utils.ts';
import TpyWs from './ws.ts';

/**
 * Tpy class, intialized with a pylon token.
 */
export default class Tpy {
  /**
   * The Pylon API base URL.
   */
  readonly api_url = 'https://pylon.bot/api';
  /**
   * The Pylon workbench websocket URL.
   */
  readonly wss_url = 'wss://workbench.pylon.bot/ws';
  private readonly token: string;

  /**
   * @param token The token to use for the API
   *
   * @returns A new Tpy instance.
   */
  constructor(token: string) {
    if (!token) throw new Error('Token is required');
    this.token = token;
  }

  /**
   * @returns The current logged in user.
   */
  getUser = async (): Promise<TpyTup<User.GET.User>> =>
    await this.httpRaw<User.GET.User>('/user');

  /**
   * Response can be slow since this endpoint makes a Discord API call.
   *
   * @returns All guilds a user is in.
   */
  getAvailableGuilds = async (): Promise<
    TpyTup<User.GET.Guilds.Available>
  > =>
    await this.httpRaw<User.GET.Guilds.Available>(
      '/user/guilds/available',
      'GET',
    );

  /**
   * @param id The ID of the guild to get.
   *
   * @returns Raw Discord guild information with deployment information.
   */
  getGuildInfo = async (id: numstr): Promise<TpyTup<Guild.GET.Guild>> =>
    await this.httpRaw<Guild.GET.Guild>(`/guilds/${id}`);

  /**
   * @param id The ID of the guild to get.
   *
   * @returns Guild computational statistics.
   */
  getGuildStats = async (id: numstr): Promise<TpyTup<Guild.GET.Stats>> =>
    await this.httpRaw<Guild.GET.Stats>(`/guilds/${id}/stats`);

  /**
   * @returns All guilds a user can edit with Pylon. More specifically, all guilds which the user has `manage server` or `administrator` permissions in.
   */
  getEditableGuilds = async (): Promise<TpyTup<User.GET.Guilds.Guilds>> =>
    await this.httpRaw<User.GET.Guilds.Guilds>(`/guilds`);

  /**
   * @param id The ID of the deployment to get.
   *
   * @returns Deployment information.
   */
  getDeployment = async (
    id: numstr,
  ): Promise<TpyTup<Deployment.GET.Deployments>> =>
    await this.httpRaw<Deployment.GET.Deployments>(`/deployments/${id}`);

  /**
   * Publishes a deployment
   */
  publishDeployment = {
    /**
     * Makes a POST request to publish a deployment.
     *
     * @param id The script/deployment ID to publish to.
     *
     * @param body Project specifications.
     *
     * @returns Information of the deployment.
     */
    fromDeploymentID: async (
      id: numstr,
      body: Deployment.POST.Request<false>,
    ): Promise<TpyTup<Deployment.POST.Response<false>>> => {
      const [err, d] = await this.httpRaw<Deployment.POST.Response>(
        `/deployments/${id}`,
        'POST',
        {
          body: JSON.stringify(body),
        },
      );

      if (err) return [err, d as unknown];

      return [
        TpyErr.NO_ERR,
        d as unknown as Deployment.POST.Response<false>,
      ];
    },

    fromGuildID: async (
      id: numstr,
      body: Deployment.POST.Request<false>,
    ): Promise<TpyTup<Deployment.POST.Response<false>>> => {
      const [err, g] = await this.getGuildInfo(id);
      if (err) return [err, g as unknown];
      return await this.publishDeployment.fromDeploymentID(
        g.deployments[0].id,
        body,
      );
    },
  };

  /**
   * A factory function for organizing HTTP request objects, preset for authorization.
   *
   * @param method HTTP Method.
   *
   * @param other Other fetch parameters.
   *
   * @returns Headers with specifics.
   */
  readyRequest(method: PylonVerbs, other?: RequestInit): RequestInit {
    return {
      method,
      headers: {
        Authorization: this.token,
        'Content-Type': 'application/json',
      },
      ...other,
    } as RequestInit;
  }

  /**
   * Connects to the Pylon workbench WebSocket.
   */
  connectSocket = {
    /**
     * @param id Guild ID.
     *
     * @returns {TpyWs}
     */
    fromGuildID: async (
      id: numstr,
    ): Promise<
      TpyTup<TpyWs>
    > => {
      const [g_err, g] = await this.getGuildInfo(id);
      if (g_err) return [g_err, g as unknown];

      return [
        TpyErr.NO_ERR,
        new TpyWs(new Tpy(this.token), g.deployments[0].id),
      ];
    },

    /**
     * @param id Deployment ID.
     *
     * @returns {TpyWs}
     */
    fromDeploymentID: (
      id: numstr,
    ): TpyWs => new TpyWs(new Tpy(this.token), id),
  };

  /**
   * Makes a request to the API.
   *
   * @param resource The resource to request that will be concatenated with the api url.
   *
   * @param method HTTP method to use. Currently, the Pylon API only uses GET and POST.
   *
   * @param other Other fetch parameters.
   *
   * @returns {TpyErr} TpyErr
   */
  httpRaw = async <T extends MaybeArr<Record<string, unknown>>>(
    resource: `/${string}`,
    method: PylonVerbs = 'GET',
    other: RequestInit = {},
  ): Promise<
    TpyTup<T>
  > => {
    const rawres = await fetch(
      this.api_url + resource,
      this.readyRequest(method, other),
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
      if (res.startsWith('\u26A0\uFE0F')) return stringresponse = [TpyErr.RESOURCE_NOT_FOUND, res];
      // deno-fmt-ignore
      if (res === "could not find deployment") return stringresponse = [TpyErr.DEPLOYMENT_NOT_FOUND, res];
      // deno-fmt-ignore
      if (res === "could not find guild") return stringresponse = [TpyErr.GUILD_NOT_FOUND, res];
    }

    if (stringresponse != null) return stringresponse;

    let data: TpyTup<T> = [TpyErr.UNIDENTIFIABLE, res];

    // typeof [] === 'object' -> true
    if (typeof res === 'object') {
      switch (<HttpStatusCode> rawres.status) {
        case HttpStatusCode.OK: {
          data = [TpyErr.NO_ERR, res as T];
          break;
        }

        // Happens when no authentication header is provided

        case HttpStatusCode.UNAUTHORIZED: {
          data = [TpyErr.UNAUTHORIZED, res as unknown];
          break;
        }

        case HttpStatusCode.METHOD_NOT_ALLOWED: {
          data = [TpyErr.METHOD_NOT_ALLOWED, res as unknown];
          break;
        }

        // deno-fmt-ignore

        case HttpStatusCode.BAD_REQUEST: {
          if ('msg' in res && res['msg'] === 'missing json body')
            data = [TpyErr.MISSING_JSON_BODY, res as unknown];

          if ('message' in res && res['message'] === 'not authorized')
            data = [TpyErr.UNAUTHORIZED, res as unknown];
          break;
        }

        case HttpStatusCode.NOT_FOUND: {
          data = [TpyErr.RESOURCE_NOT_FOUND, res as unknown];
          break;
        }

        case HttpStatusCode.INTERNAL_SERVER_ERROR: {
          data = [TpyErr.UNAUTHORIZED, res as unknown];
          break;
        }
      }
    }
    return data;
  };
}
