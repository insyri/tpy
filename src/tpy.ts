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
 * The central entity for interacting with the Pylon API; the entrypoint.
 */
export default class Tpy {
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
   * Gets the user's account details associated with the included credentials.
   */
  async getUser() {
    return await this.httpRaw<User.GET.User>(new Context({}), '/user');
  }

  /**
   * Gets all the guilds the user is in.
   */
  async getAvailableGuilds() {
    return await this.httpRaw<User.GET.Guilds.Available>(
      new Context({}),
      '/user/guilds/available',
    );
  }

  /**
   * Gets the raw Discord guild information with deployment information.
   * @param guildID The ID of the guild to get.
   */
  async getGuildInfo(guildID: StringifiedNumber) {
    const g = (await this.httpRaw<Guild.GET.Guild>(
      new Context({ guildID }),
      `/guilds/${guildID}`,
    ));
    g.deployments.forEach((v) => v.config = JSON.parse(v.config));
    return g as unknown as Guild.GET.Guild<false>;
  }

  /**
   * Gets the guild computational statistics.
   * @param guildID The ID of the guild to get.
   */
  async getGuildStats(guildID: StringifiedNumber) {
    return await this.httpRaw<Guild.GET.Stats>(
      new Context({ guildID }),
      `/guilds/${guildID}/stats`,
    );
  }

  /**
   * Gets all guilds a user can edit with Pylon. More specifically, all guilds
   * which the user has `manage server` or `administrator` permissions in.
   */
  async getEditableGuilds() {
    return await this.httpRaw<User.GET.Guilds.Allowed>(
      new Context({}),
      `/user/guilds`,
    );
  }

  /**
   * Gets the deployment information.
   *
   * @param deploymentID The ID of the deployment to get. If empty, the function
   * will use the set deploymentID in the class. (`this.deploymentID`)
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
    const d = await this.httpRaw<Deployment.GET.Deployment>(
      new Context({ deploymentID: dID }),
      `/deployments/${dID}`,
    );
    d.script.project = JSON.parse(d.script.project);
    d.config = JSON.parse(d.config);
    return d as unknown as Deployment.GET.Deployment<false>;
  }

  /**
   * Makes a POST request to publish a deployment; returns details
   * of the new deployment.
   *
   * @param id The script/deployment ID to publish to.
   * @param body Project specifications.
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
   * Gets the most recent deployment ID from a guildID.
   * @param guildID The guild to fetch the deployment from.
   */
  async getDeploymentfromGuild(guildID: StringifiedNumber) {
    return (await this.getGuildInfo(guildID)).deployments[0];
  }

  /**
   * A factory function with default headers, allowing optional specificity.
   *
   * @param method HTTP Method.
   * @param other Other fetch parameters.
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
   * Makes a request to the API and creates possible errors according to the response.
   *
   * @param resource The resource to request that will be concatenated with the API URL.
   * @param method HTTP method to use. Currently, the Pylon API only uses GET and POST.
   * @param requestInit Other fetch parameters.
   * @param parse Whether to parse out the body or not, default is true.
   *
   * @template T The return type of the response body.
   * @template Parse Follows the {@linkcode parse} parameter and should match values. Determines whether T is returned or not.
   *
   * @throws {TpyError<Response | Context>}
   */
  async httpRaw<T, Parse extends boolean = true>(
    ctx: Context,
    resource: `/${string}`,
    method: Pylon.HTTPVerbs = 'GET',
    requestInit: RequestInit = {},
    parse: Parse = (true as Parse),
  ): Promise<Parse extends true ? T : void> {
    const response = await fetch(
      'https://pylon.bot/api' + resource,
      this.readyRequest(method, requestInit),
    );

    if (response.ok) {
      return (
        parse
          ? await response.json() as Parse extends true ? T : void
          : undefined as Parse extends true ? T : void
      );
    }

    switch (response.status) {
      case 404: {
        const r = await response.text();
        if (r.startsWith('\u26A0\uFE0F')) {
          throw new TpyError<Response>(
            'URL Resource Not Found',
            responseBody(r),
            response.status.toString(),
            response,
          );
        }

        if (r === 'could not find deployment') {
          if (Context.isNullish(ctx.deploymentID)) {
            throw new TpyError<Context>(
              'Nullish Context',
              ctx.deploymentID,
              'ctx.deploymentID',
              ctx,
            );
          }

          throw new TpyError<Response>(
            'Deployment Not Found',
            responseBody(r),
            ctx.deploymentID,
            response,
          );
        }

        if (r === 'could not find guild') {
          if (Context.isNullish(ctx.guildID)) {
            throw new TpyError<Context>(
              'Nullish Context',
              ctx.guildID,
              'ctx.guildID',
              ctx,
            );
          }

          throw new TpyError<Response>(
            'Guild Not Found',
            responseBody(r),
            ctx.guildID,
            response,
          );
        }
        break;
      }

      case 401:
        throw new TpyError<Response>(
          'Unauthorized',
          responseHTTP(response.status.toString()),
          response.status.toString(),
          response,
        );

      case 403:
        throw new TpyError<Response>(
          'Forbidden',
          responseHTTP(response.status.toString()),
          response.status.toString(),
          response,
        );

      case 405:
        throw new TpyError<Response>(
          'HTTP Method Not Allowed',
          responseHTTP(response.status.toString()),
          response.status.toString(),
          response,
        );

      case 400: {
        const res = await response.json();
        if ('msg' in res && res['msg'] === 'missing json body') {
          throw new TpyError<Response>(
            'Missing or Invalid JSON in Request Body',
            responseHTTP(response.status.toString()),
            JSON.stringify(res['msg']),
            response,
          );
        }
        break;
      }

      case 500:
        throw new TpyError<Response>(
          'Internal Server Error',
          responseHTTP(response.status.toString()),
          response.status.toString(),
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
