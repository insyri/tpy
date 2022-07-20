import Tpy from './tpy.ts';
import {
  numstr,
  ParsedPylonWebSocketResponse,
  PylonWebSocketResponse,
} from './utils.ts';
import { EventEmitter } from 'https://deno.land/std@0.148.0/node/events.ts';
import TpyErrToString from './logging.ts';

export default class TpyWs extends EventEmitter {
  private ws?: WebSocket;
  private tpyc: Tpy;
  private deploymentID: numstr;

  constructor(
    tpyInstance: Tpy,
    deploymentID: numstr,
  ) {
    super();
    if (!tpyInstance || !(tpyInstance instanceof Tpy)) {
      throw new Error('A Tpy instance is required');
    }
    if (!deploymentID) throw 'A deployment ID is required';
    this.tpyc = tpyInstance;
    this.deploymentID = deploymentID;
  }

  async connect() {
    const [err, d] = await this.tpyc.getDeployment(this.deploymentID);
    if (err) throw `err: ${TpyErrToString(err)}`;
    this.ws = new WebSocket(d.workbench_url);
    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onerror = this.onError.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
  }

  onOpen() {
    this.emit('open');
  }

  onError() {
    if (!this.ws) return;

    try {
      this.ws.close();
      // deno-lint-ignore no-empty
    } catch {}

    setTimeout(() => {
      this.connect();
    }, 250);
  }

  onClose(event: CloseEvent) {
    this.emit('close', event);
  }

  onMessage(event: MessageEvent) {
    this.emit('message', this.unpack(event.data));
  }

  private unpack<T = unknown>(
    res: PylonWebSocketResponse,
  ): ParsedPylonWebSocketResponse<T[]> {
    return { data: res[0].data as unknown as T[], method: res[0].method };
  }

  close() {
    if (!this.ws) return;
    this.ws.close();
  }
}
