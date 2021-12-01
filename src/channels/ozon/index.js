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
      id: '#vat',
      name: 'Ставка НДС',
      required: true,
      dictionary: false,
      description: '0 — не облагается НДС, 0.1 — 10%, 0.2 — 20%.'
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
  hasExecutions: true,
  hasItemSync: true,
  getConfigCompoment,
  getStandardAttributes
}
