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
import TpyKV from './kv.ts';
import Context from './context.ts';

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
   */
  constructor(token: string, deploymentID?: StringifiedNumber) {
    if (!token) {
      throw new TpyError(
        'Missing or Unexpected Value in Response',
        parametersPrompt('missing', 'token'),
        'token',
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
    return await this.httpRaw<User.GET.User>(new Context({}), '/user');
  }

  /**
   * Response can be slow since this endpoint makes a Discord API call.
   *
   * @returns All guilds a user is in.
   */
  async getAvailableGuilds() {
    return await this.httpRaw<User.GET.Guilds.Available>(
      new Context({}),
      '/user/guilds/available',
    );
  }

  /**
   * @param guildID The ID of the guild to get.
   *
   * @returns Raw Discord guild information with deployment information.
   */
  async getGuildInfo(guildID: StringifiedNumber) {
    return await this.httpRaw<Guild.GET.Guild>(
      new Context({ guildID }),
      `/guilds/${guildID}`,
    );
  }

  /**
   * @param guildID The ID of the guild to get.
   *
   * @returns Guild computational statistics.
   */
  async getGuildStats(guildID: StringifiedNumber) {
    return await this.httpRaw<Guild.GET.Stats>(
      new Context({ guildID }),
      `/guilds/${guildID}/stats`,
    );
  }

  /**
   * @returns All guilds a user can edit with Pylon. More specifically, all guilds which the user has `manage server` or `administrator` permissions in.
   */
  async getEditableGuilds() {
    return await this.httpRaw<User.GET.Guilds.Allowed>(
      new Context({}),
      `/user/guilds`,
    );
  }

  /**
   * @param deploymentID The ID of the deployment to get. If empty, the function will use the set deploymentID in the class. (`this.deploymentID`)
   *
   * @returns Deployment information.
   */
  async getDeployment(deploymentID?: StringifiedNumber) {
    const dID = deploymentID || this.deploymentID;
    if (!(dID)) {
      throw new TpyError(
        'Missing or Invalid Required Parameter',
        parametersPrompt('missing', ['deploymentID', 'this.deploymentID']),
        ['deploymentID', 'this.deploymentID'].join(', '),
        dID,
      );
    }
    return await this.httpRaw<Deployment.GET.Deployment>(
      new Context({ deploymentID: dID }),
      `/deployments/${dID}`,
    );
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
      new Context({ deploymentID: id }),
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
    return new TpyWs(this, id);
  }

  /**
   * Gets all the namespaces under the given deployment ID.
   * @param deploymentID The deployment ID to look under.
   */
  async getNamespaces(deploymentID?: StringifiedNumber) {
    const dID = deploymentID || this.deploymentID;
    if (!dID) {
      throw new TpyError(
        'Missing or Invalid Required Parameter',
        parametersPrompt('missing', ['deploymentID', 'this.deploymentID']),
        ['deploymentID', 'this.deploymentID'].join(', '),
        dID,
      );
    }
    return await this.httpRaw<Pylon.KV.GET.Namespace>(
      new Context({ deploymentID: dID }),
      `/deployments/${dID}/kv/namespaces`,
    );
  }

  /**
   * Gets all the namespace items under the given deployment ID.
   * @param deploymentID The deployment ID to look under.
   * @param namespace The namespace to look under.
   *
   * @template T The type of the `value` object inside {@linkcode Pylon.KV.GET.ItemsFlattened}.
   */
  async getNamespaceItems<T>(
    namespace: string,
    deploymentID?: StringifiedNumber,
  ): Promise<Pylon.KV.GET.ItemsFlattened<T> | undefined> {
    const dID = deploymentID || this.deploymentID;
    if (!dID) {
      throw new TpyError(
        'Missing or Invalid Required Parameter',
        parametersPrompt('missing', ['deploymentID', 'this.deploymentID']),
        ['deploymentID', 'this.deploymentID'].join(', '),
        dID,
      );
    }
    const response = await this.httpRaw<Pylon.KV.GET.Items>(
      new Context({ deploymentID: dID }),
      `/deployments/${dID}/kv/namespaces/${namespace}/items`,
    );

    const a: Pylon.KV.GET.ItemsFlattened<T> = new Array(response.length);
    for (let i = 0; i < response.length; i++) {
      const p = response[i];
      if (!p.value.string) {
        throw new TpyError(
          'Missing or Unexpected Value in Response',
          `response[${i}\].value.string is undefined`,
          `response[${i}\].value.string`,
          response,
        );
      }
      a[i] = {
        key: p.key,
        value: JSON.parse(p.value.string),
      };
    }

    return a;
  }

  /**
   * Creates a new {@link TpyKV} instantiation, much like the Pylon SDK's KVNamespace class.
   * @param deploymentID The deployment ID to look under.
   * @param namespace The namespace to look under.
   */
  KV(
    namespace: string,
    deploymentID?: StringifiedNumber,
  ) {
    const dID = deploymentID || this.deploymentID;
    if (!dID) {
      throw new TpyError(
        'Missing or Invalid Required Parameter',
        parametersPrompt('missing', ['deploymentID', 'this.deploymentID']),
        ['deploymentID', 'this.deploymentID'].join(', '),
        dID,
      );
    }

    return new TpyKV(this, dID, namespace);
  }

  /**
   * Makes a request to the API.
   *
   * @param resource The resource to request that will be concatenated with the API URL.
   *
   * @param method HTTP method to use. Currently, the Pylon API only uses GET and POST.
   *
   * @param other Other fetch parameters.
   *
   * @throws {TpyError<Response>}
   */
  async httpRaw<T>(
    context: Context,
    resource: `/${string}`,
    method: Pylon.HTTPVerbs = 'GET',
    other: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(
      this.api_url + resource,
      this.readyRequest(method, other),
    );

    if (response.ok) return await response.json() as T;

    switch (response.status) {
      case 404: {
        const r = await response.text();
        if (r.startsWith('\u26A0\uFE0F')) {
          throw new TpyError<Response>(
            'URL Resource Not Found',
            responseBody(r),
            response.statusText,
            response,
          );
        }

        if (r === 'could not find deployment') {
          throw new TpyError<Response>(
            'Deployment Not Found',
            responseBody(r),
            context.deploymentID,
            response,
          );
        }

        if (r === 'could not find guild') {
          throw new TpyError<Response>(
            'Guild Not Found',
            responseBody(r),
            context.guildID,
            response,
          );
        }
        break;
      }

      case 401:
        throw new TpyError<Response>(
          'Unauthorized',
          responseHTTP(response.statusText),
          response.statusText,
          response,
        );

      case 403:
        throw new TpyError<Response>(
          'Forbidden',
          responseHTTP(response.statusText),
          response.statusText,
          response,
        );

      case 405:
        throw new TpyError<Response>(
          'HTTP Method Not Allowed',
          responseHTTP(response.statusText),
          response.statusText,
          response,
        );

      case 400: {
        const res = await response.json();
        if ('msg' in res && res['msg'] === 'missing json body') {
          throw new TpyError<Response>(
            'Missing or Invalid JSON in Request Body',
            responseHTTP(response.statusText),
            JSON.stringify(res['msg']),
            response,
          );
        }
        break;
      }

      case 500:
        throw new TpyError<Response>(
          'Internal Server Error',
          responseHTTP(response.statusText),
          response.statusText,
          response,
        );
    }

    throw new TpyError<Response>(
      'Unidentifiable Error',
      `Response is ok: ${response.ok}`,
      JSON.stringify({
        'response.ok': response.ok,
      }),
      response,
    );
  }
}
