import additionalAttrTypesList from '../_customizations/attributes/additionalTypes.js'

const attrTypes = {
  Text: 1,
  Boolean: 2,
  Integer: 3,
  Float: 4,
  Date: 5,
  Time: 6,
  LOV: 7,
  URL: 8,
  Relation: 9
}

if (additionalAttrTypesList) {
  for (let i = 0; i < additionalAttrTypesList.length; i++) {
    const addType = additionalAttrTypesList[i]
    attrTypes[addType.name] = addType.value
  }
}

export default attrTypes
