<template>
<div>
    <div v-if="!dense">
      <!-- Text -->
      <v-text-field @blur="attrBlur" v-if="attr.type === AttributeType.Text && !attr.multiLine && !attr.richText && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors"></v-text-field>
      <LanguageDependentField  @blur="attrBlur" v-if="attr.type === AttributeType.Text && !attr.multiLine && !attr.richText && attr.languageDependent" :readonly="attr.readonly" :values="values[attr.identifier]" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" :errors="errors"></LanguageDependentField>

      <v-textarea @blur="attrBlur" v-if="attr.type === AttributeType.Text && attr.multiLine && !attr.languageDependent" :rows="3" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors"></v-textarea>
      <v-textarea @blur="attrBlur" v-if="attr.type === AttributeType.Text && attr.multiLine && attr.languageDependent" :rows="3" :readonly="attr.readonly" :values="values[attr.identifier]" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" :error-messages="errors"></v-textarea>

      <label v-if="attr.type === AttributeType.Text && attr.richText">{{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}</label>
      <ckeditor v-if="attr.type === AttributeType.Text && attr.richText && !attr.languageDependent" :disabled="attr.readonly" :editor="editor" :config="attr.readonly?  editorConfigReadonly : editorConfig" v-model="values[attr.identifier]"></ckeditor>
      <ckeditor v-if="attr.type === AttributeType.Text && attr.richText && attr.languageDependent"  :disabled="attr.readonly" :editor="editor" :config="attr.readonly?  editorConfigReadonly : editorConfig" v-model="values[attr.identifier][currentLanguage.identifier]"></ckeditor>
      <br v-if="attr.type === AttributeType.Text && attr.richText"/>

      <!-- Boolean -->
      <v-checkbox v-if="attr.type === AttributeType.Boolean && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required></v-checkbox>
      <v-checkbox v-if="attr.type === AttributeType.Boolean && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required></v-checkbox>

      <!-- Integer -->
      <v-text-field @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Integer && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors"></v-text-field>
      <v-text-field @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Integer && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors"></v-text-field>

      <!-- Float -->
      <v-text-field @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Float && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors"></v-text-field>
      <v-text-field @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Float && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors"></v-text-field>

      <!-- Date -->
      <v-menu v-model="dateMenu" v-if="attr.type === AttributeType.Date && !attr.languageDependent" :disabled="attr.readonly" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-calendar" readonly v-on="on" :error-messages="errors"></v-text-field>
        </template>
        <v-date-picker v-model="values[attr.identifier]" @input="dateMenu = false"></v-date-picker>
      </v-menu>
      <v-menu v-model="dateMenu" v-if="attr.type === AttributeType.Date && attr.languageDependent" :disabled="attr.readonly" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-calendar" readonly v-on="on" :error-messages="errors"></v-text-field>
        </template>
        <v-date-picker v-model="values[attr.identifier][currentLanguage.identifier]" @input="dateMenu = false"></v-date-picker>
      </v-menu>

      <!-- Time -->
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && !attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier]" format="24hr" full-width @click:minute="timeMenuRef.save(time)"></v-time-picker>
      </v-menu>
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier][currentLanguage.identifier]" format="24hr" full-width @click:minute="timeMenuRef.save(time)"></v-time-picker>
      </v-menu>

      <!-- LOV -->
      <v-select v-model="values[attr.identifier]" v-if="attr.type === AttributeType.LOV && !attr.languageDependent" :items="lovSelection" :readonly="attr.readonly" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'"></v-select>
      <v-select v-model="values[attr.identifier][currentLanguage.identifier]" v-if="attr.type === AttributeType.LOV && attr.languageDependent" :items="lovSelection" :readonly="attr.readonly" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'"></v-select>

      <!-- URL -->
      <template v-if="attr.type === AttributeType.URL && !attr.languageDependent">
        <v-container v-if="!attr.readonly" class="pa-0">
          <v-row>
            <v-col cols="6">
              <v-text-field @blur="attrBlur" append-icon="mdi-arrow-right-bold-box" @click:append="goto(values[attr.identifier])" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field @blur="attrBlur" v-model="values[attr.identifier + '_text']" :label="$t('Config.Attribute.URL.Text')" required></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <label v-if="attr.readonly" class="theme--light v-input v-label v-text-field v-label--active" style="font-size:12px">{{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}</label>
        <div v-if="attr.readonly" class="mb-5"><a :href="values[attr.identifier]" target="_blank">{{values[attr.identifier + '_text'] || values[attr.identifier]}}</a></div>
      </template>
      <template v-if="attr.type === AttributeType.URL && attr.languageDependent">
        <v-container v-if="!attr.readonly" class="pa-0">
          <v-row>
            <v-col cols="6">
              <v-text-field @blur="attrBlur" append-icon="mdi-arrow-right-bold-box" @click:append="goto(values[attr.identifier][currentLanguage.identifier])" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field @blur="attrBlur" v-model="values[attr.identifier + '_text'][currentLanguage.identifier]" :label="$t('Config.Attribute.URL.Text')" required></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <label v-if="attr.readonly" class="theme--light v-input v-label v-text-field v-label--active" style="font-size:12px">{{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}</label>
        <div v-if="attr.readonly" class="mb-5"><a :href="values[attr.identifier][currentLanguage.identifier]" target="_blank">{{values[attr.identifier + '_text'][currentLanguage.identifier] || values[attr.identifier][currentLanguage.identifier]}}</a></div>
      </template>

    </div>
    <div v-else>
      <!-- Text -->
      <input @blur="attrBlur" v-if="attr.type === AttributeType.Text && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input @blur="attrBlur" v-if="attr.type === AttributeType.Text && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Boolean -->
      <input type="checkbox" v-if="attr.type === AttributeType.Boolean && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input type="checkbox" v-if="attr.type === AttributeType.Boolean && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Integer -->
      <input type="number" step="1" pattern="\d+" @blur="attrBlur"  v-if="attr.type === AttributeType.Integer && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input type="number" step="1" pattern="\d+" @blur="attrBlur"  v-if="attr.type === AttributeType.Integer && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Float -->
      <input type="number" @blur="attrBlur"  v-if="attr.type === AttributeType.Float && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input type="number" @blur="attrBlur"  v-if="attr.type === AttributeType.Float && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Date -->
      <v-menu v-model="dateMenu" v-if="attr.type === AttributeType.Date && !attr.languageDependent" :disabled="attr.readonly" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
        <template v-slot:activator="{ on }">
          <input v-model="values[attr.identifier]" readonly v-on="on">
        </template>
        <v-date-picker v-model="values[attr.identifier]" @input="dateMenu = false"></v-date-picker>
      </v-menu>
      <v-menu v-model="dateMenu" v-if="attr.type === AttributeType.Date && attr.languageDependent" :disabled="attr.readonly" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
        <template v-slot:activator="{ on }">
          <input v-model="values[attr.identifier][currentLanguage.identifier]" readonly v-on="on">
        </template>
        <v-date-picker v-model="values[attr.identifier][currentLanguage.identifier]" @input="dateMenu = false"></v-date-picker>
      </v-menu>

      <!-- Time -->
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && !attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <input v-model="values[attr.identifier]" readonly v-on="on">
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier]" format="24hr" full-width @click:minute="timeMenuRef.save(time)"></v-time-picker>
      </v-menu>
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <input v-model="values[attr.identifier][currentLanguage.identifier]" readonly v-on="on">
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier][currentLanguage.identifier]" format="24hr" full-width @click:minute="timeMenuRef.save(time)"></v-time-picker>
      </v-menu>

      <!-- LOV -->
      <select v-if="attr.type === AttributeType.LOV && !attr.languageDependent" :disabled="attr.readonly" v-model="values[attr.identifier]">
        <option v-for="(elem,i) in lovSelection" :key="i" :value="elem.value">{{elem.text}}</option>
      </select>
      <select v-if="attr.type === AttributeType.LOV && attr.languageDependent" :disabled="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]">
        <option v-for="(elem,i) in lovSelection" :key="i" :value="elem.value">{{elem.text}}</option>
      </select>

      <!-- URL -->
      <template v-if="attr.type === AttributeType.URL && !attr.languageDependent">
        <input @blur="attrBlur" v-if="!attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
        <a v-if="attr.readonly" :href="values[attr.identifier]" target="_blank">{{values[attr.identifier]}}</a>
      </template>
      <template v-if="attr.type === AttributeType.URL && attr.languageDependent">
        <input @blur="attrBlur" v-if="!attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
        <a v-if="attr.readonly" :href="values[attr.identifier][currentLanguage.identifier]" target="_blank">{{values[attr.identifier][currentLanguage.identifier]}}</a>
      </template>

    </div>
</div>
</template>
<script>
import * as langStore from '../store/languages'
import * as lovStore from '../store/lovs'
import { ref, computed, onMounted } from '@vue/composition-api'
import LanguageDependentField from './LanguageDependentField'
import AttributeType from '../constants/attributeTypes'
import i18n from '../i18n'
import XRegExp from 'xregexp'

// NOTE: We don't use @ckeditor/ckeditor5-build-classic any more!
// Since we're building CKEditor from source, we use the source version of ClassicEditor.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor'
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials'
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold'
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic'
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link'
import Heading from '@ckeditor/ckeditor5-heading/src/heading'

import ListStyle from '@ckeditor/ckeditor5-list/src/liststyle'
import Indent from '@ckeditor/ckeditor5-indent/src/indent'
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock'

import Table from '@ckeditor/ckeditor5-table/src/table'
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar'

import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert'
import Image from '@ckeditor/ckeditor5-image/src/image'
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption'
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle'
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar'
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize'
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter'

export default {
  components: { LanguageDependentField },
  props: {
    values: {
      required: true
    },
    attr: {
      required: true
    },
    dense: {
      required: true,
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit, root }) {
    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      getLOVData
    } = lovStore.useStore()

    const lovSelection = computed(() => {
      const arr = lovData.value.map(elem => { return { value: elem.id, text: elem.value[currentLanguage.value.identifier] || '[' + elem.value[defaultLanguageIdentifier.value] + ']' } })
      if (arr.length > 0) {
        arr.unshift({ value: 0, text: '' })
      }
      return arr
    })

    const dateMenu = ref(false)
    const timeMenu = ref(false)
    const timeMenuRef = ref(null)
    const time = ref(null)
    const errors = ref([])
    const validRef = ref(true)

    const lovData = ref([])

    function isValid () {
      return validRef.value
    }

    function attrBlur () {
      errors.value = []
      validRef.value = true

      if (props.attr.type === AttributeType.Integer) {
        const tst = '' + (props.attr.languageDependent ? props.values[props.attr.identifier][currentLanguage.value.identifier] : props.values[props.attr.identifier])
        const regx = XRegExp('^[0-9]+$', 'g')
        if (!regx.test(tst)) {
          const msg = i18n.t('Attribute.Error.WrongValue')
          if (props.dense) {
            alert(msg)
          } else {
            errors.value = [msg]
          }
          return
        }
      }

      if (props.attr.pattern) {
        const value = '' + (props.attr.languageDependent ? props.values[props.attr.identifier][currentLanguage.value.identifier] : props.values[props.attr.identifier])
        const regex = XRegExp(props.attr.pattern, 'g')
        if (!regex.test(value)) {
          validRef.value = false
          const msg = props.attr.errorMessage[currentLanguage.value.identifier] ? props.attr.errorMessage[currentLanguage.value.identifier] : i18n.t('Attribute.Error.WrongValue')
          if (props.dense) {
            alert(msg)
          } else {
            errors.value = [msg]
          }
        }
      }
    }

    function goto (url) {
      window.open(url)
    }

    onMounted(() => {
      if (props.attr.type === AttributeType.LOV && props.attr.lov) {
        getLOVData(props.attr.lov).then((data) => {
          lovData.value = data
        })
      }
    })

    return {
      attrBlur,
      errors,
      dateMenu,
      timeMenu,
      timeMenuRef,
      time,
      goto,
      isValid,
      currentLanguage,
      defaultLanguageIdentifier,
      lovSelection,
      AttributeType,
      editor: ClassicEditor,
      editorConfigReadonly: {
        plugins: [
          EssentialsPlugin,
          Heading,
          BoldPlugin,
          ItalicPlugin,
          LinkPlugin,
          ListStyle,
          Indent,
          IndentBlock,
          Base64UploadAdapter,
          Image,
          ImageResize,
          ImageToolbar,
          ImageInsert,
          ImageCaption,
          ImageStyle,
          Table,
          TableToolbar
        ],
        toolbar: {
          items: [
          ]
        }
      },
      editorConfig: {
        plugins: [
          EssentialsPlugin,
          Heading,
          BoldPlugin,
          ItalicPlugin,
          LinkPlugin,
          ListStyle,
          Indent,
          IndentBlock,
          Base64UploadAdapter,
          Image,
          ImageResize,
          ImageToolbar,
          ImageInsert,
          ImageCaption,
          ImageStyle,
          Table,
          TableToolbar
        ],
        table: {
          contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
        },
        image: {
          toolbar: [
            'imageStyle:full',
            'imageStyle:side',
            '|',
            'imageTextAlternative'
          ],

          // The default value.
          styles: [
            'full',
            'side'
          ]
        },
        toolbar: {
          items: [
            'heading',
            'bold',
            'italic',
            'link',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'undo',
            'redo',
            '|',
            'imageInsert',
            'insertTable'
          ]
        }
      }
    }
  }
}
</script>
