import CSVFactory from './csv'
import XLSFactory from './xls'
import YandexXMLFactory from './yandex'

function getConfigCompoment () { return null }
function getStandardAttributes () { return null }

const empty = {
  getConfigCompoment,
  getStandardAttributes
}

export default function getImportConfigFactory (type) {
  switch (type) {
    case 1: return CSVFactory
    case 2: return XLSFactory
    case 3: return YandexXMLFactory
    default: return empty
  }
}
