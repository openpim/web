function getConfigCompoment () { return 'WBConfigCompoment' }
function getStandardAttributes () {
  return [
    {
      id: '#prodCountry',
      name: 'Страна производства',
      required: true,
      dictionary: false
    },
    {
      id: '#supplierCode',
      name: 'Артикул поставщика',
      required: true,
      dictionary: false
    }
  ]
}

export default {
  getConfigCompoment,
  getStandardAttributes
}
