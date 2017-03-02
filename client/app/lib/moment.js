import moment from 'moment-timezone';
import { timeZone } from 'lib/helpers/serverContext';

moment.tz.setDefault(timeZone);
export default moment;
