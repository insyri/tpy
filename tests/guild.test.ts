// import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
// import Tpy from '../src/tpy.ts';

const t = Deno.env.get('PYLON_TOKEN');
if (!t) throw 'PYLON_TOKEN env var not set';

Deno.test('guild', function () {
  // const tpy = new Tpy(t);
  // const guild = await tpy.getAvailableGuilds
});
