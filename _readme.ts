// import Tpy, { TpyErrToString } from 'https://deno.land/x/tpy@v0.1.2/mod.ts'; // REPLACE
import Tpy, { TpyErrToString } from './mod.ts';
// Or use Node
// import Tpy, { TpyErrToString } from 'tpy';

const client = new Tpy('My.pYl0N_tOKEn');
const [err, user] = await client.getUser();

// Tpy has strongly typed error handling so there are no need for type guards.
// If there's an error, the response will return undefined,
// Otherwise, the response will the requested type as expected.
if (err) {
  // deno-fmt-ignore
  // throw `There was an error while fetching the user: ${TpyErrToString(err)}.`; // REPLACE
  console.log(`There was an error while fetching the user: ${TpyErrToString(err)}.`);
  // user is now !undefined.
} else console.log(`User logged in: ${user.displayName}`);
