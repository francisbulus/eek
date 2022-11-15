import { DATE_FOR_TAB_NAME, moment, TZ } from '../moment'
import { Mustache } from './mustache'

/**
 * Add functions here to replace mustache vars in tab names
 * For example: '{{ currDate }} - Indeed' => '11172020 - Indeed'
 */
const tabNameVars = {
  currDate: () => moment().tz(TZ).format(DATE_FOR_TAB_NAME),
}

const renderTabName = ({ tabName, view = {} }: { tabName: string; view?: Record<string, any> }) =>
  Mustache.render(tabName, { ...tabNameVars, ...view })

export { renderTabName }
