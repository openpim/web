import * as userStore from './users'
import * as errorStore from './error'
import * as typesStore from './types'
import * as attrStore from './attributes'
import * as relStore from './relations'
import * as itemStore from './item'
import * as langStore from './languages'
import * as itemRelStore from './itemRelations'
import * as roleStore from './roles'
import * as lovStore from './lovs'
import * as searchStore from './search'
import * as actionsStore from './actions'
import * as dashStore from './dashboards'
import * as auditStore from './audit'
import * as channelsStore from './channels'
import * as procStore from './processes'
import * as collectionsStore from './collections'
import * as importConfigsStore from './importConfigs'
import * as authStore from './auth'
import * as remotePIMInstanceStore from './remotePIMInstance'
import * as tempStore from './templates'

export default () => {
  errorStore.provideStore()
  userStore.provideStore()
  typesStore.provideStore()
  attrStore.provideStore()
  relStore.provideStore()
  itemStore.provideStore()
  langStore.provideStore()
  itemRelStore.provideStore()
  roleStore.provideStore()
  lovStore.provideStore()
  searchStore.provideStore()
  actionsStore.provideStore()
  dashStore.provideStore()
  auditStore.provideStore()
  channelsStore.provideStore()
  procStore.provideStore()
  collectionsStore.provideStore()
  importConfigsStore.provideStore()
  authStore.provideStore()
  remotePIMInstanceStore.provideStore()
  tempStore.provideStore()
}
