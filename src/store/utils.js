import * as err from './error'
import router from '../router'
import i18n from '../i18n'
import * as attrStore from './attributes'

export async function serverFetch (query, variables) {
  const req = { query: query }
  if (variables) req.variables = variables

  const serverUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_SERVER_URL : window.OPENPIM_SERVER_URL + '/graphql'

  const resp = await fetch(serverUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-token': localStorage.getItem('token')
    },
    body: JSON.stringify(req)
  })
  if (resp.ok) {
    const json = await resp.json()
    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors[0].message)
    }
    const data = json.data
    return data
  } else {
    const data = await resp.json()
    if (data.errors[0].message === 'Your session expired. Sign in again.') {
      err.store.showError(i18n.t('Login.Expired'))
      router.push('/login')
    } else {
      err.store.showError(data.errors[0].message)
      throw new Error(data.errors[0].message)
    }
  }
}

function findNode (id, children, path) {
  return findNodeByComparator(id, children, path, (id, item) => item.id === id)
}

function findNodeByComparator (id, children, path, comparator) {
  for (var i = 0; i < children.length; i++) {
    const item = children[i]
    if (comparator(id, item)) {
      return item
    } else if (item.children && item.children.length > 0) {
      const found = findNodeByComparator(id, item.children, path, comparator)
      if (found) {
        if (path) path.unshift(item.id)
        return found
      }
    }
  }
  return null
}

function removeNode (id, tree) {
  const path = []
  const node = findNode(id, tree, path)

  let arr
  if (path.length > 0) {
    const node = findNode(path[path.length - 1], tree)
    arr = node.children
  } else {
    arr = tree
  }

  const idx = arr.findIndex(item => item.id === id)
  arr = arr.splice(idx, 1)

  return node
}

function removeNodeByInternalId (internalId, tree) {
  const path = []
  const node = findNodeByComparator(internalId, tree, path, (id, item) => item.internalId === id)

  let arr
  if (path.length > 0) {
    const node = findNode(path[path.length - 1], tree)
    arr = node.children
  } else {
    arr = tree
  }

  const idx = arr.findIndex(item => item.internalId === internalId)
  if (idx !== -1) arr = arr.splice(idx, 1)

  return node
}

function objectToGraphgl (value) {
  // https://stackoverflow.com/questions/48614730/how-can-i-convert-the-object-array-to-graphql-format-in-javascript
  // return JSON.stringify(value).replace(/"([^(")"]+)":/g, '$1:')
  let result = ''
  if (Array.isArray(value)) {
    result += '['
    for (let i = 0; i < value.length; i++) {
      const elem = value[i]
      result += objectToGraphgl(elem)
      if (i !== value.length - 1) result += ','
    }
    result += '],'
  } else if (value !== null && typeof value === 'object') {
    result = '{'
    for (const prop in value) {
      const obj = value[prop]
      if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
        result += prop + ':' + objectToGraphgl(obj)
        result += ','
      } else if (Array.isArray(obj)) {
        result += prop + ':['
        for (let i = 0; i < obj.length; i++) {
          const elem2 = obj[i]
          result += objectToGraphgl(elem2)
          if (i !== obj.length - 1) result += ','
        }
        result += '],'
      } else if (Object.prototype.toString.call(obj) === '[object String]') {
        if (obj) {
          result += prop + ':"' + obj.replaceAll('"', '\\"').replaceAll('\n', '\\n').replaceAll('\t', '\\t') + '",'
        } else {
          const attr = attrStore.store.findByIdentifier(prop)
          if (attr && (attr.item.type === 3 || attr.item.type === 4)) { // set to null for Integer or Float attributes if we have "" as value
            result += prop + ': null,'
          } else {
            result += prop + ':"' + obj.replaceAll('"', '\\"').replaceAll('\n', '\\n').replaceAll('\t', '\\t') + '",'
          }
        }
      } else {
        result += prop + ':' + obj + ','
      }
    }
    result += '}'
  } else if (Object.prototype.toString.call(value) === '[object String]') {
    return value && value.length > 0 ? '"' + value + '"' : null
  } else {
    return value
  }
  return result
}

function generateSorting (options) {
  const order = []
  if (options.sortBy) {
    for (let i = 0; i < options.sortBy.length; i++) {
      const elem = options.sortBy[i]
      if (typeof elem === 'object') {
        const path = elem.path.reduce((accumulator, currentValue, index, arr) => accumulator + (index !== arr.length ? '.' : '') + currentValue)
        order.push([path, options.sortDesc[i] ? 'DESC' : 'ASC'])
      } else {
        order.push([elem, options.sortDesc[i] ? 'DESC' : 'ASC'])
      }
    }
  }
  return order
}

export { findNode, findNodeByComparator, removeNode, removeNodeByInternalId, objectToGraphgl, generateSorting }
