import {
  ParsedPylonWebSocketResponse,
  PylonWebSocketResponse,
} from './utils.ts';

export default class TpyWs {
  private w: WebSocket;
  reconnectTimeout: number;
  isDead = false;

  constructor(wsUrl: string, reconnectTimeout: number = 0) {
    if (!wsUrl) throw 'Url is required';
    let ws: WebSocket | null = null;
    // deno-fmt-ignore
    try { ws = new WebSocket(wsUrl); }
    catch { throw 'Invalid URL'; }
    this.w = ws;
    this.connect();
    this.w.onclose = (_) =>
      this.isDead ? setTimeout(() => this.connect(), reconnectTimeout) : void 0;
    this.reconnectTimeout = reconnectTimeout;
  }

  private connect = () => this.w.onopen = (_) => {};

  private checkDeath() {
    if (this.isDead) throw 'Cannot interact with Tpy WebSocket after close';
  }

  private surfacePylonResponse<T = unknown>(
    res: PylonWebSocketResponse,
  ): ParsedPylonWebSocketResponse<T[]> {
    return { data: res[0].data as unknown as T[], method: res[0].method };
  }

  onMessage = <T = unknown>(
    fn: (msg: ParsedPylonWebSocketResponse<T[]>) => void,
  ) => {
    this.checkDeath();
    this.w.onmessage = (ev) =>
      fn(
        this.surfacePylonResponse(
          JSON.parse(ev.data) as PylonWebSocketResponse,
        ),
      );
  };

  onError = (fn: (ev: ErrorEvent) => void) =>
    this.w.onerror = function (err) {
      if (err instanceof ErrorEvent) fn(err);
    };

  disconnect = () => {
    this.checkDeath();
    this.w.close();
    this.isDead = true;
  };
}
