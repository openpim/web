import ExtFactory from './ext'
import WBFactory from './wb'
import OzonFactory from './ozon'

function getConfigCompoment () { return null }
function getStandardAttributes () { return null }
const empty = {
  hasExecutions: () => false,
  getConfigCompoment,
  getStandardAttributes
}

export default function getChannelFactory (type) {
  switch (type) {
    case 1: return ExtFactory
    case 2: return WBFactory
    case 3: return OzonFactory
    default: return empty
  }
}
