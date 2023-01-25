<template>
<div>
    <div v-if="!dense" :set="desc = getTextOption('description', '')">
      <!-- Text -->
      <v-text-field :counter="getCounterOption()" @input="attrInput" @blur="attrBlur" v-if="attr.type === AttributeType.Text && !attr.multiLine && !attr.richText && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)"  class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <div v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
        </template>
      </v-text-field>
      <LanguageDependentField :attr="attr" @input="attrInput" @blur="attrBlur" v-if="attr.type === AttributeType.Text && !attr.multiLine && !attr.richText && attr.languageDependent" :readonly="attr.readonly" :values="values[attr.identifier]" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" :errors="errors"></LanguageDependentField>

      <v-textarea :counter="getCounterOption()" @input="attrInput" @blur="attrBlur" v-if="attr.type === AttributeType.Text && attr.multiLine && !attr.languageDependent" :rows="3" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
        </template>
      </v-textarea>
      <v-textarea :counter="getCounterOption()" @input="attrInput" @blur="attrBlur" v-if="attr.type === AttributeType.Text && attr.multiLine && attr.languageDependent" :rows="3" :readonly="attr.readonly" :values="values[attr.identifier]" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
        </template>
      </v-textarea>

      <label v-if="attr.type === AttributeType.Text && attr.richText">{{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}</label>
      <jodit-editor ref='joditRef' v-if="attr.type === AttributeType.Text && attr.richText && !attr.languageDependent" :config="joditConfig" v-model="values[attr.identifier]" />
      <jodit-editor ref='joditRef' v-if="attr.type === AttributeType.Text && attr.richText && attr.languageDependent" :config="joditConfig" v-model="values[attr.identifier][currentLanguage.identifier]" />
      <br v-if="attr.type === AttributeType.Text && attr.richText"/>

      <!-- Boolean -->
      <v-checkbox @change="attrInput" v-if="attr.type === AttributeType.Boolean && !attr.languageDependent" :readonly="attr.readonly" :indeterminate="values[attr.identifier] === null" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required>
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
        </template>
      </v-checkbox>
      <v-checkbox @change="attrInput" v-if="attr.type === AttributeType.Boolean && attr.languageDependent" :readonly="attr.readonly" :indeterminate="values[attr.identifier][currentLanguage.identifier] === null" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required>
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
        </template>
      </v-checkbox>

      <!-- Integer -->
      <v-text-field :counter="getCounterOption()" @input="attrInput" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Integer && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
        </template>
      </v-text-field>
      <v-text-field :counter="getCounterOption()" @input="attrInput" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Integer && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
        </template>
      </v-text-field>

      <!-- Float -->
      <v-text-field :counter="getCounterOption()" @input="attrInput" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Float && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
        </template>
      </v-text-field>
      <v-text-field :counter="getCounterOption()" @input="attrInput" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Float && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
        </template>
      </v-text-field>

      <!-- Date -->
        <v-dialog ref="dateDialog" v-if="attr.type === AttributeType.Date && !attr.languageDependent" :disabled="attr.readonly" v-model="dateModal" :return-value.sync="date" persistent width="290px" @input="dateDialogChanged">
          <template v-slot:activator="{ on }">
            <v-text-field clearable @input="attrInput" @click:clear="values[attr.identifier] = ''" :value="formatedDate" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-calendar" readonly v-on="on" :error-messages="errors"></v-text-field>
          </template>
          <v-date-picker v-model="values[attr.identifier]">
            <v-spacer></v-spacer>
            <div style="flex-wrap: wrap;">
            <v-text-field dense @blur="attrBlur" v-model="date" :label="$t('AttributeValue.Date.Input')" required style="flex-basis: 100%;" @input="dateValidation" hint="DD/MM/YYYY" :error-messages="dateError" @keydown.enter.prevent="dateEnterPressed"></v-text-field>
            <v-btn text color="primary" @click="values[attr.identifier] = dateSaveValue;dateModal = false">{{ $t('Cancel') }}</v-btn>
            <v-btn text color="primary" @click="dateDialog.save(date)">{{ $t('Save') }}</v-btn>
            </div>
          </v-date-picker>
        </v-dialog>
        <v-dialog ref="dateDialog" v-if="attr.type === AttributeType.Date && attr.languageDependent" :disabled="attr.readonly" v-model="dateModal" :return-value.sync="date" persistent width="290px" @input="dateDialogChanged">
          <template v-slot:activator="{ on }">
            <v-text-field clearable @input="attrInput" @click:clear="values[attr.identifier][currentLanguage.identifier] = ''" :value="formatedDate" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-calendar" readonly v-on="on" :error-messages="errors"></v-text-field>
          </template>
          <v-date-picker v-model="values[attr.identifier][currentLanguage.identifier]">
            <v-spacer></v-spacer>
            <div style="flex-wrap: wrap;">
            <v-text-field dense @blur="attrBlur" v-model="date" :label="$t('AttributeValue.Date.Input')" required style="flex-basis: 100%;" @input="dateValidation" hint="DD/MM/YYYY" :error-messages="dateError" @keydown.enter.prevent="dateEnterPressed"></v-text-field>
            <v-btn text color="primary" @click="values[attr.identifier][currentLanguage.identifier] = dateSaveValue;dateModal = false">{{ $t('Cancel') }}</v-btn>
            <v-btn text color="primary" @click="dateDialog.save(date)">{{ $t('Save') }}</v-btn>
            </div>
          </v-date-picker>
        </v-dialog>

      <!-- Time -->
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && !attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field clearable @input="attrInput" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier]" format="24hr" full-width @click:minute="timeMenuRef.save(time)"></v-time-picker>
      </v-menu>
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field clearable @input="attrInput" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier][currentLanguage.identifier]" format="24hr" full-width @click:minute="timeMenuRef.save(time)"></v-time-picker>
      </v-menu>

      <!-- LOV -->
      <v-autocomplete :chips="multivalueRef" :multiple="multivalueRef" @input="attrInput" @change="lovChanged" v-model="values[attr.identifier]" v-if="attr.type === AttributeType.LOV && !attr.languageDependent" :items="lovSelection" :readonly="attr.readonly" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" clearable>
        <template #selection="selection">
          <v-chip @click.stop="if (selection.item.url) goto(selection.item.url)" :close="multivalueRef" @click:close="removeValue(attr.identifier,selection.item.value)">{{selection.item.text}}</v-chip>
        </template>
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
        </template>
      </v-autocomplete>
      <v-autocomplete :chips="multivalueRef" :deletable-chips="multivalueRef" :multiple="multivalueRef" @input="attrInput" @change="lovChanged" v-model="values[attr.identifier][currentLanguage.identifier]" v-if="attr.type === AttributeType.LOV && attr.languageDependent" :items="lovSelection" :readonly="attr.readonly" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" clearable>
        <template #selection="selection">
          <v-chip @click.stop="showAlert('test')" :close="multivalueRef" @click:close="removeValue(attr.identifier,selection.item.value, currentLanguage.identifier)">{{selection.item.text}}</v-chip>
        </template>
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
        </template>
      </v-autocomplete>

      <!-- URL -->
      <template v-if="attr.type === AttributeType.URL && !attr.languageDependent">
        <v-container v-if="!attr.readonly" class="pa-0">
          <v-row>
            <v-col cols="6">
              <v-text-field :counter="getCounterOption()" @input="attrInput" @blur="attrBlur" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required>
                <template #append>
                  <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
                    <template v-slot:activator="{ on }">
                      <v-btn icon @click="goto(values[attr.identifier])" :disabled="!values[attr.identifier] || values[attr.identifier] === ''" v-on="on" class="ml-3"><v-icon>mdi-arrow-right-bold-box</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Config.Attribute.OpenUrl.Tooltip') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
                    </template>
                    <p v-html="desc.replaceAll('\n', '<br>')"/>
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field @input="attrInput" @blur="attrBlur" v-model="values[attr.identifier + '_text']" :label="$t('Config.Attribute.URL.Text')" required></v-text-field>
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
              <v-text-field :counter="getCounterOption()" @input="attrInput" @blur="attrBlur" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required>
                <template #append>
                  <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
                    <template v-slot:activator="{ on }">
                      <v-btn icon @click="goto(values[attr.identifier][currentLanguage.identifier])" :disabled="!values[attr.identifier] || values[attr.identifier] === ''" v-on="on" class="ml-3"><v-icon>mdi-arrow-right-bold-box</v-icon></v-btn>
                    </template>
                    <span>{{ $t('Config.Attribute.OpenUrl.Tooltip') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
                    </template>
                    <p v-html="desc.replaceAll('\n', '<br>')"/>
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field @input="attrInput" @blur="attrBlur" v-model="values[attr.identifier + '_text'][currentLanguage.identifier]" :label="$t('Config.Attribute.URL.Text')" required></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <label v-if="attr.readonly" class="theme--light v-input v-label v-text-field v-label--active" style="font-size:12px">{{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}</label>
        <div v-if="attr.readonly" class="mb-5"><a :href="values[attr.identifier][currentLanguage.identifier]" target="_blank">{{values[attr.identifier + '_text'][currentLanguage.identifier] || values[attr.identifier][currentLanguage.identifier]}}</a></div>
      </template>

    </div>
    <div v-else>
      <!-- Text -->
      <input @change="attrInput" @blur="attrBlur" v-if="attr.type === AttributeType.Text && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input @change="attrInput" @blur="attrBlur" v-if="attr.type === AttributeType.Text && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Boolean -->
      <input @change="attrInput" type="checkbox" v-if="attr.type === AttributeType.Boolean && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input @change="attrInput" type="checkbox" v-if="attr.type === AttributeType.Boolean && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Integer -->
      <input @change="attrInput" type="number" step="1" pattern="\d+" @blur="attrBlur"  v-if="attr.type === AttributeType.Integer && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input @change="attrInput" type="number" step="1" pattern="\d+" @blur="attrBlur"  v-if="attr.type === AttributeType.Integer && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Float -->
      <input @change="attrInput" type="number" @blur="attrBlur"  v-if="attr.type === AttributeType.Float && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input @change="attrInput" type="number" @blur="attrBlur"  v-if="attr.type === AttributeType.Float && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Date -->
      <v-menu v-model="dateMenu" v-if="attr.type === AttributeType.Date && !attr.languageDependent" :disabled="attr.readonly" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
        <template v-slot:activator="{ on }">
          <input @change="attrInput" v-model="values[attr.identifier]" readonly v-on="on">
        </template>
        <v-date-picker v-model="values[attr.identifier]" @input="dateMenu = false"></v-date-picker>
      </v-menu>
      <v-menu v-model="dateMenu" v-if="attr.type === AttributeType.Date && attr.languageDependent" :disabled="attr.readonly" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
        <template v-slot:activator="{ on }">
          <input @change="attrInput" v-model="values[attr.identifier][currentLanguage.identifier]" readonly v-on="on">
        </template>
        <v-date-picker v-model="values[attr.identifier][currentLanguage.identifier]" @input="dateMenu = false"></v-date-picker>
      </v-menu>

      <!-- Time -->
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && !attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <input @change="attrInput" v-model="values[attr.identifier]" readonly v-on="on">
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier]" format="24hr" full-width @click:minute="timeMenuRef.save(time)"></v-time-picker>
      </v-menu>
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <input @change="attrInput" v-model="values[attr.identifier][currentLanguage.identifier]" readonly v-on="on">
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier][currentLanguage.identifier]" format="24hr" full-width @click:minute="timeMenuRef.save(time)"></v-time-picker>
      </v-menu>

      <!-- LOV -->
      <select @change="lovChanged" v-if="attr.type === AttributeType.LOV && !attr.languageDependent" :disabled="attr.readonly" v-model="values[attr.identifier]">
        <option v-for="(elem,i) in lovSelection" :key="i" :value="elem.value">{{elem.text}}</option>
      </select>
      <select @change="lovChanged" v-if="attr.type === AttributeType.LOV && attr.languageDependent" :disabled="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]">
        <option v-for="(elem,i) in lovSelection" :key="i" :value="elem.value">{{elem.text}}</option>
      </select>

      <!-- URL -->
      <template v-if="attr.type === AttributeType.URL && !attr.languageDependent">
        <div style="display: flex;">
          <input @change="attrInput" @blur="attrBlur" type="url" v-if="!attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
          <a :href="values[attr.identifier]" target="_blank">...</a>
        </div>
        <a v-if="attr.readonly" :href="values[attr.identifier]" target="_blank">{{values[attr.identifier]}}</a>
      </template>
      <template v-if="attr.type === AttributeType.URL && attr.languageDependent">
        <div style="display: flex;">
          <input @change="attrInput" @blur="attrBlur" type="url" v-if="!attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
          <a :href="values[attr.identifier][currentLanguage.identifier]" target="_blank">...</a>
        </div>
        <a v-if="attr.readonly" :href="values[attr.identifier][currentLanguage.identifier]" target="_blank">{{values[attr.identifier][currentLanguage.identifier]}}</a>
      </template>

    </div>
</div>
</template>
<script>
import * as langStore from '../store/languages'
import * as lovStore from '../store/lovs'
import { ref, computed, onMounted, onUnmounted, onBeforeUpdate, watch } from '@vue/composition-api'
import LanguageDependentField from './LanguageDependentField'
import AttributeType from '../constants/attributeTypes'
import i18n from '../i18n'
import XRegExp from 'xregexp'
import eventBus from '../eventBus'
import dateFormat from 'dateformat'

// Jodit
import 'jodit/build/jodit.min.css'
import { JoditEditor } from 'jodit-vue'

export default {
  components: { LanguageDependentField, JoditEditor },
  props: {
    item: {
      required: true
    },
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
      let values = lovData.value
      if (lovFilterRef.value) {
        values = values.filter(elem => elem.filter === lovFilterRef.value)
      }
      if (props.item) {
        values = values.filter(elem => !elem.level || elem.level.length === 0 || elem.level.find(path => props.item.path.startsWith(path)))
      }

      const arr = values.map(elem => { return { value: elem.id, text: elem.value[currentLanguage.value.identifier] || '[' + elem.value[defaultLanguageIdentifier.value] + ']', url: elem.url } })
      return arr
    })

    const itemId = computed(() => {
      return props.item.id
    })

    watch(() => props.item, (newValue, prevValue) => {
      if (props.attr.lov) {
        // TODO change to nextTick after moving to real Vue 3. Now nextTick is not available
        setTimeout(() => { lovChanged(true) }, 500)
      }
    })

    const dateMenu = ref(false)
    const timeMenu = ref(false)
    const timeMenuRef = ref(null)
    const time = ref(null)
    const errors = ref([])
    const validRef = ref(true)
    const lovFilterRef = ref(null)
    const multivalueRef = ref(false)

    const joditRef = ref(null)

    const lovData = ref([])

    const dateModal = ref(false)
    const dateDialog = ref(null)
    const date = ref(null)
    const dateError = ref('')
    const dateSaveValue = ref('')

    function isValid () {
      return validRef.value
    }

    function attrInput (val) {
      emit('input', val)
    }

    function attrBlur () {
      errors.value = []
      validRef.value = true

      if (props.attr.type === AttributeType.Integer) {
        const tst = '' + (props.attr.languageDependent ? props.values[props.attr.identifier][currentLanguage.value.identifier] : props.values[props.attr.identifier])
        const regx = XRegExp('^-?[0-9]+$', 'g')
        if (tst !== 'undefined' && tst.length > 0 && !regx.test(tst)) {
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
      let noCache = ''
      if (getOption('no-cache')) {
        const random = Math.floor(Math.random() * 999)
        noCache = (url.includes('?') ? '&' : '?') + random
      }
      window.open(url + noCache)
    }

    function lovChanged (skipInput) {
      const val = props.attr.languageDependent ? props.values[props.attr.identifier][currentLanguage.value.identifier] : props.values[props.attr.identifier]
      const data = { attr: props.attr.identifier, lov: props.attr.lov, value: val }
      eventBus.emit('lov_value_changed', data)
      if (!skipInput) attrInput(val)
    }

    const formatedDate = computed(() => {
      const val = props.attr.languageDependent ? props.values[props.attr.identifier][currentLanguage.value.identifier] : props.values[props.attr.identifier]
      return val ? dateFormat(Date.parse(val), process.env.VUE_APP_DATE_ONLY_FORMAT) : ''
    })

    function dateValidation () {
      if (date.value) {
        const arr = date.value.split('/')
        if (arr.length === 3) {
          const tst = new Date(parseInt(arr[2]), parseInt(arr[1]) - 1, parseInt(arr[0]))
          if (tst.toString() !== 'Invalid Date') {
            dateError.value = ''
            const df = 'yyyy-mm-dd'
            if (props.attr.languageDependent) props.values[props.attr.identifier][currentLanguage.value.identifier] = dateFormat(tst, df)
            else props.values[props.attr.identifier] = dateFormat(tst, df)
            return true
          }
        }
        dateError.value = 'Неверная дата'
      } else {
        dateError.value = ''
      }
      return false
    }

    function dateEnterPressed () {
      if (dateValidation) dateModal.value = false
    }

    function dateDialogChanged (open) {
      if (open) {
        dateSaveValue.value = props.attr.languageDependent ? props.values[props.attr.identifier][currentLanguage.value.identifier] : props.values[props.attr.identifier]
      }
    }

    const handler = () => {
      const val = props.attr.languageDependent ? props.values[props.attr.identifier][currentLanguage.value.identifier] : props.values[props.attr.identifier]
      attrInput(val)
    }
    onBeforeUpdate(() => {
      if (joditRef.value) {
        joditRef.value.editor.events.on('keyup', handler)
        joditRef.value.editor.events.on('afterPaste', handler)
      }
    })

    onMounted(() => {
      if (joditRef.value) {
        joditRef.value.editor.events.on('keyup', handler)
        joditRef.value.editor.events.on('afterPaste', handler)
        // joditRef.value.editor.events.on('change', handler)
      }

      const tst = props.attr.options.find(opt => opt.name === 'lovFilter')
      const lovFilter = tst ? parseInt(tst.value) : null
      eventBus.on('lov_value_changed', evt => {
        if (lovFilter && evt.lov === lovFilter) {
          lovFilterRef.value = evt.value
        }
      })

      if (props.attr.type === AttributeType.LOV && props.attr.lov) {
        multivalueRef.value = getOption('multivalue', false)
        getLOVData(props.attr.lov).then((data) => {
          lovData.value = data
        })
      }

      if (props.attr.lov) {
        // TODO change to nextTick after moving to real Vue 3. Now nextTick is not available
        setTimeout(() => { lovChanged(true) }, 500)
      }
    })

    onUnmounted(() => {
      eventBus.off('lov_value_changed')
    })

    watch(itemId, (current, previous) => {
      if (props.attr.type === AttributeType.LOV && props.attr.lov) {
        multivalueRef.value = getOption('multivalue', false)
        getLOVData(props.attr.lov).then((data) => {
          lovData.value = data
        })
      }
    })

    function getCounterOption () {
      if (props.attr.options) {
        const tst = props.attr.options.find(elem => elem.name === 'counter')
        if (tst) {
          return tst.value === 'true' ? true : parseInt(tst.value)
        }
      }
      return undefined
    }

    function getOption (name, defaultValue) {
      if (props.attr.options) {
        const tst = props.attr.options.find(elem => elem.name === name)
        if (tst) return tst.value === 'true'
      }
      return defaultValue
    }

    function getTextOption (name, defaultValue) {
      if (props.attr.options) {
        const tst = props.attr.options.find(elem => elem.name === name)
        if (tst) return tst.value
      }
      return name === 'description' ? props.attr.identifier : defaultValue
    }

    function showAlert (text) {
      alert(text)
    }

    function removeValue (attr, val, lang) {
      if (!lang) {
        const arr = props.values[attr]
        if (arr && arr.length > 0) props.values[attr] = arr.filter(elem => elem !== val)
      } else {
        const arr = props.values[attr][lang]
        if (arr && arr.length > 0) props.values[attr][lang] = arr.filter(elem => elem !== val)
      }
    }

    return {
      multivalueRef,
      attrBlur,
      attrInput,
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
      lovChanged,
      AttributeType,
      joditRef,
      joditConfig: { readonly: props.attr.readonly, toolbarAdaptive: false, toolbarButtonSize: 'small' },
      getTextOption,
      getCounterOption,
      formatedDate,
      dateModal,
      dateDialog,
      date,
      dateError,
      dateValidation,
      dateDialogChanged,
      dateSaveValue,
      dateEnterPressed,
      showAlert,
      removeValue
    }
  }
}
</script>
