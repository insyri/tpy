/**
 * An API client specific to Pylon KV namespace operations. Nearly matches the SDK interface.
 *
 * Pylon uses an internal Key-Value persistence that can
 * be used via the {@linkcode https://pylon.bot/docs/reference/classes/pylon.kvnamespace.html Pylon KVNamespace SDK}.
 *
 * @module
 */

import { Tpy } from "./tpy.ts";
import type { Json, KV } from "./types/pylon.d.ts";
import { parametersPrompt, TpyError } from "./error.ts";
import { Context } from "./context.ts";
import _ from "lodash";

/**
 * A KVNamespace interface that (almost) matches the Pylon KVNamespace SDK class.
 */
export class TpyKV {
  /**
   * The KV namespace title.
   */
  readonly kvnamespace: string;
  private tpyc: Tpy;
  private deploymentID: string;

  /**
   * @param tpyInstance An instantiation of a {@linkcode Tpy} class.
   * @param deploymentID The deployment ID to find the KV namespace on.
   * @param kvnamespace The KV namespace title.
   */
  constructor(tpyInstance: Tpy, deploymentID: string, kvnamespace: string) {
    if (!tpyInstance || !(tpyInstance instanceof Tpy)) {
      throw new TpyError(
        "Missing or Invalid Required Parameter",
        parametersPrompt(
          !tpyInstance ? "missing" : "incompatible",
          "tpyInstance",
        ),
        "tpyInstance",
        tpyInstance,
      );
    }
    if (!deploymentID) {
      throw new TpyError(
        "Missing or Invalid Required Parameter",
        parametersPrompt("missing", "deploymentID"),
        "deploymentID",
        deploymentID,
      );
    }
    this.tpyc = tpyInstance;
    this.deploymentID = deploymentID;
    this.kvnamespace = kvnamespace;
  }

  /**
   * Sets the value of a given key within the key-value store.
   * @param key The key to set.
   * @param value The value to set - must be JSON serializeable.
   * @param options
   */
  async put(key: string, value: Json, options?: KV.OperationOptions.Put) {
    if (options?.ifNotExists && (await this.get(key))) return;

    const { deploymentID, kvnamespace } = this;
    await this.tpyc.httpRaw(
      new Context({ deploymentID }),
      `/deployments/${deploymentID}/kv/namespaces/${kvnamespace}/items/${key}`,
      undefined,
      "PUT",
      {
        body: JSON.stringify({
          string: typeof value === "string" ? `"${value}"` : value,
        }),
      },
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
    options?: KV.OperationOptions.Put,
  ) {
    if (options?.ifNotExists && (await this.get(key))) return;

    const { deploymentID, kvnamespace } = this;
    await this.tpyc.httpRaw(
      new Context({ deploymentID, kvnamespace }),
      `/deployments/${deploymentID}/kv/namespaces/${kvnamespace}/items/${key}`,
      undefined,
      "PUT",
      { body: JSON.stringify({ bytes: value }) },
    );
  }

  /**
   * Gets a key's value - returning the value or undefined.
   *
   * @param key The key to get.
   * @template T The return type of the function to a given `Json` type.
   */
  async get<T extends Json = Json>(key: string): Promise<T | undefined> {
    const { deploymentID, kvnamespace } = this;
    const response = await this.tpyc.httpRaw<KV.GET.Items<T>>(
      new Context({ deploymentID, kvnamespace }),
      `/deployments/${deploymentID}/kv/namespaces/${kvnamespace}/items`,
    );
    let item: T | undefined;
    for (let i = 0; i < response.length; i++) {
      const p = response[i];
      if (p.key !== key) continue;
      if (!p.value.string) {
        throw new TpyError(
          "Missing or Unexpected Value in Response",
          `response[${i}].value.string is undefined`,
          `response[${i}].value.string`,
          response,
        );
      }
      item = ["'", '"', "`"].includes(p.value.string[0])
        ? JSON.parse(p.value.string)
        : p.value.string;
      break;
    }
    return item;
  }

  /**
   * Gets a key's value - returning the value or undefined.
   *
   * @param key The Key to get.
   */
  async getArrayBuffer(key: string): Promise<ArrayBuffer | undefined> {
    const { deploymentID, kvnamespace } = this;
    const response = await this.tpyc.httpRaw<KV.GET.Items>(
      new Context({ deploymentID, kvnamespace }),
      `/deployments/${deploymentID}/kv/namespaces/${kvnamespace}/items`,
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
   *
   * @param options
   */
  async list(options?: KV.OperationOptions.List) {
    const { deploymentID, kvnamespace } = this;
    let response = await this.tpyc.httpRaw<KV.GET.Items>(
      new Context({ deploymentID, kvnamespace }),
      `/deployments/${deploymentID}/kv/namespaces/${kvnamespace}/items`,
    );

    if (options?.limit) response = response.slice(0, options.limit);

    if (options?.from) {
      response = response.slice(
        response.findIndex((i) => i.key === options.from) + 1,
        response.length,
      );
    }

    return response.map((i) => i.key);
  }

  /**
   * Lists the keys and values in a namespace, including their expiration date if
   * applicable.
   *
   * The maximum limit is 100, however.
   *
   * @template T The type of the key's value.
   */
  async items<T>(
    options?: KV.OperationOptions.Items,
  ): Promise<KV.GET.ItemsFlattened<T>> {
    const { deploymentID, kvnamespace } = this;
    let response = await this.tpyc.httpRaw<KV.GET.Items>(
      new Context({ deploymentID, kvnamespace }),
      `/deployments/${deploymentID}/kv/namespaces/${kvnamespace}/items`,
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
        ? (JSON.parse(i.value.string) as T)
        : i.value.bytes;
      if (!j) {
        throw new TpyError(
          "Missing or Unexpected Value in Response",
          `response[${i}].value.string and/or response[${i}].value.bytes are undefined`,
          [`response[${i}].value.string`, `response[${i}].value.bytes`].join(
            ", ",
          ),
          response,
        );
      }
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
    const { deploymentID, kvnamespace } = this;
    return (
      (
        await this.tpyc.httpRaw<KV.GET.Namespace>(
          new Context({ deploymentID, kvnamespace }),
          `/deployments/${deploymentID}/kv/namespaces`,
        )
      ).find((n) => n.namespace == kvnamespace)?.count || 0
    );
  }

  /**
   * Clears the namespace. Returning the number of keys deleted.
   *
   * This operation will delete all the data in the namespace.
   * The data is irrecoverably deleted.
   *
   * **Use with caution!**
   */
  async clear() {
    const { deploymentID, kvnamespace } = this;
    return (
      await this.tpyc.httpRaw<KV.DELETE.Namespace>(
        new Context({ deploymentID, kvnamespace }),
        `/deployments/${deploymentID}/kv/namespaces/${kvnamespace}`,
        undefined,
        "DELETE",
      )
    ).keys_deleted;
  }

  /**
   * Deletes a given key from the namespace. Throwing if the key does not exist,
   * or if `options.prevValue` is set the previous value is not equal to the
   * value provided.
   *
   * @param key The key to delete.
   * @param options Options, which can provide a delete if equals.
   */
  async delete(key: string, options?: KV.OperationOptions.Delete) {
    const { deploymentID, kvnamespace } = this;
    const del = async () =>
      await this.tpyc.httpRaw(
        new Context({ deploymentID, kvnamespace }),
        `/deployments/${deploymentID}/kv/namespaces/${kvnamespace}/items/${key}`,
        undefined,
        "DELETE",
      );

    if (!options?.prevValue) await del();
    else {
      if ((await this.get(key)) == options.prevValue) await del();
    }
  }

  /**
   * Compare and set a key's value.
   *
   * @param key The key to compare and set.
   * @param compare The object to compare with the key's value.
   * @param set The value the key will be set to if `compare` matches the key's value.
   * @param ttl Optional ttl, either a number, which is the ttl in milliseconds, or a `Date` when the key should expire.
   */
  async cas(
    key: string,
    compare: Json,
    set: Json,
    ttl?: Date | number,
  ): Promise<void>;
  /**
   * Compare and set a key's value, setting the value only if the key does not already exist.
   *
   * @param key The key to compare and set.
   * @param compare The object to compare with the key's value.
   * @param set The value the key will be set to if the key does not exist.
   * @param ttl Optional ttl, either a number, which is the ttl in milliseconds, or a `Date` when the key should expire.
   */
  async cas(
    key: string,
    compare: undefined,
    set: Json,
    ttl?: Date | number,
  ): Promise<void>;
  /**
   * Compare and delete a key's value. This is functionally equivalent to {@linkcode delete}, if the `prevValue` option is provided.
   *
   * @param key The key to compare and set.
   * @param compare The object to compare with the key's value.
   * @param ttl Optional ttl, either a number, which is the ttl in milliseconds, or a `Date` when the key should expire.
   */
  async cas(
    key: string,
    compare: Json,
    set: undefined,
    ttl?: Date | number,
  ): Promise<void>;
  async cas(
    key: string,
    compare: Json | undefined,
    set: Json | undefined,
    ttl?: Date | number,
  ): Promise<void> {
    const k = await this.get(key);
    if (ttl && ttl instanceof Date) ttl = ttl.getTime();
    if (k && compare && set) {
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      if (_.isEqual(k, compare)) await this.put(key, set, { ttl });
    } else if (!k && !compare && set) {
      await this.put(key, set, { ttl });
    } else if (!k && compare && !set) {
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      if (_.isEqual(k, compare)) await this.delete(key);
    }
  }

  /**
   * A higher level alternative to {@linkcode cas}. Updates a key, using the specified `transaction` function.
   *
   * @param key The key to compare and set.
   * @param transaction A function that mutates the value, returning the value that should be set to `key`.
   */
  async transact<T extends Json>(
    key: string,
    transaction: (prev: T | undefined) => T | undefined,
  ): Promise<T | undefined> {
    const k = await this.get<T>(key);
    const result = transaction(k);

    if (result) await this.put(key, result);
    else await this.delete(key);

    return result;
  }
}
