function getConfigCompoment () { return 'MDMConfigCompoment' }
function getStandardAttributes () {
  return [
    /* {
      id: '#productCode',
      name: 'Артикул товара (строка)',
      required: true,
      dictionary: false
    } */
  ]
}

export default {
  hasSync: false,
  hasExecutions: true,
  hasItemSync: false,
  canManageAttributes: true,
  getConfigCompoment,
  getStandardAttributes
}
