import { DATE_FOR_SHEET, moment, TZ } from '../moment'
import { Mustache } from './mustache'

const sheetVars = {
  currDateSheet: () => moment().tz(TZ).format(DATE_FOR_SHEET),
}

const renderSheetValue = ({
  templateString,
  view = {},
}: {
  templateString: string
  view?: Record<string, any>
}) => Mustache.render(templateString, { ...sheetVars, ...view })

export { renderSheetValue }
