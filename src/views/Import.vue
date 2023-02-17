<template>
  <v-container v-if="importConfigRef">
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="mx-auto mb-1" outlined>
          <v-card-title>
              <v-row dense>
                <v-col cols="6">
                  <span class="mr-0">{{ importConfigRef.name[currentLanguage.identifier] || '[' + importConfigRef.name[defaultLanguageIdentifier] + ']' }}</span>
                  <SystemInformation :data="importConfigRef"></SystemInformation>
                </v-col>
                <v-col cols="6">
                  <span class="ml-3">{{$t('ImportConfig.FileType')}}:</span> {{ fileType }}
                </v-col>
              </v-row>
            </v-card-title>
            <v-card-text>
              <v-expansion-panels multiple focusable>
                <v-expansion-panel key="1">
                  <v-expansion-panel-header>Mappings</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-simple-table dense>
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-left">{{$t('ImportConfig.OptionsTable.Column')}}</th>
                            <th class="text-left">{{$t('ImportConfig.OptionsTable.Attribute')}}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(elem, j) in importConfigRef.mappings" :key="j">
                            <td class="pa-1 pr-10">{{ elem.name }}</td>
                            <td class="pa-1 pr-10">{{ elem.targetName }}</td>
                          </tr>
                        </tbody>
                      </template>
                  </v-simple-table>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
            <v-card-actions>
              <v-file-input show-size v-model="fileRef" :label="$t('ImportConfig.SelectFile')"></v-file-input>
              <v-btn class="d-inline" color="primary" :disabled="!fileRef" text @click="upload">{{ $t('ImportConfig.UploadFile') }}</v-btn>
            </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12">
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, watch, computed } from '@vue/composition-api'
import * as langStore from '@/store/languages'
import * as importConfigsStore from '@/store/importConfigs'
import { useRouter } from '@/router/useRouter'
import SystemInformation from '@/components/SystemInformation'

export default {
  components: { SystemInformation },
  setup (params, context) {
    const { route } = useRouter()
    const fileRef = ref(null)
    const { importConfigs, loadAllImportConfigs, uploadImportFile } = importConfigsStore.useStore()
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const importConfigRef = ref(null)

    function importConfigSelected (selected) {
      importConfigRef.value = selected
      fileRef.value = null
    }

    const fileType = computed(() => {
      if (importConfigRef.value.type === 1) {
        return '.CSV'
      } else if (importConfigRef.value.type === 2) {
        return 'Excel'
      } else if (importConfigRef.value.type === 3) {
        return 'Yandex'
      }
      return ''
    })

    function upload () {
      uploadImportFile(importConfigRef.value.id, fileRef.value).then((item) => {
        alert('Файл загружен!')
      })
    }

    watch(route, (current, previous) => {
      if (current && current.params && current.params.id) {
        importConfigSelected(importConfigs.find(elem => elem.identifier === current.params.id))
      } else {
        importConfigRef.value = null
      }
    })

    onMounted(() => {
      loadAllImportConfigs().then(() => {
        if (route.value && route.value.params && route.value.params.id) {
          importConfigSelected(importConfigs.find(elem => elem.identifier === route.value.params.id))
        }
      })
    })

    return {
      fileType,
      fileRef,
      importConfigRef,
      currentLanguage,
      defaultLanguageIdentifier,
      importConfigSelected,
      upload
    }
  }
}
</script>
