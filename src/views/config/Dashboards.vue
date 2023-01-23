<template>
  <v-container v-if="canViewConfigRef" style="background-color:white">
    <v-row no-gutters>
      <v-col cols="12">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ $t('Config.Dashboards.Title') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom v-if="canEditConfigRef">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="add"><v-icon>mdi-plus</v-icon></v-btn>
            </template>
            <span>{{ $t('Add') }}</span>
          </v-tooltip>
        </v-toolbar>
        <v-list nav dense style="max-height: 150px" class="overflow-y-auto">
          <v-list-item-group v-model="itemRef" color="primary">
            <v-list-item v-for="(item, i) in dashboards" :key="i">
              <v-list-item-icon><v-icon>mdi-view-dashboard-outline</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']'"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="12">
        <v-form ref="formRef" lazy-validation class="ml-7" v-if="selectedRef.id != -1">
          <div class="d-inline-flex align-center">
            <v-text-field style="min-width: 100%" v-model="selectedRef.identifier"  :disabled="selectedRef.internalId !== 0" :rules="identifierRules" :label="$t('Config.Dashboards.Identifier')" required></v-text-field>
            <SystemInformation :data="selectedRef"></SystemInformation>
          </div>

          <LanguageDependentField :values="selectedRef.name" v-model="selectedRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('Config.Dashboards.Name')"></LanguageDependentField>

          <v-textarea v-model="selectedRef.usersStr" :label="$t('Config.Dashboards.Users')" rows="2"></v-textarea>

          <v-container>
            <v-row no-gutters>
              <v-col cols="3">
                <v-toolbar dense flat>
                  <v-toolbar-title class="subtitle-2">{{ $t('Config.Dashboards.Components') }}</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="addComponent"><v-icon>mdi-plus</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Add') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="canEditConfigRef">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" :disabled="componentRef == null" @click="removeComponent"><v-icon>mdi-minus</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Remove') }}</span>
                  </v-tooltip>
                </v-toolbar>
                <v-list nav dense>
                  <v-list-item-group v-model="componentRef" color="primary">
                    <v-list-item v-for="(component, i) in selectedRef.components" :key="i">
                      <v-list-item-content>
                        <v-list-item-title>{{component.title}}</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-col>
              <v-col cols="9" v-if="selectedRef.components[componentRef]">
                <v-text-field v-model="selectedRef.components[componentRef].title" :label="$t('Config.Dashboards.Components.Title')" required></v-text-field>
                <v-text-field v-model="selectedRef.components[componentRef].width" type="number" :label="$t('Config.Dashboards.Components.Width')" required></v-text-field>

                <v-select v-model="selectedRef.components[componentRef].type" :items="typeSelection" :label="$t('Config.Dashboards.Components.Type')"></v-select>

                <template v-if="selectedRef.components[componentRef].type !== 3">
                  <v-select v-model="selectedRef.components[componentRef].chart" :items="chartSelection" :label="$t('Config.Dashboards.Components.ChartType')"></v-select>

                  <v-autocomplete v-if="selectedRef.components[componentRef].type === 1" v-model="selectedRef.components[componentRef].groupBy" :items="availableAttributes" :label="$t('Config.Dashboards.Components.Attribute')"></v-autocomplete>
                  <v-textarea v-if="selectedRef.components[componentRef].type === 1" v-model="selectedRef.components[componentRef].groupWhere" :label="$t('Config.Dashboards.Components.Where')" rows="3"></v-textarea>

                  <template v-if="selectedRef.components[componentRef].type === 2">
                    <v-toolbar dense flat>
                      <v-toolbar-title class="subtitle-2">{{ $t('Config.Dashboards.Components.Queries') }}</v-toolbar-title>
                      <v-spacer></v-spacer>
                      <v-tooltip bottom v-if="canEditConfigRef">
                        <template v-slot:activator="{ on }">
                          <v-btn icon v-on="on" @click="addQuery"><v-icon>mdi-plus</v-icon></v-btn>
                        </template>
                        <span>{{ $t('Add') }}</span>
                      </v-tooltip>
                      <v-tooltip bottom v-if="canEditConfigRef">
                        <template v-slot:activator="{ on }">
                          <v-btn icon v-on="on" :disabled="queryRef == null" @click="removeQuery"><v-icon>mdi-minus</v-icon></v-btn>
                        </template>
                        <span>{{ $t('Remove') }}</span>
                      </v-tooltip>
                    </v-toolbar>
                    <v-list nav dense>
                      <v-list-item-group v-model="queryRef" color="primary">
                        <v-list-item v-for="(query, i) in selectedRef.components[componentRef].queries" :key="i">
                          <v-list-item-content>
                            <v-list-item-title>{{(i+1) + ': ' + query.label}}</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list-item-group>
                    </v-list>
                    <template v-if="queryRef != null">
                      <v-text-field v-model="selectedRef.components[componentRef].queries[queryRef].label" :label="$t('Config.Dashboards.Components.Label')" required></v-text-field>
                      <v-textarea v-model="selectedRef.components[componentRef].queries[queryRef].where" :label="$t('Config.Dashboards.Components.Where')" rows="3"></v-textarea>
                    </template>
                  </template>
                </template>
                <template v-else>
                  <v-text-field v-model="selectedRef.components[componentRef].url" :label="$t('Config.Dashboards.Components.Url')" required></v-text-field>
                  <v-checkbox v-model="selectedRef.components[componentRef].passToken" :label="$t('Config.Dashboards.Components.PassToken')" required></v-checkbox>
                </template>
              </v-col>
            </v-row>
          </v-container>

          <v-btn class="mr-4" v-if="canEditConfigRef" @click="save">{{ $t('Save') }}</v-btn>
          <v-btn class="mr-4" v-if="canEditConfigRef" @click.stop="remove" :disabled="selectedRef.attributes && selectedRef.attributes.length > 0">{{ $t('Remove') }}</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, watch, onMounted } from '@vue/composition-api'
import * as langStore from '../../store/languages'
import * as dashStore from '../../store/dashboards'
import * as errorStore from '../../store/error'
import * as attrStore from '../../store/attributes'
import i18n from '../../i18n'
import LanguageDependentField from '../../components/LanguageDependentField'
import * as userStore from '../../store/users'
import SystemInformation from '../../components/SystemInformation'
import router from '../../router'

export default {
  components: { LanguageDependentField, SystemInformation },
  setup () {
    const { canViewConfig, canEditConfig } = userStore.useStore()
    const {
      showInfo
    } = errorStore.useStore()

    const {
      loadAllAttributes,
      getAllItemsAttributes2
    } = attrStore.useStore()

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadAllDashboards,
      dashboards,
      addDashboard,
      saveDashboard,
      removeDashboard
    } = dashStore.useStore()

    const canViewConfigRef = ref(false)
    const canEditConfigRef = ref(false)

    const empty = { id: -1 }
    const formRef = ref(null)
    const selectedRef = ref(empty)
    const itemRef = ref(null)
    const componentRef = ref(0)
    const availableAttributes = ref([])
    const queryRef = ref(null)

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        selectedRef.value = empty
        return
      }
      if (selected < dashboards.length) {
        if (previous && dashboards[previous].internalId === 0) {
          showInfo(i18n.t('Config.NotSaved'))
        }
        setSelected(dashboards[selected])
      }
    })

    function add () {
      selectedRef.value = addDashboard()
      itemRef.value = dashboards.length - 1
    }

    function save () {
      if (formRef.value.validate()) {
        saveDashboard(selectedRef.value).then(() => {
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function remove () {
      if (confirm(i18n.t('Config.Dashboards.Confirm.Delete', { name: selectedRef.value.name }))) {
        removeDashboard(selectedRef.value.id)
        selectedRef.value = empty
      }
    }

    function setSelected (dashboard) {
      selectedRef.value = dashboard
      if (dashboard.identifier) router.push('/config/dashboards/' + dashboard.identifier)
    }

    function addComponent () {
      selectedRef.value.components.push({ id: Date.now(), type: 0, title: i18n.t('Config.Dashboards.Components.TitleNew'), width: 0, chart: 0, groupBy: '', groupWhere: '', queries: [] })
      componentRef.value = selectedRef.value.components.length - 1
    }

    function removeComponent () {
      if (confirm(i18n.t('Config.Dashboards.Components.ConfirmRemove'))) {
        selectedRef.value.components.splice(componentRef.value, 1)
        componentRef.value = null
      }
    }

    function addQuery () {
      const arr = selectedRef.value.components[componentRef.value].queries
      arr.push({ label: '', where: '' })
      queryRef.value = arr.length - 1
    }

    function removeQuery () {
      if (confirm(i18n.t('Config.Dashboards.Components.QueryConfirmRemove'))) {
        selectedRef.value.components[componentRef.value].queries.splice(queryRef.value, 1)
        queryRef.value = null
      }
    }

    onMounted(() => {
      canViewConfigRef.value = canViewConfig('dashboards')
      canEditConfigRef.value = canEditConfig('dashboards')
      loadAllDashboards().then(() => {
        loadAllAttributes().then(() => { loadAvailableAttributes() })

        const id = router.currentRoute.params.id
        if (id) {
          const idx = dashboards.findIndex(elem => elem.identifier === id)
          if (idx !== -1) {
            itemRef.value = idx
            setSelected(dashboards[idx])
          } else {
            router.push('/config/dashboards')
          }
        }
      })
    })

    function loadAvailableAttributes () {
      const arr = [
        { value: 'id', text: i18n.t('Item.id') },
        { value: 'identifier', text: i18n.t('Item.identifier') },
        { value: 'typeIdentifier', text: i18n.t('Item.typeIdentifier') },
        { value: 'createdBy', text: i18n.t('CreatedBy') },
        { value: 'createdAt', text: i18n.t('CreatedAt') },
        { value: 'updatedBy', text: i18n.t('UpdatedBy') },
        { value: 'updatedAt', text: i18n.t('UpdatedAt') },
        { value: 'fileOrigName', text: i18n.t('Item.fileOrigName') },
        { value: 'mimeType', text: i18n.t('Item.mimeType') }
      ]
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i]
        const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
        arr.push({ value: 'name#' + lang.identifier, text: i18n.t('Item.name') + langText })
      }
      const attrs = getAllItemsAttributes2(false)
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i]
        const nameText = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
        if (attr.languageDependent) {
          for (let i = 0; i < languages.length; i++) {
            const lang = languages[i]
            const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
            arr.push({ value: 'attr#' + attr.identifier + '#' + lang.identifier, text: attr.identifier + ' - ' + nameText + langText })
          }
        } else {
          arr.push({ value: 'attr#' + attr.identifier, text: attr.identifier + ' - ' + nameText })
        }
      }

      availableAttributes.value = arr
    }

    function identifierValidation (v) {
      if (!v) {
        return i18n.t('Config.Dashboards.Error.IdentifierRequired')
      }
      if (!/^[A-Za-z0-9_-]*$/.test(v)) {
        return i18n.t('Wrong.Identifier')
      }
      if (v && selectedRef.value.internalId === 0) {
        const found = dashboards.find((lang) => lang.identifier === v)
        if (found && found.internalId !== 0) {
          return i18n.t('Config.Dashboards.Error.IdentifierNotUnique')
        }
      }
      return true
    }

    return {
      canViewConfigRef,
      canEditConfigRef,
      addComponent,
      componentRef,
      removeComponent,
      availableAttributes,
      queryRef,
      addQuery,
      removeQuery,
      formRef,
      dashboards,
      selectedRef,
      itemRef,
      add,
      remove,
      save,
      currentLanguage,
      defaultLanguageIdentifier,
      identifierRules: [
        v => identifierValidation(v)
      ],
      nameRules: [
        v => !!v || i18n.t('Config.Dashboards.Error.NameRequired')
      ],
      typeSelection: [
        { text: i18n.t('Config.Dashboards.Components.Type.Group'), value: 1 },
        { text: i18n.t('Config.Dashboards.Components.Type.List'), value: 2 },
        { text: i18n.t('Config.Dashboards.Components.Type.IFrame'), value: 3 }
      ],
      chartSelection: [
        { text: i18n.t('Config.Dashboards.Components.Chart.Bar'), value: 1 },
        { text: i18n.t('Config.Dashboards.Components.Chart.HorizontalBar'), value: 2 },
        { text: i18n.t('Config.Dashboards.Components.Chart.Doughnut'), value: 3 },
        { text: i18n.t('Config.Dashboards.Components.Chart.Pie'), value: 4 }
      ]
    }
  }
}
</script>
