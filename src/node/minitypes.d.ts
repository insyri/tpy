export type numstr = `${number}`;
export type PylonVerbs = 'GET' | 'POST';

// prettier-ignore
type To59 = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30' | '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38' | '39' | '40' | '41' | '42' | '43' | '44' | '45' | '46' | '47' | '48' | '49' | '50' | '51' | '52' | '53' | '54' | '55' | '56' | '57' | '58' | '59';

// prettier-ignore
type To23 = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '21' | '22' | '23';

// prettier-ignore
type To31 = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30' | '31';

// prettier-ignore
type To12 = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

// prettier-ignore
type To7 = '1' | '2' | '3' | '4' | '5' | '6' | '7';

// prettier-ignore
type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';

// prettier-ignore
type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

type AnyTimeUnspecific = To59 | To23 | To31 | To12 | To7 | Month | Day;

type AnyTimeSpecific<T extends AnyTimeUnspecific> = T;

// make shit optional
type Range<T extends AnyTimeUnspecific> =
  `${AnyTimeSpecific<T>}-${AnyTimeSpecific<T>}`;
type Interval<T extends AnyTimeUnspecific> =
  `${AnyTimeSpecific<T>}/${AnyTimeSpecific<T>}`;
type Listed<T extends AnyTimeUnspecific> = `${AnyTimeSpecific<T>}`;

type CronPart = Range<T> | Interval<T> | Listed<T> | AnyTimeSpecific<T>;

/**
 * ```txt
 * ┌───── Second (0-59)
 * │ ┌───── Min (0-59 or *)
 * │ │ ┌───── Hour (0-23 or *)
 * │ │ │ ┌───── Day of Month (1-31 or *)
 * │ │ │ │ ┌───── Month (1-12, Jan-Dec, or *)
 * │ │ │ │ │ ┌───── Day of Week (1-7, Mon-Sun, or *)
 * │ │ │ │ │ │ ┌───── Year (optional, default: *)
 * │ │ │ │ │ │ │
 * * * * * * * *
 * ```
 */
export type cron = `${CronPart} `;
