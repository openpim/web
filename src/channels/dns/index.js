function getConfigCompoment () { return 'DnsConfigCompoment' }
function getStandardAttributes () {
  return [
    { id: '#name', name: 'Наименование товара (Text)', required: true, dictionary: false, description: 'Наименование товара.' },
    { id: '#salePrice', name: 'Цена продажи в минорных единицах (Integer)', required: true, dictionary: false, description: 'Цена продажи в минорных единицах (например, копейках). Значение передаётся без конвертации.' },
    { id: '#mpn', name: 'Артикул производителя (Text)', required: true, dictionary: false, description: 'Артикул производителя (MPN).' },
    { id: '#article', name: 'Артикул продавца (Text)', required: true, dictionary: false, description: 'Артикул продавца в его учётной системе.' },
    { id: '#manufacturerBarcode', name: 'Штрихкод производителя (Text)', required: true, dictionary: false, description: 'Штрихкод производителя, определяющий товар внутри организации.' },
    { id: '#warrantyMonths', name: 'Срок гарантии, месяцев (Integer)', required: true, dictionary: false, description: 'Срок гарантии в месяцах.' },
    { id: '#packageLengthCm', name: 'Длина упаковки, см (Decimal)', required: true, dictionary: false, description: 'Длина упаковки в сантиметрах: десятичное число с точкой.' },
    { id: '#packageWidthCm', name: 'Ширина упаковки, см (Decimal)', required: true, dictionary: false, description: 'Ширина упаковки в сантиметрах: десятичное число с точкой.' },
    { id: '#packageHeightCm', name: 'Высота упаковки, см (Decimal)', required: true, dictionary: false, description: 'Высота упаковки в сантиметрах: десятичное число с точкой.' },
    { id: '#netWeightKg', name: 'Масса нетто, кг (Decimal)', required: true, dictionary: false, description: 'Масса нетто в килограммах: десятичное число с точкой.' },
    { id: '#tnvedCode', name: 'Код ТН ВЭД (Text)', required: true, dictionary: false, description: 'Код ТН ВЭД.' },
    { id: '#okpd2Code', name: 'Код ОКПД2 (Text)', required: true, dictionary: false, description: 'Код ОКПД2.' },
    { id: '#mainPhotoUrl', name: 'Ссылка на основную фотографию (Text)', required: true, dictionary: false, description: 'Ссылка на основную фотографию товара.' },
    { id: '#description', name: 'Описание товара (Text)', required: false, dictionary: false, description: 'Описание товара.' },
    { id: '#shelfLifeMonths', name: 'Срок годности, месяцев (Integer)', required: false, dictionary: false, description: 'Срок годности в месяцах.' },
    { id: '#photoUrls', name: 'Ссылки на дополнительные фото (Text[])', required: false, dictionary: false, description: 'Ссылки на дополнительные фотографии товара.' },
    { id: '#richPhotoUrls', name: 'Ссылки на фото для рич-контента (Text[])', required: false, dictionary: false, description: 'Ссылки на фотографии для рич-контента.' },
    { id: '#certificateNumber', name: 'Номер сертификата соответствия (Text)', required: false, dictionary: false, description: 'Номер сертификата соответствия.' },
    { id: '#certificateStartDate', name: 'Первый день действия сертификата (Text)', required: false, dictionary: false, description: 'Первый день действия сертификата.' },
    { id: '#certificateEndDate', name: 'Последний день действия сертификата (Text)', required: false, dictionary: false, description: 'Последний день действия сертификата.' },
    { id: '#certificateUrl', name: 'Ссылка на сертификат соответствия (Text)', required: false, dictionary: false, description: 'Ссылка на сертификат соответствия.' }
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
