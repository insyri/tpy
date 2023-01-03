/**
 * An {@linkcode EventEmitter} forwarder that keeps an emitter alive while a {@linkcode WebSocket}
 * reconnects. Listens to a deployment's console output.
 *
 * Pylon uses {@linkcode WebSocket}s to listen to a deployment's console out/err.
 * While this idea is simple enough, the host closes the socket on an interval
 * ({@linkcode https://discord.com/channels/530557949098065930/696860766665703515/983184117040562246 by design}),
 * having to make the user reconnect to the socket to continue listening.
 *
 * @module
 */

// build:node-only import WebSocket, {
// build:node-only   type CloseEvent,
// build:node-only   type Event,
// build:node-only   type ErrorEvent,
// build:node-only   type MessageEvent,
// build:node-only } from "ws";
import { Tpy } from "./tpy.ts";
import type { Unpacked } from "./types/util.d.ts";
import type { PylonWebSocket } from "./types/pylon.d.ts";
import { EventEmitter } from "events";
import { parametersPrompt, TpyError } from "./error.ts";

type messageTypes = typeof TpyWs.prototype.messageTypes[number];

/**
 * An EventEmitter forwarder that keeps an emitter alive while a {@linkcode WebSocket}
 * reconnects. Listens to a deployment's console output.
 *
 * This class creates a parent emitter over a child {@linkcode WebSocket} emitter, forwarding events and
 * persists when the child emitter terminates, maintaining active listeners and allowing reconnection
 * with customizable timeouts.
 */
export class TpyWs {
  readonly messageTypes = ["message", "open", "close", "error"] as const;
  private tpyClient: Tpy;
  private deploymentID: string;
  private tryToConnect = true;
  private reconnectionTimout: number;
  private _websocket?: WebSocket;

  /**
   * The proxy stream that ensures the process (or at least the stream) is not terminated.
   */
  eventEmitter = new EventEmitter();
  /**
   * The raw {@linkcode WebSocket} object.
   */
  get websocket() {
    return this._websocket;
  }

  /**
   * @param tpyInstance An instantiation of a {@linkcode Tpy} class.
   * @param deploymentID The deployment ID to look up for reconnection links.
   * @param reconnectionTimeout The reconnection timeout in milliseconds.
   */
  constructor(
    tpyInstance: Tpy,
    deploymentID: string,
    reconnectionTimeout = 250,
  ) {
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
    this.tpyClient = tpyInstance;
    this.deploymentID = deploymentID;
    this.reconnectionTimout = reconnectionTimeout;
  }

  /**
   * Adds an event listener to WebSocket events.
   * @param type Fired when the WebSocket is (re)opened.
   * @param callback A callback function to invoke when this event is fired.
   *
   * @event
   */
  on(type: "open", callback: (data: Event) => void): EventEmitter;
  /**
   * Adds an event listener to WebSocket events.
   * @param type Fired when the WebSocket is closed.
   * @param callback A callback function to invoke when this event is fired.
   *
   * @event
   */
  on(type: "close", callback: (data: CloseEvent) => void): EventEmitter;
  /**
   * Adds an event listener to WebSocket events.
   * @param type Fired when the WebSocket captures an error.
   * @param callback A callback function to invoke when this event is fired.
   *
   * # Notice!
   * This event is fired every time the WebSocket is closed. This is
   * an action of the Pylon backend marking closed connections as errors.
   *
   * @event
   */
  on(type: "error", callback: (data: ErrorEvent | Event) => void): EventEmitter;
  /**
   * Adds an event listener to WebSocket events.
   * @param type Fired when the WebSocket recieves a message.
   * @param callback A callback function to invoke when this event is fired.
   *
   * @template T The type of the `data` object inside {@linkcode PylonWebSocket.Response}.
   *
   * @event
   */
  on<T extends unknown[]>(
    type: "message",
    callback: (data: Unpacked<PylonWebSocket.Response<T>>) => void,
  ): EventEmitter;
  on<T extends unknown[]>(type: messageTypes, callback: unknown) {
    if (typeof callback != "function") {
      throw new TpyError(
        "Missing or Invalid Required Parameter",
        parametersPrompt("incompatible", "callback"),
        "callback",
        typeof callback,
      );
    }
    return this.eventEmitter.on(
      type,
      <(data: Unpacked<PylonWebSocket.Response<T>>) => void> callback,
    );
  }

  /**
   * Retrieves the workbench URL and ties the WebSocket events to an event emitter.
   */
  async connect() {
    if (!this.tryToConnect) return;
    this._websocket = new WebSocket(
      (await this.tpyClient.getDeployment(this.deploymentID)).workbench_url,
    );

    this._websocket.onopen = ((event: Event) => {
      this.eventEmitter.emit("open", event);
    }).bind(this);

    this._websocket.onclose = ((event: CloseEvent) => {
      this.eventEmitter.emit("close", event);
      this.timedConnect();
    }).bind(this);

    this._websocket.onerror = ((event: Event | ErrorEvent) => {
      if (!this.websocket) return;
      this.eventEmitter.emit("error", event);
      try {
        this.websocket.close();
        // deno-lint-ignore no-empty
      } catch {}
      this.timedConnect();
    }).bind(this);

    this._websocket.onmessage = ((event: MessageEvent) => {
      this.eventEmitter.emit("message", JSON.parse(String(event.data))[0]);
    }).bind(this);
  }

  /**
   * Runs the {@linkcode connect} method after the specified reconnection timeout.
   */
  timedConnect() {
    setTimeout(async () => {
      if (this.tryToConnect) await this.connect();
    }, this.reconnectionTimout);
  }

  /**
   * Closes the WebSocket connection, reconnection will not be attempted.
   */
  close() {
    if (!this.websocket) return;
    for (const type in this.messageTypes) {
      this.eventEmitter.removeAllListeners(type);
    }
    this.websocket.close();
    this.tryToConnect = false;
  }
}
