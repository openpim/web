<template>
  <div>
    <ErrorBox />
    <v-navigation-drawer :width="drawerWidth" v-model="drawer" ref="drawerRef" :clipped="$vuetify.breakpoint.lgAndUp" app v-if="currentUserRef.tenantId !== '0'">
      <router-view name="menu"></router-view>

      <v-bottom-navigation grow height="50" class="mt-2" v-model="activeBottom" v-if="!isExportSearch">
        <v-btn to="/">
            <span>{{ $t('Main.Work') }}</span>
            <v-icon>mdi-sitemap</v-icon>
        </v-btn>
        <v-btn to="/search" v-if="hasAccess('search')">
            <span>{{ $t('Main.Search') }}</span>
            <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-btn to="/config/home" v-if="hasConfigRef">
            <span>{{ $t('Main.Settings') }}</span>
            <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
      </v-bottom-navigation>
    </v-navigation-drawer>

    <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app color="blue darken-3" dark dense>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="currentUserRef.tenantId !== '0'"/>
      <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
        <TitleComponent></TitleComponent>
      </v-toolbar-title>
      <v-spacer />
      <v-autocomplete v-if="currentUserRef.tenantId !== '0' && !isExportSearch" @input="searchSelected" @focus="searchResultsRef=[]" item-value="identifier" v-model="searchTextRef" :loading="searchLoadingRef" :items="searchResultsRef" :search-input.sync="searchRef" class="mr-2 hidden-sm-and-down" flat solo-inverted hide-no-data hide-details prepend-inner-icon="mdi-magnify" :label="$t('Search')">
        <template v-slot:item="{ item }">
          <v-list-item-content>
            <v-list-item-title><router-link :to="'/item/'+item.identifier">{{item.identifier + ' (' +item.type.identifier+')'}}</router-link></v-list-item-title>
            <v-list-item-subtitle>{{ item.name[currentLanguage.identifier] || '[' + item.name[defaultLanguageIdentifier] + ']' }}</v-list-item-subtitle>
          </v-list-item-content>
        </template>
      </v-autocomplete>
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
      <v-btn icon @click="userDialogRef = true"><v-icon>mdi-account</v-icon></v-btn>
      <AfterButtonsComponent></AfterButtonsComponent>
    </v-app-bar>
    <v-content>
      <v-container class="fill-height" fluid>
        <router-view :export="isExportSearch"></router-view>
      </v-container>
    </v-content>
    <v-dialog v-model="userDialogRef" persistent max-width="600px">
      <v-card v-if="currentUserRef">
        <v-card-title>
          <span class="headline">{{ $t('User.Details') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-form ref="formRef" lazy-validation>
                  <v-text-field v-model="currentUserRef.login" disabled :label="$t('Config.Users.Login')" required></v-text-field>
                  <v-text-field v-model="currentUserRef.name" :label="$t('Config.Users.Name')" :rules="nameRules" required></v-text-field>
                  <v-text-field v-model="currentUserRef.email" :label="$t('Config.Users.Email')" required></v-text-field>
                  <v-text-field v-if="currentUserRef.login !== 'demo'" type="password" :error-messages="passwordErrors" v-model="currentUserRef.password1" :label="$t('Config.Users.Password1')" required></v-text-field>
                  <v-text-field v-if="currentUserRef.login !== 'demo'" type="password" :error-messages="passwordErrors" v-model="currentUserRef.password2" :label="$t('Config.Users.Password2')" required></v-text-field>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="logout">{{ $t('Config.Users.Exit') }}</v-btn>
          <v-btn v-if="isAdmin()" color="blue darken-1" text @click="reload">{{ $t('Config.Users.ReloadModel') }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="userDialogRef = false">{{ $t('Close') }}</v-btn>
          <v-btn color="blue darken-1" text @click="save" v-if="currentUserRef.login !== 'demo'">{{ $t('Save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch } from '@vue/composition-api'
import ErrorBox from '../components/ErrorBox'
import * as langStore from '../store/languages'
import * as userStore from '../store/users'
import * as itemStore from '../store/item'
import * as errorStore from '../store/error'
import i18n from '../i18n'
import router from '../router'
import TitleComponent from '../_customizations/toolbar/title/TitleComponent'
import AfterSearchComponent from '../_customizations/toolbar/afterSearch/AfterSearchComponent'
import AfterButtonsComponent from '../_customizations/toolbar/afterButtons/AfterButtonsComponent'

export default {
  components: { ErrorBox, TitleComponent, AfterSearchComponent, AfterButtonsComponent },
  props: {
    export: {
      type: Boolean,
      required: true
    }
  },
  setup (props) {
    const {
      showInfo
    } = errorStore.useStore()

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
    } = langStore.useStore()

    const {
      currentUserRef,
      saveUser,
      canViewConfig,
      reloadModel,
      isAdmin,
      hasAccess
    } = userStore.useStore()

    const {
      searchItem
    } = itemStore.useStore()

    const drawer = ref(null)
    const drawerRef = ref(null)
    const drawerWidth = ref(localStorage.getItem('drawerWidth') || '25%')
    const activeBottom = ref(0)
    const userDialogRef = ref(null)
    const passwordErrors = ref([])
    const formRef = ref(null)
    const hasConfigRef = ref(false)

    const searchTextRef = ref('')
    const searchResultsRef = ref([])
    const searchRef = ref('')
    const searchLoadingRef = ref(false)
    let awaitingSearch = false

    watch(searchRef, (val) => {
      if (val && val.length > 1) {
        if (!awaitingSearch) {
          setTimeout(() => {
            searchLoadingRef.value = true
            searchItem(val).then(data => {
              searchResultsRef.value = data.rows.map(elem => {
                elem.text = elem.identifier + ' (' + elem.name[currentLanguage.value.identifier].replaceAll('\\', '\\\\') + ')'
                return elem
              })
              searchLoadingRef.value = false
            })
            awaitingSearch = false
          }, 1000)
        }
        awaitingSearch = true
      }
    })

    function searchSelected () {
      awaitingSearch = true
      setTimeout(() => {
        awaitingSearch = false
        searchTextRef.value = null
      }, 500)
      const identifier = searchTextRef.value
      searchTextRef.value = null
      router.push('/item/' + identifier)
    }

    function languageSelected (identifier) {
      currentLanguage.value = languages.find(lang => lang.identifier === identifier)
    }

    function reload () {
      reloadModel().then(() => logout())
    }

    function logout () {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push(props.export ? '/export_login' : '/login')
      location.reload()
    }

    function save () {
      if (formRef.value.validate()) {
        if ((currentUserRef.value.password1 || currentUserRef.value.password2) && currentUserRef.value.password1 !== currentUserRef.value.password2) {
          passwordErrors.value = [i18n.t('Config.Users.Error.PasswordsNotEquals')]
          return
        }
        userDialogRef.value = false
        passwordErrors.value = []
        saveUser(currentUserRef.value).then(() => {
          localStorage.setItem('user', JSON.stringify(currentUserRef.value))
          currentUserRef.value.password1 = ''
          currentUserRef.value.password2 = ''
          showInfo(i18n.t('Saved'))
        })
      }
    }

    function setBorderWidth () {
      const i = drawerRef.value.$el.querySelector(
        '.v-navigation-drawer__border'
      )
      i.style.width = '3px'
      i.style.cursor = 'ew-resize'
    }

    function setResizeEvents () {
      const el = drawerRef.value.$el
      const drawerBorder = el.querySelector('.v-navigation-drawer__border')
      const direction = el.classList.contains('v-navigation-drawer--right')
        ? 'right'
        : 'left'

      function resize (e) {
        if (e.screenX < 30) return

        document.body.style.cursor = 'ew-resize'
        const f = direction === 'right'
          ? document.body.scrollWidth - e.clientX
          : e.clientX
        el.style.width = f + 'px'
      }

      drawerBorder.addEventListener(
        'mousedown',
        function (e) {
          if (e.offsetX < 30) {
            el.style.transition = 'initial'; document.addEventListener('mousemove', resize, false)
          }
        },
        false
      )

      document.addEventListener(
        'mouseup',
        function () {
          el.style.transition = ''
          drawerWidth.value = el.style.width
          localStorage.setItem('drawerWidth', el.style.width)
          document.body.style.cursor = ''
          document.removeEventListener('mousemove', resize, false)
        },
        false
      )
    }

    onMounted(() => {
      setBorderWidth()
      setResizeEvents()
      if (currentUserRef.value.tenantId !== '0') {
        hasConfigRef.value = canViewConfig('types') || canViewConfig('attributes') || canViewConfig('relations') || canViewConfig('users') || canViewConfig('roles') || canViewConfig('languages') || canViewConfig('lovs') || canViewConfig('actions') || canViewConfig('dashboards')
        loadAllLanguages()
      }
    })

    return {
      logout,
      reload,
      isAdmin,
      drawer,
      drawerRef,
      drawerWidth,
      activeBottom,
      userDialogRef,
      currentUserRef,
      passwordErrors,
      save,
      formRef,
      languages,
      languageSelected,
      currentLanguage,
      defaultLanguageIdentifier,
      searchTextRef,
      searchRef,
      searchResultsRef,
      searchLoadingRef,
      searchSelected,
      hasConfigRef,
      hasAccess,
      isExportSearch: props.export,
      nameRules: [
        v => !!v || i18n.t('Config.Users.Error.NameRequired')
      ]
    }
  }
}
</script>
