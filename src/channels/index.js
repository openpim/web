import ExtFactory from './ext'
import WBFactory from './wb'
import OzonFactory from './ozon'
import YMFactory from './ym'

function getConfigCompoment () { return null }
function getStandardAttributes () { return null }
const empty = {
  hasSync: false,
  hasExecutions: false,
  hasItemSync: false,
  getConfigCompoment,
  getStandardAttributes
}

export default function getChannelFactory (type) {
  switch (type) {
    case 1: return ExtFactory
    case 2: return WBFactory
    case 3: return OzonFactory
    case 4: return YMFactory
    default: return empty
  }
}
