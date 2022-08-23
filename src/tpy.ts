import TpyErr, {
  deploymentNotFound,
  guildNotFound,
  isMissingJsonBody,
  isNotAuthorized,
  resourceNotFound,
} from './tpy_err.ts';
import type Deployment from './types/deployment.d.ts';
import type Guild from './types/guild.d.ts';
import type User from './types/user.d.ts';
import type Pylon from './types/pylon.d.ts';
import type { SafeObject, StringifiedNumber } from './types/util.d.ts';
import TpyWs from './ws.ts';
import KVNamespace from './kv.ts';

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
    return await this.httpRaw<Deployment.GET.Deployment>(`/deployments/${id}`);
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
  readyRequest(method: Pylon.HTTPVerbs, other?: RequestInit): RequestInit {
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
   * Gets all the namespaces under the given deployment ID.
   * @param deploymentID The deployment ID to look under.
   */
  async getNamespaces(deploymentID: StringifiedNumber) {
    return await this.httpRaw<Pylon.KV.GET.Namespace>(
      `/deployments/${deploymentID}/kv/namespaces`,
    );
  }

  /**
   * Gets all the namespace items under the given deployment ID.
   * @param deploymentID The deployment ID to look under.
   * @param namespace The namespace to look under.
   */
  async getNamespaceItems<T>(
    deploymentID: StringifiedNumber,
    namespace: string,
  ): Promise<{
    key: string;
    value: T;
  }[]> {
    const response = await this.httpRaw<Pylon.KV.GET.Items<T>>(
      `/deployments/${deploymentID}/kv/namespaces/${namespace}/items`,
    );
    for (const p of response) {
      p.value = JSON.parse(p.value.string);
    }

    return response as unknown as {
      key: string;
      value: T;
    }[];
  }

  /**
   * Creates a new KVNamespace instance,
   * much like the Pylon SDK's KVNamespace class.
   * @param deploymentID The deployment ID to look under.
   * @param namespace The namespace to look under.
   */
  newKVNamespace(
    deploymentID: StringifiedNumber,
    namespace: string,
  ) {
    return new KVNamespace(this, deploymentID, namespace);
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
   * @throws {TpyErr} TpyErr
   */
  async httpRaw<T extends MaybeArr<SafeObject>>(
    resource: `/${string}`,
    method: Pylon.HTTPVerbs = 'GET',
    other: RequestInit = {},
  ): Promise<T> {
    const rawres = await fetch(
      this.api_url + resource,
      this.readyRequest(method, other),
    );

    let res: MaybeArr<SafeObject> | string = await rawres.text();
    try {
      res = JSON.parse(res) as MaybeArr<SafeObject>;
      // deno-lint-ignore no-empty
    } catch {}

    if (rawres.ok) return res as T;

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
      switch (rawres.status) {
        // OK
        case 200 || 204: {
          data = res as T;
          break;
        }

        // Happens when no authentication header is provided

        // UNAUTHORIZED

        case 401 || 403:
          throw TpyErr.UNAUTHORIZED;

        // METHOD_NOT_ALLOWED

        case 405:
          throw TpyErr.METHOD_NOT_ALLOWED;

        // BAD_REQUEST

        case 400: {
          // The following checks will rely on named based keys,
          // as arrays don't support these, we will eliminate the possiblity of res being an array.
          res = <SafeObject> res;
          if (isMissingJsonBody(res)) throw TpyErr.MISSING_JSON_BODY;
          if (isNotAuthorized(res)) throw TpyErr.UNAUTHORIZED;
          break;
        }

        // NOT_FOUND

        case 404:
          throw TpyErr.RESOURCE_NOT_FOUND;

          // INTERNAL_SERVER_ERROR

        case 500:
          throw TpyErr.UNAUTHORIZED;
      }
    }
    if (!data) throw rawres;
    return data;
  }
}
