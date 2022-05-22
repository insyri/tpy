// REPLACE import Tpy from https://deno.land/x/tpy@0.0.1/mod.ts;
import Tpy, { TpyErrToString } from './mod.ts';
// Or use Node
// import Tpy from 'tpy';

const client = new Tpy('My.pYl0N_tOKEn');
const [err, user] = await client.getUser();

// Tpy has strongly typed error handling so there are no need for type gaurds.
// See type TpyTup for how union types are avoided.
// deno-fmt-ignore
if (err)
  /* REPLACE */ throw `There was an error while fetching the user: ${TpyErrToString(err)}.`;
  // console.log(`There was an error while fetching the user: ${TpyErrToString(err)}.`);
else console.log(`User logged in: ${user?.displayName}`);
