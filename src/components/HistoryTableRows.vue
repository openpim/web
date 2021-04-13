<template>
  <tbody>
  <tr v-for="(value, name) in data" :key="name">
    <template v-if="!isObject(value)">
      <td :class="color" :style="old ? 'width: 33%' : 'width: 50%'">{{ getTitle(name) }}</td>
      <td :style="old ? 'width: 34%' : ''">{{ value }}</td>
      <td v-if="old">{{ old[name] }}</td>
    </template>
    <template v-if="isObject(value) && !isObjectEmpty(value)">
      <td :colspan="old ? 3 : 2">
        <div :class="color + ' mt-2'">{{ getTitle(name) }}:</div>
        <v-simple-table dense>
          <template v-slot:default>
            <history-table-rows :data="data[name]" :color="color" :old="old ? old[name] : null" :level="level+1"/>
          </template>
        </v-simple-table>
      </td>
    </template>
  </tr>
  </tbody>
</template>
<script>
import HistoryTableRows from './HistoryTableRows'
import i18n from '../i18n'
import * as langStore from '../store/languages'
import * as attrStore from '../store/attributes'

export default {
  name: 'history-table-rows',
  components: { HistoryTableRows },
  props: {
    data: {
      required: true
    },
    color: {
      required: true
    },
    level: {
      required: true
    },
    old: {
      required: false
    }
  },
  setup (props) {
    const {
      currentLanguage,
      defaultLanguageIdentifier,
      languages
    } = langStore.useStore()

    const {
      findByIdentifier
    } = attrStore.useStore()

    function isObject (obj) {
      return obj != null && obj.constructor.name === 'Object'
    }

    function isObjectEmpty (obj) {
      return !obj || Object.keys(obj).length === 0
    }

    function getTitle (name) {
      if (props.level === 1) {
        if (name === 'typeIdentifier') return i18n.t('HistoryTable.typeIdentifier')
        if (name === 'parentIdentifier') return i18n.t('HistoryTable.parentIdentifier')
        if (name === 'mimeType') return i18n.t('HistoryTable.mimeType')
        if (name === 'fileOrigName') return i18n.t('HistoryTable.fileOrigName')
        if (name === 'relationIdentifier') return i18n.t('HistoryTable.relationIdentifier')
        if (name === 'itemIdentifier') return i18n.t('HistoryTable.itemIdentifier')
        if (name === 'targetIdentifier') return i18n.t('HistoryTable.targetIdentifier')
        if (name === 'name') return i18n.t('HistoryTable.ObjName')
        if (name === 'values') return i18n.t('HistoryTable.Values')
      } else if (props.level === 2) {
        let tst = languages.find(lang => lang.identifier === name)
        if (!tst) tst = findByIdentifier(name)?.item
        return tst ? tst.name[currentLanguage.value.identifier] || tst.name[defaultLanguageIdentifier.value] : name
      } else if (props.level === 3) {
        const tst = languages.find(lang => lang.identifier === name)
        return tst ? tst.name[currentLanguage.value.identifier] || tst.name[defaultLanguageIdentifier.value] : name
      }
      return name
    }

    return {
      isObject,
      isObjectEmpty,
      getTitle
    }
  }
}
</script>
