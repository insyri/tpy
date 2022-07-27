import Tpy from './tpy.ts';
import type { StringifiedNumber, Unpacked } from './types/util.d.ts';
import type Pylon from './types/pylon.d.ts';
import { EventEmitter } from 'https://deno.land/std@0.148.0/node/events.ts';
import TpyErrToString from './logging.ts';

interface WSEventMap<C extends unknown[] = unknown[]> {
  open: Event;
  /** Emitted on a close event.
   * Notice that this will usually always emit on close events. */
  close: CloseEvent;
  /** Emitted on a error event.
   * Notice that this will usually always emit on close events. */
  error: Event | ErrorEvent;
  /**
   * The message contents
   */
  message: Unpacked<Pylon.WebSocketResponse<C>>;
}

type EventType<C extends unknown[] = unknown[]> = keyof WSEventMap<C>;
type Payload<T extends EventType, C extends unknown[] = unknown[]> = WSEventMap<
  C
>[T];

/**
 * The Tpy WebSocket manager.
 */
export default class TpyWs {
  private ws?: WebSocket;
  private tpyc: Tpy;
  private deploymentID: StringifiedNumber;
  private tryToConnect = true;
  private reconnectionTimout: number;

  rawEventEmitter = new EventEmitter();

  constructor(
    /**
     * A constructed instance of Tpy.
     */
    tpyInstance: Tpy,
    /**
     * The deployment ID to follow.
     */
    deploymentID: StringifiedNumber,
    /**
     * The reconnection timeout in milliseconds.
     */
    reconnectionTimeout = 250,
  ) {
    if (!tpyInstance || !(tpyInstance instanceof Tpy)) {
      throw new Error('A Tpy instance is required');
    }
    if (!deploymentID) throw 'A deployment ID is required';
    this.tpyc = tpyInstance;
    this.deploymentID = deploymentID;
    this.reconnectionTimout = reconnectionTimeout;
  }

  /**
   * Adds an event listener to WebSocket events.
   * @see rawEventEmitter for internal access to this.
   * @param type Fired when the WebSocket is (re)opened.
   * @param callback A function to call when this event is fired.
   *
   * @event
   */
  on(type: 'open', callback: (data: Event) => void): EventEmitter;
  /**
   * Adds an event listener to WebSocket events.
   * @see rawEventEmitter for internal access to this.
   * @param type Fired when the WebSocket is closed.
   * @param callback A function to call when this event is fired.
   *
   * @event
   */
  on(type: 'close', callback: (data: CloseEvent) => void): EventEmitter;
  /**
   * Adds an event listener to WebSocket events.
   * @see rawEventEmitter for internal access to this.
   * @param type Fired when the WebSocket captures an error.
   * @param callback A function to call when this event is fired.
   *
   * # Notice!
   * This event is fired every time the WebSocket is closed. This is
   * an action of the Pylon backend marking closed connections as errors.
   *
   * @event
   */
  on(type: 'error', callback: (data: ErrorEvent | Event) => void): EventEmitter;
  /**
   * Adds an event listener to WebSocket events.
   * @see rawEventEmitter for internal access to this.
   * @param type Fired when the WebSocket recieves a message.
   * @param callback A function to call when this event is fired.
   *
   * @event
   */
  on<C extends unknown[] = unknown[]>(
    type: 'message',
    callback: (data: Unpacked<Pylon.WebSocketResponse<C>>) => void,
  ): EventEmitter;
  on<C extends unknown[] = unknown[]>(type: unknown, callback: unknown) {
    if (typeof type != 'string' || typeof callback != 'function') throw '';
    return this.rawEventEmitter.on(
      type,
      <(data: Unpacked<Pylon.WebSocketResponse<C>>) => void> callback,
    );
  }

  /**
   * Retrieves the workbench URL and ties the WebSocket events to an event emitter.
   * @see rawEventEmitter for internal access to this.
   */
  async connect() {
    if (!this.tryToConnect) return;
    const [err, d] = await this.tpyc.getDeployment(this.deploymentID);
    if (err) throw `err: ${TpyErrToString(err)}`;
    this.ws = new WebSocket(d.workbench_url);
    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onerror = this.onError.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
  }

  private onOpen(event: Event) {
    this.rawEventEmitter.emit('open', event);
  }

  private onError(event: Event | ErrorEvent) {
    if (!this.ws) return;
    this.rawEventEmitter.emit('error', event);

    try {
      this.ws.close();
      // deno-lint-ignore no-empty
    } catch {}

    setTimeout(() => {
      this.connect();
    }, this.reconnectionTimout);
  }

  private onClose(event: CloseEvent) {
    this.rawEventEmitter.emit('close', event);
  }

  private onMessage(event: MessageEvent<string>) {
    this.rawEventEmitter.emit('message', this.unpack(JSON.parse(event.data)));
  }

  private unpack<T extends unknown[] = unknown[]>(
    res: Pylon.WebSocketResponse<T>,
  ): Unpacked<Pylon.WebSocketResponse<T>> {
    const { method, data } = res[0];
    return { data, method };
  }

  /**
   * Closes the WebSocket connection, reconnection will not be attempted.
   */
  close() {
    if (!this.ws) return;
    this.ws.close();
    this.tryToConnect = false;
  }
}
