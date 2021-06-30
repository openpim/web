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
    },
    {
      id: '#barcode',
      name: 'Баркод',
      required: true,
      dictionary: false
    },
    {
      id: '#price',
      name: 'Цена',
      required: true,
      dictionary: false
    }
  ]
}

export default {
  hasExecutions: () => true,
  getConfigCompoment,
  getStandardAttributes
}
