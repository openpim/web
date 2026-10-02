const fields = [
  ['offerId', 'Артикул продавца', false, 'Если не задан, используется атрибут offerId из настроек канала или identifier товара. До 250 символов.'],
  ['name', 'Наименование', true, 'До 249 символов.'],
  ['brand', 'Бренд', true, 'До 250 символов.'],
  ['model', 'Модель', false, 'До 250 символов.'],
  ['vendorCode', 'Артикул производителя', false, 'До 35 символов.'],
  ['color', 'Цвет', false, 'До 50 символов.'],
  ['generateBarcodes', 'Генерировать штрихкоды', false, 'Да/Нет или Boolean.'],
  ['barcodes', 'Штрихкоды (Text[])', false, 'До 3 штрихкодов, каждый из 13 цифр.'],
  ['manufacturerCountries', 'Страна производства (Text[])', false, 'Массив с одной страной.'],
  ['warrantyPeriod', 'Гарантия (Object)', false, 'Объект согласно OpenAPI: {timePeriod: "12", timeUnit: "MONTH"}. Допустимы MONTH и YEAR.'],
  ['weightDimensions', 'Габариты и вес упаковки (Object)', false, 'Объект согласно OpenAPI: {length: "10", width: "20", height: "30", weight: "1.5"}. Габариты в см, вес в кг.'],
  ['isVerticalOnly', 'Размещать только вертикально', false, 'Да/Нет или Boolean.'],
  ['isFragile', 'Хрупкий груз', false, 'Да/Нет или Boolean.'],
  ['vat', 'Ставка НДС (Number)', false, 'Допустимы 0, 5, 7, 10, 22.'],
  ['tnvedCode', 'Код ТНВЭД', false, 'До 10 цифр.'],
  ['okpd2Code', 'Код ОКПД-2', false, 'Код ОКПД-2.'],
  ['marking', 'Маркируемый товар', false, 'Да/Нет или Boolean.'],
  ['fireHazardClass', 'Класс пожароопасности', false, '4, 5, 6, 7, 8, 9 или Нет.'],
  ['description', 'Описание', false, 'До 1500 символов.'],
  ['deliveryScheme', 'Схемы поставки (Text[])', false, 'Массив из FBS, FBM, DBS.'],
  ['pictures', 'Ссылки на фото (Text[])', false, 'До 15 ссылок HTTP(S). Первая фотография основная.'],
  ['manuals', 'Ссылки на инструкции (Text[])', false, 'До 5 ссылок HTTP(S) на PDF.']
]

export default {
  hasSync: true,
  hasExecutions: true,
  hasItemSync: true,
  canManageAttributes: true,
  getConfigCompoment: () => 'MVideoConfigComponent',
  getStandardAttributes: () => fields.map(([field, name, required, description]) => ({
    id: '#' + field, name, required, description, dictionary: false
  }))
}
