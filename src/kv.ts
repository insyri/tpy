import Tpy from './tpy.ts';
import type { StringifiedNumber } from './types/util.d.ts';
import type Pylon from './types/pylon.d.ts';
import TpyErr from './tpy_err.ts';

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
   * Sets the value of a given key within the key-value store.
   * @param key The key to set.
   * @param value The value to set.
   * @param options
   */
  async putArrayBuffer(
    key: string,
    value: ArrayBuffer,
    options?: Pylon.KV.OperationOptions.Put,
  ) {
    if (options?.ifNotExists) {
      if (await this.get(key)) throw 'Key exists already';
      // TODO: add better message and use tpyerr
    }

    await this.tpyc.httpRaw(
      `/deployments/${this.deploymentID}/kv/namespaces/${this.namespace}/items/${key}`,
      'PUT',
      { body: JSON.stringify({ 'bytes': value }) },
    );
  }

  /**
   * Gets a key's value - returning the value or undefined. Type `T` can be provided,
   * in order to cast the return type of the function to a given Json type.
   * @param key The Key to get
   */
  async get<T extends Pylon.Json = Pylon.Json>(
    key: string,
  ): Promise<T | undefined> {
    const response = await this.tpyc.httpRaw<Pylon.KV.GET.Items<T>>(
      `/deployments/${this.deploymentID}/kv/namespaces/${this.namespace}/items`,
    );
    let item: T | undefined;
    for (const p of response) {
      if (p.key !== key) continue;
      if (!p.value.string) throw TpyErr.UNEXPECTED_OR_MISSING_VALUE;
      item = JSON.parse(p.value.string);
      break;
    }
    return item;
  }

  /**
   * Gets a key's value - returning the value or undefined. Type `T` can be provided,
   * in order to cast the return type of the function to a given Json type.
   * @param key The Key to get
   */
  async getArrayBuffer(key: string): Promise<ArrayBuffer | undefined> {
    const response = await this.tpyc.httpRaw<Pylon.KV.GET.Items>(
      `/deployments/${this.deploymentID}/kv/namespaces/${this.namespace}/items`,
    );
    let item: ArrayBuffer | undefined;
    for (const p of response) {
      if (p.key !== key) continue;
      const arr = new TextEncoder().encode(p.value.bytes);
      item = arr.buffer.slice(arr.byteOffset, arr.byteLength + arr.byteOffset);
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
  ): Promise<Pylon.KV.GET.ItemsFlattened<T>> {
    let response = await this.tpyc.httpRaw<Pylon.KV.GET.Items>(
      `/deployments/${this.deploymentID}/kv/namespaces/${this.namespace}/items`,
    );

    if (options?.from) {
      response = response.slice(
        response.findIndex((i) => i.key === options.from) + 1,
        response.length,
      );
    }

    if (options?.limit) {
      response = response.slice(0, options.limit);
    }

    return response.map((i) => {
      const j = i.value.string
        ? JSON.parse(i.value.string) as T
        : i.value.bytes;
      if (!j) throw TpyErr.UNEXPECTED_OR_MISSING_VALUE;
      return {
        key: i.key,
        value: j as unknown as T,
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
    )).keys_deleted;
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
