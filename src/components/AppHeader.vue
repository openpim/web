<template>
  <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app color="primary" dark dense>
    <v-app-bar-nav-icon @click.stop="triggerDrawer" v-if="currentUserRef.tenantId !== '0'"/>
    <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
      <TitleComponent></TitleComponent>
    </v-toolbar-title>
    <v-spacer />
    <AppHeaderSearch :export="isExportSearch" v-if="drawer" />
    <AfterSearchComponent></AfterSearchComponent>
    <v-menu ref="menuRef" offset-y v-if="languages.length > 1">
      <template v-slot:activator="{ on }">
        <v-btn class="mr-2" dark text v-on="on">
          {{ currentLanguage ? currentLanguage.identifier : '' }}
        </v-btn>
      </template>
      <v-list>
        <v-list-item v-for="(lang, index) in languages" :key="index" @click="languageSelected(lang.identifier)">
          <v-list-item-title>{{ lang.name[currentLanguage.identifier] || lang.name[defaultLanguageIdentifier] }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn icon @click="triggerDrawerRight"><v-icon>mdi-alpha-p-circle-outline</v-icon></v-btn>
    <v-btn icon @click="triggerUserDialog"><v-icon>mdi-account</v-icon></v-btn>
    <AfterButtonsComponent></AfterButtonsComponent>
  </v-app-bar>
</template>

<script>
import { onMounted, ref } from '@vue/composition-api'

import * as langStore from '../store/languages'
import * as userStore from '../store/users'

import AppHeaderSearch from '../components/AppHeaderSearch.vue'
import TitleComponent from '../_customizations/toolbar/title/TitleComponent'
import AfterSearchComponent from '../_customizations/toolbar/afterSearch/AfterSearchComponent'
import AfterButtonsComponent from '../_customizations/toolbar/afterButtons/AfterButtonsComponent'
import eventBus from '../eventBus'

export default {
  components: { AppHeaderSearch, TitleComponent, AfterSearchComponent, AfterButtonsComponent },
  props: {
    export: {
      type: Boolean,
      required: true
    },
    drawer: {
      required: true
    },
    drawerRight: {
      required: true
    }
  },
  setup (props) {
    const {
      currentUserRef
    } = userStore.useStore()

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
    } = langStore.useStore()

    const menuRef = ref(null)

    onMounted(async () => {
      await loadAllLanguages()
      const tst = localStorage.getItem('lang')
      if (tst) languageSelected(tst)
    })

    function triggerDrawer () {
      eventBus.emit('drawer_triggered', !props.drawer)
    }

    function triggerDrawerRight () {
      eventBus.emit('drawer_triggered_right', !props.drawerRight)
    }

    function triggerUserDialog () {
      eventBus.emit('userDialogRef_triggered', true)
    }

    function languageSelected (identifier) {
      currentLanguage.value = languages.find(lang => lang.identifier === identifier)
      localStorage.setItem('lang', identifier)
    }

    return {
      currentUserRef,
      languages,
      currentLanguage,
      defaultLanguageIdentifier,
      languageSelected,
      triggerDrawer,
      triggerDrawerRight,
      triggerUserDialog,
      menuRef,
      isExportSearch: props.export
    }
  }
}
</script>
