import TpyErrToString from './logging.ts';
import Tpy from './tpy.ts';
import {
  numstr,
  ParsedPylonWebSocketResponse,
  PylonWebSocketResponse,
} from './utils.ts';

export default class TpyWs {
  private w: WebSocket | null = null;
  // private proxw = { ws: this.w };
  private tpyClient: Tpy;
  private deploymentID: numstr;

  constructor(
    tpyInstance: Tpy,
    deploymentID: numstr,
  ) {
    if (!tpyInstance || !(tpyInstance instanceof Tpy)) {
      throw new Error('A Tpy instance is required');
    }
    this.tpyClient = tpyInstance;
    if (!deploymentID) throw 'DeploymentID is required';
    this.deploymentID = deploymentID;
  }

  async init() {
    console.log('init');
    const [err, deployment] = await this.tpyClient.getDeployment(
      this.deploymentID,
    );
    if (err) throw `err: ${TpyErrToString(err)}`;
    const w = new WebSocket(deployment.workbench_url);
    this.w = w;
    this.w.addEventListener('close', async () => await this.init());
  }

  private surfacePylonResponse<T = unknown>(
    res: PylonWebSocketResponse,
  ): ParsedPylonWebSocketResponse<T[]> {
    return { data: res[0].data as unknown as T[], method: res[0].method };
  }

  onMessage<T = unknown>(
    fn: (msg: ParsedPylonWebSocketResponse<T[]>) => void,
  ) {
    if (!this.w) {
      throw 'WebSocket not created, please use the init() method first.';
    }
    // const w = new Proxy(this.proxw, {
    //   set: (target, key, value) => {
    //     console.log(target, key, value);
    //     return true;
    //   },
    // });
    // console.log(w);

    // this.w.addEventListener('close', () => console.log('closeddd'));

    this.w.onmessage = (ev) =>
      fn(
        this.surfacePylonResponse(
          JSON.parse(ev.data) as PylonWebSocketResponse,
        ),
      );
  }

  onError(fn: (ev: Event | ErrorEvent) => void) {
    if (!this.w) {
      throw 'WebSocket not created, please use the init() method first.';
    }
    // this.w.addEventListener('close', () => this.onError(fn));

    this.w.onerror = (err) => fn(err);
  }

  disconnect() {
    if (!this.w) {
      throw 'WebSocket not created, please use the init() method first.';
    }

    this.w.close();
    this.w = null;
  }
}
