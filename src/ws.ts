import Tpy from './tpy.ts';
import {
  numstr,
  ParsedPylonWebSocketResponse,
  PylonWebSocketResponse,
} from './utils.ts';
import { EventEmitter } from 'https://deno.land/std@0.148.0/node/events.ts';
import TpyErrToString from './logging.ts';

interface WSEventMap {
  open: Event;
  close: CloseEvent;
  error: Event | ErrorEvent;
  message: ParsedPylonWebSocketResponse;
}

type EventType = keyof WSEventMap;
type Payload<T extends EventType> = WSEventMap[T];

/**
 * A Tpy WebSocket manager.
 */
export default class TpyWs {
  private ws?: WebSocket;
  private tpyc: Tpy;
  private deploymentID: numstr;
  private tryToConnect = true;
  private reconnectionTimout: number;

  /**
   * The raw event emitter object, used for proxying events while keeping streams on.
   */
  rawEventEmitter = new EventEmitter();

  constructor(
    /**
     * A constructed instance of Tpy.
     */
    tpyInstance: Tpy,
    /**
     * The deployment ID to follow.
     */
    deploymentID: numstr,
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
   * Adds an event listener.
   * @see rawEventEmitter for internal access to this.
   * @param type The WebSocket event type to listen on.
   * @param callback The function to call when this event is fired.
   */
  on = <T extends EventType>(type: T, callback: (data: Payload<T>) => void) => {
    this.rawEventEmitter.on(type, callback);
  };

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

  private unpack<T = unknown>(
    res: PylonWebSocketResponse,
  ): ParsedPylonWebSocketResponse<T[]> {
    return { data: res[0].data as unknown as T[], method: res[0].method };
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
