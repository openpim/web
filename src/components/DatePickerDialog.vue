<template>
  <v-dialog v-model="datePickerDialogRef" persistent width="45%">
    <v-card>
      <v-card-title>
        <span class="headline" v-if="dateortime == 'datetime'">{{ $t('DatePickerDialog.Title') }}</span>
        <span class="headline" v-if="dateortime == 'date'">{{ $t('DatePickerDialog.Title.Dateonly') }}</span>
        <span class="headline" v-if="dateortime == 'time'">{{ $t('DatePickerDialog.Title.Timeonly') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container class="pa-0">
          <v-row>
            <v-col cols="12" class="pa-0 overflow-y-auto" style="max-height: 70vh">
              <v-tabs v-model="tabRef">
                <v-tab>{{$t('DatePickerDialog.ExactTime')}}</v-tab>
                <v-tab>{{$t('DatePickerDialog.RelativeTime')}}</v-tab>
              </v-tabs>
              <v-tabs-items v-model="tabRef">
                <v-tab-item>
                  <v-row justify="space-around">
                    <v-date-picker v-if="dateortime == 'date' || dateortime == 'datetime'" v-model="date" flat scrollable class="ma-4"></v-date-picker>
                    <v-time-picker v-if="dateortime == 'time' || dateortime == 'datetime'" v-model="time" flat format="24hr" scrollable class="ma-4"></v-time-picker>
                  </v-row>
                  <v-row>
                    <v-text-field v-model="datetime" class="ml-5 mr-5"></v-text-field>
                  </v-row>
                </v-tab-item>
                <v-tab-item>
                  <v-container fluid>
                    <v-row>
                      <v-select class="ml-3 mr-3" :items="items" v-model="perem" :label="$t('Search.Filter.Attribute.Value')"></v-select>
                    </v-row>
                    <v-row>
                      <v-text-field class="ml-3 mr-3" v-model="numberofdays" type="number" :label="$t('DatePickerDialog.Numberofdays')"></v-text-field>
                    </v-row>
                  </v-container>
                </v-tab-item>
              </v-tabs-items>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="datePickerDialogRef = false">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="selected()">{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import * as langStore from '../store/languages'
import { ref, watch } from 'vue'
import i18n from '../i18n'

export default {
  name: 'DatePickerDialog',
  setup (props, { emit }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const tabRef = ref(null)
    const datePickerDialogRef = ref(false)
    const datetime = ref(null)
    const date = ref(null)
    const time = ref(null)
    const items = [i18n.t('DatePickerDialog.DAY'), i18n.t('DatePickerDialog.HOUR'), i18n.t('DatePickerDialog.MIN')]
    const perem = ref(items[0])
    const numberofdays = ref(null)
    const dateortime = ref(null)

    let initiator

    function selected () {
      if (tabRef.value === 0 || tabRef.value === null) {
        emit('selected', datetime.value, initiator)
      } else {
        const memory = perem.value
        switch (perem.value) {
          case i18n.t('DatePickerDialog.DAY'):
            perem.value = 'DAY'
            break
          case i18n.t('DatePickerDialog.HOUR'):
            perem.value = 'HOUR'
            break
          case i18n.t('DatePickerDialog.MIN'):
            perem.value = 'MIN'
            break
        }
        emit('selected', '#' + perem.value + '#' + numberofdays.value, initiator)
        perem.value = memory
      }
    }

    function showDialog (param, init) {
      dateortime.value = param
      initiator = init
      datetime.value = init.value
      datePickerDialogRef.value = true
    }

    function closeDialog () {
      datePickerDialogRef.value = false
    }

    watch(() => date.value, (elemNew, elemOld) => {
      if (elemNew !== null) {
        if (dateortime.value === 'date') {
          datetime.value = date.value
        }
        if (dateortime.value === 'time') {
          datetime.value = time.value
        }
        if (dateortime.value === 'datetime') {
          datetime.value = date.value
          if (time.value !== null) {
            datetime.value = date.value + 'T' + time.value + ':00.000Z'
          }
        }
      }
    })

    watch(() => time.value, (elemNew, elemOld) => {
      if (elemNew !== null) {
        if (dateortime.value === 'date') {
          datetime.value = date.value
        }
        if (dateortime.value === 'time') {
          datetime.value = time.value
        }
        if (dateortime.value === 'datetime') {
          datetime.value = date.value
          if (time.value !== null) {
            datetime.value = date.value + 'T' + time.value + ':00.000Z'
          }
        }
      }
    })

    return {
      dateortime,
      perem,
      numberofdays,
      items,
      time,
      date,
      datetime,
      datePickerDialogRef,
      selected,
      showDialog,
      closeDialog,
      currentLanguage,
      defaultLanguageIdentifier,
      tabRef
    }
  }
}
</script>
