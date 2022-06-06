import {
  ParsedPylonWebSocketResponse,
  PylonWebSocketResponse,
} from './utils.ts';

export default class TpyWs {
  private w: WebSocket;
  private reconnectTimeout: number;

  constructor(wsUrl: string, reconnectTimeout: number = 0) {
    if (!wsUrl) throw 'Url is required';
    let ws: WebSocket | null = null;
    // deno-fmt-ignore
    try { ws = new WebSocket(wsUrl); }
    catch { throw 'Could not connect to WebSocket'; }
    this.w = ws;
    this.reconnectTimeout = reconnectTimeout;
  }

  private reconnect = () => {
    setTimeout(
      () => /* I don't know what to add here. */ () => {},
      this.reconnectTimeout,
    );
  };

  private surfacePylonResponse<T = unknown>(
    res: PylonWebSocketResponse,
  ): ParsedPylonWebSocketResponse<T[]> {
    return { data: res[0].data as unknown as T[], method: res[0].method };
  }

  onMessage<T = unknown>(
    fn: (msg: ParsedPylonWebSocketResponse<T[]>) => void,
  ) {
    this.w.onmessage = (ev) =>
      fn(
        this.surfacePylonResponse(
          JSON.parse(ev.data) as PylonWebSocketResponse,
        ),
      );
  }

  onOpen(fn: (ev: Event) => void) {
    this.w.onopen = (m) => fn(m);
  }

  onError(fn: (ev: ErrorEvent) => void) {
    this.w.onerror = (err) => {
      if (err instanceof ErrorEvent) {
        if (err.message === 'IO error: unexpected end of file') {
          this.reconnect();
        } else {
          fn(err);
        }
      }
    };
  }

  disconnect() {
    this.w.close();
  }
}
