function getConfigCompoment () { return 'OzonConfigCompoment' }
function getStandardAttributes () {
  return [
    {
      id: '#productCode',
      name: 'Артикул товара (строка)',
      required: true,
      dictionary: false
    },
    {
      id: '#name',
      name: 'Название товара. (строка)',
      required: true,
      dictionary: false,
      description: 'Название товара. До 500 символов..'
    },
    {
      id: '#vat',
      name: 'Ставка НДС (число)',
      required: true,
      dictionary: false,
      description: '0 — не облагается НДС, 0.1 — 10%, 0.2 — 20%.'
    },
    {
      id: '#barcode',
      name: 'Баркод (строка)',
      required: true,
      dictionary: false
    },
    {
      id: '#price',
      name: 'Цена (строка)',
      required: true,
      dictionary: false
    },
    {
      id: '#weight',
      name: 'Вес с упаковкой, г (число)',
      required: true,
      dictionary: false
    },
    {
      id: '#depth',
      name: 'Длина упаковки, мм (число)',
      required: true,
      dictionary: false
    },
    {
      id: '#width',
      name: 'Ширина упаковки, мм (число)',
      required: true,
      dictionary: false
    },
    {
      id: '#height',
      name: 'Высота упаковки, мм (число)',
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
