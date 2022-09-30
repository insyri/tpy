import TpyError, {
  parametersPrompt,
  responseBody,
  responseHTTP,
} from './error.ts';
import type Deployment from './types/deployment.d.ts';
import type Guild from './types/guild.d.ts';
import type User from './types/user.d.ts';
import type Pylon from './types/pylon.d.ts';
import type { StringifiedNumber } from './types/util.d.ts';
import TpyWs from './ws.ts';
import KVNamespace from './kv.ts';

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
  /**
   * The specified deployment ID used for deployment ID entries as a default.
   */
  readonly deploymentID?: StringifiedNumber;
  private readonly token: string;

  /**
   * @param token The token to use for the API
   * @param deploymentID A default deployment ID.
   * @returns A new Tpy instance.
   */
  constructor(token: string, deploymentID?: StringifiedNumber) {
    if (!token) {
      throw new TpyError(
        'Missing or Unexpected Value in Response',
        parametersPrompt('missing', 'token'),
        token,
      );
    }
    this.token = token;
    if (deploymentID) this.deploymentID = deploymentID;
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
  async getNamespaces(deploymentID?: StringifiedNumber) {
    if (!(deploymentID || this.deploymentID)) {
      throw new TpyError(
        'Missing or Invalid Required Parameter',
        parametersPrompt('missing', ['deploymentID', 'this.deploymentID']),
        deploymentID || this.deploymentID,
      );
    }
    return await this.httpRaw<Pylon.KV.GET.Namespace>(
      `/deployments/${deploymentID || this.deploymentID}/kv/namespaces`,
    );
  }

  /**
   * Gets all the namespace items under the given deployment ID.
   * @param deploymentID The deployment ID to look under.
   * @param namespace The namespace to look under.
   */
  async getNamespaceItems<T>(
    namespace: string,
    deploymentID?: StringifiedNumber,
  ): Promise<Pylon.KV.GET.ItemsFlattened> {
    if (!(deploymentID || this.deploymentID)) {
      throw new TpyError(
        'Missing or Invalid Required Parameter',
        parametersPrompt('missing', ['deploymentID', 'this.deploymentID']),
        deploymentID || this.deploymentID,
      );
    }
    const response = await this.httpRaw<Pylon.KV.GET.Items<T>>(
      `/deployments/${
        deploymentID || this.deploymentID
      }/kv/namespaces/${namespace}/items`,
    );
    const a: Pylon.KV.GET.ItemsFlattened = [];
    for (let i = 0; i < response.length; i++) {
      const p = response[i];
      if (!p.value.string) {
        throw new TpyError(
          'Missing or Unexpected Value in Response',
          `response[${i}\].value.string`,
          response,
        );
      }
      a[i].key = p.key;
      a[i].value = JSON.parse(p.value.string);
    }

    return response;
  }

  /**
   * Creates a new KVNamespace instance,
   * much like the Pylon SDK's KVNamespace class.
   * @param deploymentID The deployment ID to look under.
   * @param namespace The namespace to look under.
   */
  newKVNamespace(
    namespace: string,
    deploymentID?: StringifiedNumber,
  ) {
    if (!(deploymentID || this.deploymentID)) {
      throw new TpyError(
        'Missing or Invalid Required Parameter',
        parametersPrompt('missing', ['deploymentID', 'this.deploymentID']),
        deploymentID || this.deploymentID,
      );
    }

    return new KVNamespace(
      this,
      (deploymentID || this.deploymentID)!,
      namespace,
    );
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
   * @throws {TpyError<Response>}
   */
  async httpRaw<T>(
    resource: `/${string}`,
    method: Pylon.HTTPVerbs = 'GET',
    other: RequestInit = {},
  ): Promise<T> {
    const rawres = await fetch(
      this.api_url + resource,
      this.readyRequest(method, other),
    );

    if (rawres.ok) return await rawres.json() as T;

    switch (rawres.status) {
      case 404: {
        const r = await rawres.text();
        if (r.startsWith('\u26A0\uFE0F')) {
          throw new TpyError<Response>(
            'URL Resource Not Found',
            responseBody(r),
            rawres,
          );
        }

        if (r === 'could not find deployment') {
          throw new TpyError<Response>(
            'Deployment Could Not be Found',
            responseBody(r),
            rawres,
          );
        }

        if (r === 'could not find guild') {
          throw new TpyError<Response>(
            'Guild Could Not be Found',
            responseBody(r),
            rawres,
          );
        }
        break;
      }

      case 401:
        throw new TpyError<Response>(
          'Unauthorized',
          responseHTTP(rawres.statusText),
          rawres,
        );

      case 403:
        throw new TpyError<Response>(
          'Forbidden',
          responseHTTP(rawres.statusText),
          rawres,
        );

      case 405:
        throw new TpyError<Response>(
          'HTTP Method Not Allowed',
          responseHTTP(rawres.statusText),
          rawres,
        );

      case 400: {
        const res = await rawres.json();
        if ('msg' in res && res['msg'] === 'missing json body') {
          throw new TpyError<Response>(
            'Missing or Invalid JSON in Request Body',
            responseHTTP(rawres.statusText),
            rawres,
          );
        }
        break;
      }

      case 500:
        throw new TpyError<Response>(
          'Internal Server Error',
          responseHTTP(rawres.statusText),
          rawres,
        );
    }

    throw new TpyError<Response>(
      'Unidentifiable Error',
      `Response is ok: ${rawres.ok}`,
      rawres,
    );
  }
}
