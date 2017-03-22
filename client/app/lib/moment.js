import moment from 'moment-timezone';
import { timeZone } from 'lib/helpers/server-context';

moment.tz.setDefault(timeZone);
export default moment;
