import ExtFactory from './ext'
import WBFactory from './wb'
import OzonFactory from './ozon'
import YMFactory from './ym'
import ExtMapFactory from './extmap'
import MDMFactory from './mdm'
import XLSTemplFactory from './xlsTemplate'

function getConfigCompoment () { return null }
function getStandardAttributes () { return null }
const empty = {
  hasSync: false,
  hasExecutions: false,
  hasItemSync: false,
  canManageAttributes: false,
  getConfigCompoment,
  getStandardAttributes
}

export default function getChannelFactory (type) {
  switch (type) {
    case 1: return ExtFactory
    case 2: return WBFactory
    case 3: return OzonFactory
    case 4: return YMFactory
    case 5: return ExtMapFactory
    case 6: return MDMFactory
    case 7: return XLSTemplFactory
    default: return empty
  }
}
