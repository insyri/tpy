import HttpStatusCode from 'https://gist.githubusercontent.com/scokmen/f813c904ef79022e84ab2409574d1b45/raw/cd8709a2fccb005bb53e9bfb2461e07d40b4e8d8/HttpStatusCode.ts';
import TpyErr, {
  deploymentNotFound,
  guildNotFound,
  isMissingJsonBody,
  isNotAuthorized,
  resourceNotFound,
} from './tpy_err.ts';
import type Deployment from './types/deployments.d.ts';
import type Guild from './types/guild.d.ts';
import type User from './types/user.d.ts';
import type Pylon from './types/pylon.d.ts';
import type { SafeObject, StringifiedNumber } from './types/util.d.ts';
import TpyWs from './ws.ts';

type MaybeArr<T> = T | T[];

/**
 * A Tpy class, intialized with a pylon token.
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
  async getUser() {
    return await this.httpRaw<User.GET.User>('/user');
  }

  /**
   * Response can be slow since this endpoint makes a Discord API call.
   *
   * @returns All guilds a user is in.
   */
  async getAvailableGuilds() {
    return await this.httpRaw<User.GET.Guilds.Available>(
      '/user/guilds/available',
      'GET',
    );
  }

  /**
   * @param id The ID of the guild to get.
   *
   * @returns Raw Discord guild information with deployment information.
   */
  async getGuildInfo(id: StringifiedNumber) {
    return await this.httpRaw<Guild.GET.Guild>(`/guilds/${id}`);
  }

  /**
   * @param id The ID of the guild to get.
   *
   * @returns Guild computational statistics.
   */
  async getGuildStats(id: StringifiedNumber) {
    return await this.httpRaw<Guild.GET.Stats>(`/guilds/${id}/stats`);
  }

  /**
   * @returns All guilds a user can edit with Pylon. More specifically, all guilds which the user has `manage server` or `administrator` permissions in.
   */
  async getEditableGuilds() {
    return await this.httpRaw<User.GET.Guilds.Guilds>(`/user/guilds`);
  }
  /**
   * @param id The ID of the deployment to get.
   *
   * @returns Deployment information.
   */
  async getDeployment(id: StringifiedNumber) {
    return await this.httpRaw<Deployment.GET.Deployments>(`/deployments/${id}`);
  }

  /**
   * Makes a POST request to publish a deployment.
   *
   * @param id The script/deployment ID to publish to.
   *
   * @param body Project specifications.
   *
   * @returns Information of the deployment.
   */
  async publishDeployment(
    id: StringifiedNumber,
    body: Deployment.POST.Request<false>,
  ) {
    return await this.httpRaw<Deployment.POST.Response>(
      `/deployments/${id}`,
      'POST',
      {
        body: JSON.stringify(body),
      },
    ) as unknown as Deployment.POST.Response<false>;
  }

  /**
   * A factory function for organizing HTTP request objects, preset for authorization.
   *
   * @param method HTTP Method.
   * @param other Other fetch parameters.
   * @returns Headers with specifics.
   */
  readyRequest(method: Pylon.Verbs, other?: RequestInit): RequestInit {
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
   *
   * @param id The deployment ID to follow the WebSocket when it disconnects.
   */
  connectSocket(id: StringifiedNumber) {
    return new TpyWs(new Tpy(this.token), id);
  }

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
  async httpRaw<T extends MaybeArr<SafeObject>>(
    resource: `/${string}`,
    method: Pylon.Verbs = 'GET',
    other: RequestInit = {},
  ): Promise<
    T
  > {
    const rawres = await fetch(
      this.api_url + resource,
      this.readyRequest(method, other),
    );

    let res: MaybeArr<SafeObject> | string = await rawres.text();
    try {
      res = JSON.parse(res) as MaybeArr<SafeObject>;
      // deno-lint-ignore no-empty
    } catch {}

    // The only known cases where responses are not JSON are:
    // - 404 * = `⚠️ 404 — Not Found\n==================\nReq`
    // - 404 /guilds/:id = `could not find guild`
    // - 404 /deployments/:id = `could not find deployment`
    // So we assume that the response is a failed response.

    if (typeof res === 'string') {
      if (resourceNotFound(res)) throw TpyErr.RESOURCE_NOT_FOUND;
      if (deploymentNotFound(res)) throw TpyErr.DEPLOYMENT_NOT_FOUND;
      if (guildNotFound(res)) throw TpyErr.GUILD_NOT_FOUND;
    }

    let data: T | null = null;

    // typeof [] === 'object' -> true
    if (typeof res === 'object') {
      switch (<HttpStatusCode> rawres.status) {
        case HttpStatusCode.OK: {
          data = res as T;
          break;
        }

        // Happens when no authentication header is provided

        case HttpStatusCode.UNAUTHORIZED:
          throw TpyErr.UNAUTHORIZED;

        case HttpStatusCode.METHOD_NOT_ALLOWED:
          throw TpyErr.METHOD_NOT_ALLOWED;

        case HttpStatusCode.BAD_REQUEST: {
          // The following checks will rely on named based keys,
          // as arrays don't support these, we will eliminate the possiblity of res being an array.
          res = <SafeObject> res;
          if (isMissingJsonBody(res)) throw TpyErr.MISSING_JSON_BODY;
          if (isNotAuthorized(res)) throw TpyErr.UNAUTHORIZED;
          break;
        }

        case HttpStatusCode.NOT_FOUND:
          throw TpyErr.RESOURCE_NOT_FOUND;

        case HttpStatusCode.INTERNAL_SERVER_ERROR:
          throw TpyErr.UNAUTHORIZED;
      }
    }
    if (!data) throw TpyErr.UNIDENTIFIABLE;
    return data;
  }
}
