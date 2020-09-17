<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <v-select v-if="dashboardsSelection.length > 1" v-model="selectedRef" :items="dashboardsSelection" :label="$t('Dashboards.Select')"></v-select>
      </v-col>
      <v-col cols="12" v-if="selectedRef">
        <v-container v-if="selectedDashboardRef && selectedDashboardRef.components">
          <v-row no-gutters>
            <v-col v-for="(elem,i) in selectedDashboardRef.components" :key="i" :cols="elem.width">
              <DashboardComponent :dashboard="selectedDashboardRef" :component="elem" :key="Date.now()"></DashboardComponent>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, watch, onMounted } from '@vue/composition-api'
import * as langStore from '../store/languages'
import * as dashStore from '../store/dashboards'
import DashboardComponent from '../components/DashboardComponent'

export default {
  components: { DashboardComponent },
  setup () {
    const {
      loadAllLanguages,
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadAllDashboards,
      getDashboardsForCurrentUser
    } = dashStore.useStore()

    const selectedRef = ref(null)
    const dashboardsSelection = ref([])
    const myDashboards = ref([])
    const selectedDashboardRef = ref(null)

    watch(selectedRef, (selected, previous) => {
      if (selected) {
        selectedDashboardRef.value = myDashboards.value.find(dash => dash.id === selected)
        localStorage.setItem('last_dashboard', selected)
      }
    })

    onMounted(() => {
      loadAllLanguages()
      loadAllDashboards().then(() => {
        myDashboards.value = getDashboardsForCurrentUser()
        dashboardsSelection.value = myDashboards.value.map(elem => {
          return {
            value: elem.id,
            text: elem.name[currentLanguage.value.identifier] || '[' + elem.name[defaultLanguageIdentifier.value] + ']'
          }
        })

        if (myDashboards.value.length > 0) {
          const tst = localStorage.getItem('last_dashboard')
          if (tst && myDashboards.value.find(dash => dash.id === tst)) {
            selectedRef.value = tst
          } else {
            selectedRef.value = myDashboards.value[0].id
          }
        }
      })
    })

    return {
      currentLanguage,
      defaultLanguageIdentifier,
      selectedRef,
      dashboardsSelection,
      selectedDashboardRef
    }
  }
}
</script>
