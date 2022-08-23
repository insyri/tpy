import Tpy from './tpy.ts';
import type { StringifiedNumber } from './types/util.d.ts';
import type Pylon from './types/pylon.d.ts';

/**
 * A KVNamespace interface that matches the Pylon KVNamespace class.
 */
export default class KVNamespace {
  /**
   * The namespace that this KVNamespace was constructed with.
   */
  readonly namespace: string;
  private tpyc: Tpy;
  private deploymentID: StringifiedNumber;

  constructor(
    tpyInstance: Tpy,
    deploymentID: StringifiedNumber,
    namespace: string,
  ) {
    if (!tpyInstance || !(tpyInstance instanceof Tpy)) {
      throw new Error('A Tpy instance is required');
    }
    if (!deploymentID) throw 'A deployment ID is required';
    this.tpyc = tpyInstance;
    this.deploymentID = deploymentID;
    this.namespace = namespace;
  }

  /**
   * Sets the value of a given key within the key-value store.
   * @param key The key to set.
   * @param value The value to set - must be JSON serializeable.
   * @param options
   */
  async put(
    key: string,
    value: Pylon.Json,
    options?: Pylon.KV.OperationOptions.Put,
  ) {
    if (options?.ifNotExists) {
      if (await this.get(key)) throw 'Key exists already';
      // TODO: add better message and use tpyerr
    }

    await this.tpyc.httpRaw(
      `/deployments/${this.deploymentID}/kv/namespaces/${this.namespace}/items/${key}`,
      'PUT',
      { body: JSON.stringify({ 'string': value }) },
    );
  }

  /**
   * Gets a key's value - returning the value or undefined. Type `T` can be provided,
   * in order to cast the return type of the function to a given Json type.
   * @param key The Key to get
   */
  async get<K>(key: string): Promise<K | undefined> {
    const response = await this.tpyc.httpRaw<Pylon.KV.GET.Items<K>>(
      `/deployments/${this.deploymentID}/kv/namespaces/${this.namespace}/items`,
    );
    let item: K | undefined;
    for (const p of response) {
      if (p.key !== key) continue;
      let j = p.value.string as unknown as K;
      try {
        j = JSON.parse(p.value.string);
        // deno-lint-ignore no-empty
      } catch {}
      item = j;
      break;
    }
    return item;
  }

  /**
   * Lists the keys that are set within the namespace.
   * @param options
   * @returns
   */
  async list(options?: Pylon.KV.OperationOptions.List) {
    const response = await this.tpyc.httpRaw<Pylon.KV.GET.Items>(
      `/deployments/${this.deploymentID}/kv/namespaces/${this.namespace}/items`,
    );

    if (options?.limit) response.splice(0, options.limit);

    if (options?.from) {
      response.splice(
        response.findIndex((i) => i.key === options.from) + 1,
        response.length,
      );
    }

    return response.map((i) => i.key);
  }

  /**
   * Exactly like `KVNamespace.list`, except that it returns the key + value pairs instead.
   *
   * The maximum limit is 100, however.
   */
  async items<T>(
    options?: Pylon.KV.OperationOptions.Items,
  ): Promise<Pylon.KV.GET.ItemsFlattened<T, true>[]> {
    const response = await this.tpyc.httpRaw<Pylon.KV.GET.Items>(
      `/deployments/${this.deploymentID}/kv/namespaces/${this.namespace}/items`,
    );

    if (options?.limit) response.splice(0, options.limit);

    if (options?.from) {
      response.splice(
        response.findIndex((i) => i.key === options.from) + 1,
        response.length,
      );
    }

    console.log('httpraw');
    console.log(response);

    return response.map((i) => {
      return {
        key: i.key,
        value: JSON.parse(i.value.string) as T,
        expiresAt: i.value.expiresAt,
      };
    });
  }

  /**
   * Returns the number of keys present in this namespace.
   */
  async count() {
    return (await this.tpyc.httpRaw<Pylon.KV.GET.Namespace>(
      `/deployments/${this.deploymentID}/kv/namespaces`,
    )).find((n) => n.namespace == this.namespace)?.count || 0;
  }

  /**
   * Clears the namespace. Returning the number of keys deleted.
   *
   * This operation will delete all the data in the namespace.
   * The data is irrecoverably deleted.
   *
   * Use with caution!
   */
  async clear() {
    return (await this.tpyc.httpRaw<Pylon.KV.DELETE.Namespace>(
      `/deployments/${this.deploymentID}/kv/namespaces/${this.namespace}`,
      'DELETE',
    )).keys_delted;
  }

  /**
   * Deletes a given key from the namespace. Throwing if the key does not exist,
   * or if `options.prevValue` is set, the previous value is not equal to the
   * value provided.
   * @param key The key to delete
   * @param options Options, which can provide a delete if equals.
   */
  async delete(key: string, options?: Pylon.KV.OperationOptions.Delete) {
    const del = async () =>
      await this.tpyc.httpRaw(
        `/deployments/${this.deploymentID}/kv/namespaces/${this.namespace}/items/${key}`,
        'DELETE',
      );
    if (!options?.prevValue) await del();
    else {
      if (await this.get(key) == options.prevValue) await del();
      else throw 'Previous value does not match API recieved value';
    }
  }
}
