function getConfigCompoment () { return 'WBConfigCompoment' }
function getStandardAttributes () {
  return [
    {
      id: '#productCode',
      name: 'Артикул товара',
      required: true,
      dictionary: false
    },
    {
      id: '#price',
      name: 'Цена',
      required: true,
      dictionary: false
    },
    {
      id: '#barcode',
      name: 'Штрихкод',
      required: true,
      dictionary: false
    },
    {
      id: '#techSize',
      name: 'Размер поставщика (пример S, M, L, XL, 42, 42-43)',
      required: false,
      dictionary: false
    },
    {
      id: '#wbSize',
      name: 'Рос. размер',
      required: false,
      dictionary: false
    },
    {
      id: '#images',
      name: 'Изображения (массив ссылок)',
      required: false,
      dictionary: false
    }
  ]
}

export default {
  hasSync: true,
  hasExecutions: true,
  hasItemSync: true,
  canManageAttributes: true,
  getConfigCompoment,
  getStandardAttributes
}
