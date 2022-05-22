// import Tpy from 'https://deno.land/x/tpy@0.0.1/mod.ts'; // REPLACE
import Tpy, { TpyErrToString } from './mod.ts';
// Or use Node
// import Tpy from 'tpy';

const client = new Tpy('My.pYl0N_tOKEn');
const [err, user] = await client.getUser();

// Tpy has strongly typed error handling so there are no need for type gaurds.
// If there's an error, the response will return undefined,
// Otherwise, the response will the requested type as expected.
if (err) {
  // deno-fmt-ignore
  // throw `There was an error while fetching the user: ${TpyErrToString(err)}.`; // REPLACE
  console.log(`There was an error while fetching the user: ${TpyErrToString(err)}.`);
} else console.log(`User logged in: ${user.displayName}`);
