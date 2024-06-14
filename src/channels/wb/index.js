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
      id: '#title',
      name: 'Наименование товара',
      required: false,
      dictionary: false
    },
    {
      id: '#description',
      name: 'Описание товара',
      required: false,
      dictionary: false,
      description: 'Описание товара. Максимальное количество символов зависит от категории товара. Стандарт — 2000, минимум — 1000, максимум — 5000.'
    },
    {
      id: '#brand',
      name: 'Бренд',
      required: false,
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
      id: '#length',
      name: 'Длина (см.)',
      required: false,
      dictionary: false
    },
    {
      id: '#width',
      name: 'Ширина (см.)',
      required: false,
      dictionary: false
    },
    {
      id: '#height',
      name: 'Высота (см.)',
      required: false,
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
