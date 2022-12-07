<template>
  <v-app-bar :clipped-left="display.lgAndUp" app color="primary" dark dense>
    <v-app-bar-nav-icon @click.stop="triggerDrawer" v-if="currentUserRef.tenantId !== '0'"/>
    <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
      <TitleComponent></TitleComponent>
    </v-toolbar-title>
    <v-spacer />
    <AppHeaderSearch :export="isExportSearch" />
    <AfterSearchComponent></AfterSearchComponent>
    <v-menu offset-y v-if="languages.length > 1">
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
    <v-btn icon @click="triggerUserDialog"><v-icon>mdi-account</v-icon></v-btn>
    <AfterButtonsComponent></AfterButtonsComponent>
  </v-app-bar>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'

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
    }
  },
  setup (props) {
    const {
      currentUserRef
    } = userStore.useStore()

    const display = ref(useDisplay())

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
    } = langStore.useStore()

    onMounted(() => {
      loadAllLanguages()
    })

    function triggerDrawer () {
      eventBus.emit('drawer_triggered', !props.drawer)
    }

    function triggerUserDialog () {
      eventBus.emit('userDialogRef_triggered', true)
    }

    function languageSelected (identifier) {
      currentLanguage.value = languages.find(lang => lang.identifier === identifier)
    }

    return {
      currentUserRef,
      languages,
      currentLanguage,
      defaultLanguageIdentifier,
      languageSelected,
      triggerDrawer,
      triggerUserDialog,
      isExportSearch: props.export,
      display
    }
  }
}
</script>
