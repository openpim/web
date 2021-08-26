function getConfigCompoment () { return 'OzonConfigCompoment' }
function getStandardAttributes () {
  return [
    {
      id: '#productCode',
      name: 'Артикул товара',
      required: true,
      dictionary: false
    },
    {
      id: '#name',
      name: 'Наименование',
      required: false,
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
    },
    {
      id: '#weight',
      name: 'Вес с упаковкой, г',
      required: true,
      dictionary: false
    },
    {
      id: '#depth',
      name: 'Длина упаковки, мм',
      required: true,
      dictionary: false
    },
    {
      id: '#width',
      name: 'Ширина упаковки, мм',
      required: true,
      dictionary: false
    },
    {
      id: '#height',
      name: 'Высота упаковки, мм',
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
