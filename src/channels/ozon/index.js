function getConfigCompoment () { return 'OzonConfigCompoment' }
function getStandardAttributes () {
  return [
    {
      id: '#barcode',
      name: 'Баркод',
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
