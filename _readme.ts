// import Tpy, { TpyErrToString } from 'https://deno.land/x/tpy@v0.1.2/mod.ts'; // REPLACE
import Tpy, { TpyErrToString } from './mod.ts';
// Or use Node
// import Tpy, { TpyErrToString } from 'tpy';
// REPLACE
import 'https://deno.land/x/dotenv@v3.2.0/load.ts';

// const client = new Tpy('My.pYl0N_tOKEn'); // REPLACE
const client = new Tpy(Deno.env.get('PYLON_TOKEN')!);
const [user_err, user] = await client.getUser();

// Tpy has strongly typed error handling so there are no need for type guards.
// If there's an error, the response will return undefined,
// Otherwise, the response will the requested type as expected.
if (user_err) {
  throw `There was an error while fetching the user: ${
    TpyErrToString(user_err)
  }.`;
}
// user is now for sure our expected type, so we can safely access it.
console.log(`User logged in: ${user.displayName}`);

// const [ws_err, ws] = await client.connectSocket.fromGuildID('123456789012345'); // REPLACE
const [ws_err, ws] = await client.connectSocket.fromGuildID(
  <`${bigint | number}`> Deno.env.get('DISCORD_SERVER_ID')!,
);
if (ws_err) {
  throw `There was an error while fetching the guild: ${
    TpyErrToString(ws_err)
  }.`;
}

// Dynamically finds the workbench URL to connect to
await ws.connect();

ws.on('open', (_) => console.log('The Socket has been opened!'));
ws.on('message', (payload) => console.log(payload.data));
ws.on('message', <[string, number]>(payload) => console.log(payload.data));
// REPLACE
setTimeout(() => ws.close(), 10000);

// const func: <T>(x: T, index: number) => string = (x, index) => {
// const func: <T>(x: T, index: number) => string = <T>(x: T, index: number) => {