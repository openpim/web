import ExtFactory from './ext'
import WBFactory from './wb'

function getConfigCompoment () { return null }
function getStandardAttributes () { return null }
const empty = {
  getConfigCompoment,
  getStandardAttributes
}

export default function getChannelFactory (type) {
  switch (type) {
    case 1: return ExtFactory
    case 2: return WBFactory
    case 3: return empty
    default: return empty
  }
}
