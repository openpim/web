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
      name: 'Название товара (строка)',
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
      required: false,
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
    },
    {
      id: '#videoUrls',
      name: 'Ссылки на видео (массив)',
      required: false,
      dictionary: false
    },
    {
      id: '#videoNames',
      name: 'Названия видео (массив)',
      required: false,
      dictionary: false
    },
    {
      id: '#images360Urls',
      name: 'Ссылки на изображения 360 (массив)',
      required: false,
      dictionary: false
    },
    {
      id: '#oldprice',
      name: 'Цена до скидок (будет зачёркнута на карточке товара) (строка)',
      required: false,
      dictionary: false
    },
    {
      id: '#premprice',
      name: 'Цена для клиентов с подпиской Ozon Premium (строка)',
      required: false,
      dictionary: false
    },
    {
      id: '#color_image',
      name: 'Маркетинговый цвет (ссылка)',
      required: false,
      dictionary: false
    },
    {
      id: '#images',
      name: 'Дополнительные изображения. (массив)',
      required: false,
      dictionary: false
    },
    {
      id: '#category',
      name: 'Текущий идентификатор категории - description_category_id. Укажите его, если нужно изменить идентификатор категории который ставит система. (integer)',
      required: false,
      dictionary: false
    },
    {
      id: '#new_category',
      name: 'Новый идентификатор категории - new_description_category_id. Укажите его, если нужно изменить текущую категорию товара. (integer)',
      required: false,
      dictionary: false
    },
    {
      id: '#image_links_other',
      name: 'Ссылки на изображения (нестрандартные) (массив)',
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
