<template>
<div ref="componentRoot">
    <div v-if="!dense && !inTableView" :set="desc = getTextOption('description', '')">
      <!-- Text -->
      <v-text-field :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" v-if="attr.type === AttributeType.Text && !attr.multiLine && !attr.richText && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)"  class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <div v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-text-field>
      <LanguageDependentField :attr="attr" @input="attrInput($event)" @blur="attrBlur" v-if="attr.type === AttributeType.Text && !attr.multiLine && !attr.richText && attr.languageDependent" :readonly="attr.readonly" :values="values[attr.identifier]" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" :errors="errors"></LanguageDependentField>

      <v-textarea :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" v-if="attr.type === AttributeType.Text && attr.multiLine && !attr.languageDependent" :rows="getNumberOption('textareaRows', 3)" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-textarea>
      <v-textarea :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" v-if="attr.type === AttributeType.Text && attr.multiLine && attr.languageDependent" :rows="getNumberOption('textareaRows', 3)" :readonly="attr.readonly" :values="values[attr.identifier]" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-textarea>

      <label v-if="attr.type === AttributeType.Text && attr.richText">{{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}</label>
      <jodit-editor ref='joditRef' v-if="attr.type === AttributeType.Text && attr.richText && !attr.languageDependent" :config="joditConfig" v-model="values[attr.identifier]" />
      <jodit-editor ref='joditRef' v-if="attr.type === AttributeType.Text && attr.richText && attr.languageDependent" :config="joditConfig" v-model="values[attr.identifier][currentLanguage.identifier]" />
      <br v-if="attr.type === AttributeType.Text && attr.richText"/>

      <!-- Boolean -->
      <v-checkbox @change="attrInput($event)" v-if="attr.type === AttributeType.Boolean && !attr.languageDependent" :readonly="attr.readonly" :indeterminate="values[attr.identifier] === null" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required>
        <template #append>
          <v-icon @click.stop="clearValue" class="mr-2">mdi-close</v-icon>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-checkbox>
      <v-checkbox @change="attrInput($event)" v-if="attr.type === AttributeType.Boolean && attr.languageDependent" :readonly="attr.readonly" :indeterminate="values[attr.identifier][currentLanguage.identifier] === null" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required>
        <template #append>
          <v-icon @click.stop="clearValue" class="mr-2">mdi-close</v-icon>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-checkbox>

      <!-- Integer -->
      <v-text-field :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Integer && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-text-field>
      <v-text-field :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Integer && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-text-field>

      <!-- Float -->
      <v-text-field :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Float && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-text-field>
      <v-text-field :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Float && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-text-field>

      <!-- Date -->
        <v-dialog ref="dateDialog" v-if="attr.type === AttributeType.Date && !attr.languageDependent" :disabled="attr.readonly" v-model="dateModal" :return-value.sync="date" persistent width="290px" @input="dateDialogChanged">
          <template v-slot:activator="{ on }">
            <v-text-field clearable @input="attrInput($event)" @click:clear="values[attr.identifier] = ''" :value="formatedDate" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-calendar" readonly v-on="on" :error-messages="errors"></v-text-field>
          </template>
          <v-date-picker v-model="values[attr.identifier]">
            <v-spacer></v-spacer>
            <div style="flex-wrap: wrap;">
            <v-text-field dense @blur="attrBlur" v-model="date" :label="$t('AttributeValue.Date.Input')" required style="flex-basis: 100%;" @input="dateValidation" hint="DD/MM/YYYY" :error-messages="dateError" @keydown.enter.prevent="dateEnterPressed"></v-text-field>
            <v-btn text color="primary" @click="values[attr.identifier] = dateSaveValue; dateModal = false;">{{ $t('Cancel') }}</v-btn>
            <v-btn text color="primary" @click="attrInput(values[attr.identifier]); dateDialog.save(date)">{{ $t('Save') }}</v-btn>
            </div>
          </v-date-picker>
        </v-dialog>
        <v-dialog ref="dateDialog" v-if="attr.type === AttributeType.Date && attr.languageDependent" :disabled="attr.readonly" v-model="dateModal" :return-value.sync="date" persistent width="290px" @input="dateDialogChanged">
          <template v-slot:activator="{ on }">
            <v-text-field clearable @input="attrInput($event)" @click:clear="values[attr.identifier][currentLanguage.identifier] = ''" :value="formatedDate" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-calendar" readonly v-on="on" :error-messages="errors"></v-text-field>
          </template>
          <v-date-picker v-model="values[attr.identifier][currentLanguage.identifier]">
            <v-spacer></v-spacer>
            <div style="flex-wrap: wrap;">
            <v-text-field dense @blur="attrBlur" v-model="date" :label="$t('AttributeValue.Date.Input')" required style="flex-basis: 100%;" @input="dateValidation" hint="DD/MM/YYYY" :error-messages="dateError" @keydown.enter.prevent="dateEnterPressed"></v-text-field>
            <v-btn text color="primary" @click="values[attr.identifier][currentLanguage.identifier] = dateSaveValue; dateModal = false;">{{ $t('Cancel') }}</v-btn>
            <v-btn text color="primary" @click="attrInput(values[attr.identifier][currentLanguage.identifier]); dateDialog.save(date)">{{ $t('Save') }}</v-btn>
            </div>
          </v-date-picker>
        </v-dialog>

      <!-- Time -->
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && !attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field clearable @input="attrInput($event)" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier]" format="24hr" full-width @click:minute="attrInput(values[attr.identifier]); timeMenuRef.save(time)"></v-time-picker>
      </v-menu>
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field clearable @input="attrInput($event)" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier][currentLanguage.identifier]" format="24hr" full-width @click:minute="attrInput(values[attr.identifier][currentLanguage.identifier]); timeMenuRef.save(time)"></v-time-picker>
      </v-menu>

      <!-- LOV -->
      <v-autocomplete :chips="multivalueRef" :multiple="multivalueRef" @input="attrInput($event)" @change="lovChanged" v-model="values[attr.identifier]" v-if="attr.type === AttributeType.LOV && !attr.languageDependent" :items="lovSelection" :readonly="attr.readonly" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
        <template #selection="selection">
          <v-chip @click.stop="if (selection.item.url) goto(selection.item.url)" :close="multivalueRef" @click:close="removeValue(attr,selection.item.value)">{{selection.item.text}}</v-chip>
        </template>
        <template #append>
          <v-icon @click.stop="clearValue" class="mr-2">mdi-close</v-icon>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values" :lov="lovSelection"/>
        </template>
      </v-autocomplete>
      <v-autocomplete :chips="multivalueRef" :deletable-chips="multivalueRef" :multiple="multivalueRef" @input="attrInput($event)" @change="lovChanged" v-model="values[attr.identifier][currentLanguage.identifier]" v-if="attr.type === AttributeType.LOV && attr.languageDependent" :items="lovSelection" :readonly="attr.readonly" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" clearable>
        <template #selection="selection">
          <v-chip :close="multivalueRef" @click:close="removeValue(attr,selection.item.value, currentLanguage.identifier)">{{selection.item.text}}</v-chip>
        </template>
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values" :lov="lovSelection"/>
        </template>
      </v-autocomplete>

      <!-- URL -->
      <template v-if="attr.type === AttributeType.URL && !attr.languageDependent">
        <v-container v-if="!attr.readonly" class="pa-0">
          <v-row>
            <v-col cols="6">
              <v-text-field :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" v-model="values[attr.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required>
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
                  <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field @input="attrInput($event)" @blur="attrBlur" v-model="values[attr.identifier + '_text']" :label="$t('Config.Attribute.URL.Text')" required></v-text-field>
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
              <v-text-field :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" v-model="values[attr.identifier][currentLanguage.identifier]" :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'" required>
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
                  <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field @input="attrInput($event)" @blur="attrBlur" v-model="values[attr.identifier + '_text'][currentLanguage.identifier]" :label="$t('Config.Attribute.URL.Text')" required></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <label v-if="attr.readonly" class="theme--light v-input v-label v-text-field v-label--active" style="font-size:12px">{{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}</label>
        <div v-if="attr.readonly" class="mb-5"><a :href="values[attr.identifier][currentLanguage.identifier]" target="_blank">{{values[attr.identifier + '_text'][currentLanguage.identifier] || values[attr.identifier][currentLanguage.identifier]}}</a></div>
      </template>

      <!-- Relation -->
      <template v-if="attr.type === AttributeType.Relation">
        <v-autocomplete
          :chips="true"
          :deletable-chips="true"
          :multiple="multivalueRef"
          v-model="values[attr.identifier]"
          :readonly="attr.readonly"
          :label="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'"
          :items="availableItemsForRelationAttr"
          :search-input.sync="searchRef"
          :loading="loadingRef"
          @input="attrInput($event)"
        >
          <template #append>
            <v-icon @click.stop="clearValue" class="mr-2">mdi-close</v-icon>
            <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
              </template>
              <p v-html="desc.replaceAll('\n', '<br>')"/>
            </v-tooltip>
            <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
          </template>
          <template #selection="selection">
            <v-chip @click.stop="goto('#/item/' + selection.item.identifier)" :close="multivalueRef" @click:close="removeValue(attr,selection.item.value)">
              <v-avatar left tile v-if="getOption('showThumbnail', false) === true && selection.item.imageUrl">
                <v-img :src="selection.item.imageUrl"></v-img>
              </v-avatar>
              {{selection.item.text}}
            </v-chip>
          </template>
          <template v-slot:item="data" v-if="getOption('showThumbnail', false) === true">
            <v-list-item-avatar tile>
              <img :src="data.item.imageUrl" v-if="data.item.imageUrl">
            </v-list-item-avatar>
            <v-list-item-content v-text="data.item.text" />
          </template>
        </v-autocomplete>
      </template>
      <CustomAttributeValueComponent @change="attrInput($event)" :attr="attr" :values="values" :item="item"/>
    </div>
    <div v-else-if="inTableView" :set="desc = getTextOption('description', '')">
      <!-- Text -->
      <v-text-field dense hide-details="true" :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" v-if="attr.type === AttributeType.Text && !attr.multiLine && !attr.richText && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)"  class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <div v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-text-field>
      <LanguageDependentField :attr="attr" @input="attrInput($event)" @blur="attrBlur" v-if="attr.type === AttributeType.Text && !attr.multiLine && !attr.richText && attr.languageDependent" :readonly="attr.readonly" :values="values[attr.identifier]" v-model="values[attr.identifier][currentLanguage.identifier]" :errors="errors"></LanguageDependentField>

      <v-textarea :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" v-if="attr.type === AttributeType.Text && attr.multiLine && !attr.languageDependent" :rows="getNumberOption('textareaRows', 3)" :readonly="attr.readonly" v-model="values[attr.identifier]" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-textarea>
      <v-textarea :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" v-if="attr.type === AttributeType.Text && attr.multiLine && attr.languageDependent" :rows="getNumberOption('textareaRows', 3)" :readonly="attr.readonly" :values="values[attr.identifier]" v-model="values[attr.identifier][currentLanguage.identifier]" :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-textarea>

      <label v-if="attr.type === AttributeType.Text && attr.richText">{{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}</label>
      <jodit-editor ref='joditRef' v-if="attr.type === AttributeType.Text && attr.richText && !attr.languageDependent" :config="joditConfig" v-model="values[attr.identifier]" />
      <jodit-editor ref='joditRef' v-if="attr.type === AttributeType.Text && attr.richText && attr.languageDependent" :config="joditConfig" v-model="values[attr.identifier][currentLanguage.identifier]" />
      <br v-if="attr.type === AttributeType.Text && attr.richText"/>

      <!-- Boolean -->
      <v-checkbox dense hide-details="true" @change="attrInput($event)" v-if="attr.type === AttributeType.Boolean && !attr.languageDependent" :readonly="attr.readonly" :indeterminate="values[attr.identifier] === null" v-model="values[attr.identifier]" required>
        <template #append>
          <v-icon @click.stop="clearValue" class="mr-2">mdi-close</v-icon>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-checkbox>
      <v-checkbox dense hide-details="true" @change="attrInput($event)" v-if="attr.type === AttributeType.Boolean && attr.languageDependent" :readonly="attr.readonly" :indeterminate="values[attr.identifier][currentLanguage.identifier] === null" v-model="values[attr.identifier][currentLanguage.identifier]" required>
        <template #append>
          <v-icon @click.stop="clearValue" class="mr-2">mdi-close</v-icon>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-checkbox>

      <!-- Integer -->
      <v-text-field dense hide-details="true" :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Integer && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-text-field>
      <v-text-field dense hide-details="true" :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Integer && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-text-field>

      <!-- Float -->
      <v-text-field dense hide-details="true" :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Float && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-text-field>
      <v-text-field dense hide-details="true" :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" type="number" v-if="attr.type === AttributeType.Float && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" required :error-messages="errors">
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
        </template>
      </v-text-field>

      <!-- Date -->
        <v-dialog ref="dateDialog" v-if="attr.type === AttributeType.Date && !attr.languageDependent" :disabled="attr.readonly" v-model="dateModal" :return-value.sync="date" persistent width="290px" @input="dateDialogChanged">
          <template v-slot:activator="{ on }">
            <v-text-field dense hide-details="true" clearable @input="attrInput($event)" @click:clear="values[attr.identifier] = ''" :value="formatedDate" prepend-icon="mdi-calendar" readonly v-on="on" :error-messages="errors"></v-text-field>
          </template>
          <v-date-picker v-model="values[attr.identifier]">
            <v-spacer></v-spacer>
            <div style="flex-wrap: wrap;">
            <v-text-field dense @blur="attrBlur" v-model="date" :label="$t('AttributeValue.Date.Input')" required style="flex-basis: 100%;" @input="dateValidation" hint="DD/MM/YYYY" :error-messages="dateError" @keydown.enter.prevent="dateEnterPressed"></v-text-field>
            <v-btn text color="primary" @click="values[attr.identifier] = dateSaveValue;dateModal = false">{{ $t('Cancel') }}</v-btn>
            <v-btn text color="primary" @click="attrInput(values[attr.identifier]); dateDialog.save(date)">{{ $t('Save') }}</v-btn>
            </div>
          </v-date-picker>
        </v-dialog>
        <v-dialog ref="dateDialog" v-if="attr.type === AttributeType.Date && attr.languageDependent" :disabled="attr.readonly" v-model="dateModal" :return-value.sync="date" persistent width="290px" @input="dateDialogChanged">
          <template v-slot:activator="{ on }">
            <v-text-field dense hide-details="true" clearable @input="attrInput($event)" @click:clear="values[attr.identifier][currentLanguage.identifier] = ''" :value="formatedDate" prepend-icon="mdi-calendar" readonly v-on="on" :error-messages="errors"></v-text-field>
          </template>
          <v-date-picker v-model="values[attr.identifier][currentLanguage.identifier]">
            <v-spacer></v-spacer>
            <div style="flex-wrap: wrap;">
            <v-text-field dense @blur="attrBlur" v-model="date" :label="$t('AttributeValue.Date.Input')" required style="flex-basis: 100%;" @input="dateValidation" hint="DD/MM/YYYY" :error-messages="dateError" @keydown.enter.prevent="dateEnterPressed"></v-text-field>
            <v-btn text color="primary" @click="values[attr.identifier][currentLanguage.identifier] = dateSaveValue;dateModal = false">{{ $t('Cancel') }}</v-btn>
            <v-btn text color="primary" @click="attrInput(values[attr.identifier][currentLanguage.identifier]); dateDialog.save(date)">{{ $t('Save') }}</v-btn>
            </div>
          </v-date-picker>
        </v-dialog>

      <!-- Time -->
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && !attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field dense hide-details="true" clearable @input="attrInput($event)" v-model="values[attr.identifier]" prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier]" format="24hr" full-width @click:minute="attrInput(values[attr.identifier]); timeMenuRef.save(time)"></v-time-picker>
      </v-menu>
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field dense hide-details="true" clearable @input="attrInput($event)" v-model="values[attr.identifier][currentLanguage.identifier]" prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier][currentLanguage.identifier]" format="24hr" full-width @click:minute="attrInput(values[attr.identifier][currentLanguage.identifier]); timeMenuRef.save(time)"></v-time-picker>
      </v-menu>

      <!-- LOV -->
      <v-autocomplete dense hide-details="true" :chips="multivalueRef" :multiple="multivalueRef" @input="attrInput($event)" @change="lovChanged" v-model="values[attr.identifier]" v-if="attr.type === AttributeType.LOV && !attr.languageDependent" :items="lovSelection" :readonly="attr.readonly">
        <template #selection="selection">
          <v-chip @click.stop="if (selection.item.url) goto(selection.item.url)" :close="multivalueRef" @click:close="removeValue(attr,selection.item.value)">{{selection.item.text}}</v-chip>
        </template>
        <template #append>
          <v-icon @click.stop="clearValue" class="mr-2">mdi-close</v-icon>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values" :lov="lovSelection"/>
        </template>
      </v-autocomplete>
      <v-autocomplete dense hide-details="true" :chips="multivalueRef" :deletable-chips="multivalueRef" :multiple="multivalueRef" @input="attrInput($event)" @change="lovChanged" v-model="values[attr.identifier][currentLanguage.identifier]" v-if="attr.type === AttributeType.LOV && attr.languageDependent" :items="lovSelection" :readonly="attr.readonly" clearable>
        <template #selection="selection">
          <v-chip :close="multivalueRef" @click:close="removeValue(attr,selection.item.value, currentLanguage.identifier)">{{selection.item.text}}</v-chip>
        </template>
        <template #append>
          <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
            </template>
            <p v-html="desc.replaceAll('\n', '<br>')"/>
          </v-tooltip>
          <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values" :lov="lovSelection"/>
        </template>
      </v-autocomplete>

      <!-- URL -->
      <template v-if="attr.type === AttributeType.URL && !attr.languageDependent">
              <v-text-field v-if="!attr.readonly" dense hide-details="true" :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" v-model="values[attr.identifier]" required>
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
                  <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
                </template>
              </v-text-field>
        <label v-if="attr.readonly" class="theme--light v-input v-label v-text-field v-label--active" style="font-size:12px">{{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}</label>
        <div v-if="attr.readonly" class="mb-5"><a :href="values[attr.identifier]" target="_blank">{{values[attr.identifier + '_text'] || values[attr.identifier]}}</a></div>
      </template>
      <template v-if="attr.type === AttributeType.URL && attr.languageDependent">
              <v-text-field v-if="!attr.readonly" dense hide-details="true" :counter="getNumberOption('counter')" @input="attrInput($event)" @blur="attrBlur" v-model="values[attr.identifier][currentLanguage.identifier]" required>
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
                  <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
                </template>
              </v-text-field>
        <label v-if="attr.readonly" class="theme--light v-input v-label v-text-field v-label--active" style="font-size:12px">{{attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'}}</label>
        <div v-if="attr.readonly" class="mb-5"><a :href="values[attr.identifier][currentLanguage.identifier]" target="_blank">{{values[attr.identifier + '_text'][currentLanguage.identifier] || values[attr.identifier][currentLanguage.identifier]}}</a></div>
      </template>

        <!-- Relation -->
      <template v-if="attr.type === AttributeType.Relation">
        <v-autocomplete
          dense
          hide-details="true"
          :chips="true"
          :deletable-chips="true"
          :multiple="multivalueRef"
          v-model="values[attr.identifier]"
          :readonly="attr.readonly"
          :items="availableItemsForRelationAttr"
          :search-input.sync="searchRef"
          :loading="loadingRef"
          @input="attrInput($event)"
        >
          <template #append>
            <v-icon @click.stop="clearValue" class="mr-2">mdi-close</v-icon>
            <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
              </template>
              <p v-html="desc.replaceAll('\n', '<br>')"/>
            </v-tooltip>
            <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
          </template>
          <template #selection="selection">
            <v-chip @click.stop="goto('#/item/' + selection.item.identifier)" :close="true" @click:close="removeValue(attr,selection.item.value)">
              <v-avatar left tile v-if="getOption('showThumbnail', false) === true && selection.item.imageUrl">
                <v-img :src="selection.item.imageUrl"></v-img>
              </v-avatar>
              {{selection.item.text}}
            </v-chip>
          </template>
          <template v-slot:item="data" v-if="getOption('showThumbnail', false) === true">
            <v-list-item-avatar tile>
              <img :src="data.item.imageUrl" v-if="data.item.imageUrl">
            </v-list-item-avatar>
            <v-list-item-content v-text="data.item.text" />
          </template>
        </v-autocomplete>
      </template>

      <CustomAttributeValueComponent @change="attrInput($event)" :attr="attr" :values="values" :item="item"/>

    </div>
    <div v-else>
      <!-- Text -->
      <input @change="attrInput($event)" @blur="attrBlur" style="box-sizing: border-box;width:100%" v-if="attr.type === AttributeType.Text && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input @change="attrInput($event)" @blur="attrBlur" style="box-sizing: border-box;width:100%" v-if="attr.type === AttributeType.Text && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Boolean -->
      <input @change="attrInput($event)" type="checkbox" v-if="attr.type === AttributeType.Boolean && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input @change="attrInput($event)" type="checkbox" v-if="attr.type === AttributeType.Boolean && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Integer -->
      <input @change="attrInput($event)" type="number" step="1" pattern="\d+" @blur="attrBlur"  v-if="attr.type === AttributeType.Integer && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input @change="attrInput($event)" type="number" step="1" pattern="\d+" @blur="attrBlur"  v-if="attr.type === AttributeType.Integer && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Float -->
      <input @change="attrInput($event)" type="number" @blur="attrBlur"  v-if="attr.type === AttributeType.Float && !attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
      <input @change="attrInput($event)" type="number" @blur="attrBlur"  v-if="attr.type === AttributeType.Float && attr.languageDependent" :readonly="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">

      <!-- Date -->
      <v-menu v-model="dateMenu" v-if="attr.type === AttributeType.Date && !attr.languageDependent" :disabled="attr.readonly" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
        <template v-slot:activator="{ on }">
          <input @change="attrInput($event)" v-model="values[attr.identifier]" readonly v-on="on">
        </template>
        <v-date-picker v-model="values[attr.identifier]" @input="attrInput(values[attr.identifier]); dateMenu = false"></v-date-picker>
      </v-menu>
      <v-menu v-model="dateMenu" v-if="attr.type === AttributeType.Date && attr.languageDependent" :disabled="attr.readonly" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
        <template v-slot:activator="{ on }">
          <input @change="attrInput($event)" v-model="values[attr.identifier][currentLanguage.identifier]" readonly v-on="on">
        </template>
        <v-date-picker v-model="values[attr.identifier][currentLanguage.identifier]" @input="attrInput(values[attr.identifier][currentLanguage.identifier]); dateMenu = false"></v-date-picker>
      </v-menu>

      <!-- Time -->
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && !attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <input @change="attrInput($event)" v-model="values[attr.identifier]" readonly v-on="on">
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier]" format="24hr" full-width @click:minute="attrInput(values[attr.identifier]); timeMenuRef.save(time)"></v-time-picker>
      </v-menu>
      <v-menu ref="timeMenuRef" v-if="attr.type === AttributeType.Time && attr.languageDependent" :disabled="attr.readonly" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
        <template v-slot:activator="{ on }">
          <input @change="attrInput($event)" v-model="values[attr.identifier][currentLanguage.identifier]" readonly v-on="on">
        </template>
        <v-time-picker v-if="timeMenu" v-model="values[attr.identifier][currentLanguage.identifier]" format="24hr" full-width @click:minute="attrInput(values[attr.identifier][currentLanguage.identifier]); timeMenuRef.save(time)"></v-time-picker>
      </v-menu>

      <!-- LOV -->
      <select @change="lovChanged(false)" v-if="attr.type === AttributeType.LOV && !attr.languageDependent" :disabled="attr.readonly" v-model="values[attr.identifier]" style="outline: 1px solid #DCDCDC">
        <option v-for="(elem,i) in lovSelection" :key="i" :value="elem.value">{{elem.text}}</option>
      </select>
      <select @change="lovChanged(false)" v-if="attr.type === AttributeType.LOV && attr.languageDependent" :disabled="attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" style="outline: 1px solid #DCDCDC">
        <option v-for="(elem,i) in lovSelection" :key="i" :value="elem.value">{{elem.text}}</option>
      </select>

      <!-- URL -->
      <template v-if="attr.type === AttributeType.URL && !attr.languageDependent">
        <div style="display: flex;">
          <input @change="attrInput($event)" @blur="attrBlur" type="url" v-if="!attr.readonly" v-model="values[attr.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
          <a :href="values[attr.identifier]" target="_blank">...</a>
        </div>
        <a v-if="attr.readonly" :href="values[attr.identifier]" target="_blank">{{values[attr.identifier]}}</a>
      </template>
      <template v-if="attr.type === AttributeType.URL && attr.languageDependent">
        <div style="display: flex;">
          <input @change="attrInput($event)" @blur="attrBlur" type="url" v-if="!attr.readonly" v-model="values[attr.identifier][currentLanguage.identifier]" :placeholder="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">
          <a :href="values[attr.identifier][currentLanguage.identifier]" target="_blank">...</a>
        </div>
        <a v-if="attr.readonly" :href="values[attr.identifier][currentLanguage.identifier]" target="_blank">{{values[attr.identifier][currentLanguage.identifier]}}</a>
      </template>

      <template v-if="attr.type === AttributeType.Relation">
        <v-autocomplete
          dense
          hide-details="true"
          :chips="true"
          :deletable-chips="true"
          :multiple="multivalueRef"
          v-model="values[attr.identifier]"
          :readonly="attr.readonly"
          :items="availableItemsForRelationAttr"
          :search-input.sync="searchRef"
          :loading="loadingRef"
          @input="attrInput($event)"
        >
          <template #append>
            <v-icon @click.stop="clearValue" class="mr-2">mdi-close</v-icon>
            <v-tooltip bottom v-if="desc" color="blue-grey darken-4">
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click.stop="showAlert(desc)" class="mr-2">mdi-help-circle-outline</v-icon>
              </template>
              <p v-html="desc.replaceAll('\n', '<br>')"/>
            </v-tooltip>
            <CustomAttributeTooltipComponent :attr="attr" @selected="attrInput($event)" :values="values"/>
          </template>
          <template #selection="selection">
            <v-chip @click.stop="goto('#/item/' + selection.item.identifier)" :close="true" @click:close="removeValue(attr,selection.item.value)">
              <v-avatar left tile v-if="getOption('showThumbnail', false) === true && selection.item.imageUrl">
                <v-img :src="selection.item.imageUrl"></v-img>
              </v-avatar>
              {{selection.item.text}}
            </v-chip>
          </template>
          <template v-slot:item="data" v-if="getOption('showThumbnail', false) === true">
            <v-list-item-avatar tile>
              <img :src="data.item.imageUrl" v-if="data.item.imageUrl">
            </v-list-item-avatar>
            <v-list-item-content v-text="data.item.text" />
          </template>
        </v-autocomplete>
      </template>

      <CustomAttributeValueComponent @change="attrInput($event)" :attr="attr" :values="values" :item="item"/>

    </div>
</div>
</template>
<script>
import * as langStore from '../store/languages'
import * as lovStore from '../store/lovs'
import * as attrStore from '../store/attributes'
import * as actionsStore from '../store/actions'
import * as userStore from '../store/users'
import * as itemStore from '../store/item'
import * as errorStore from '../store/error'
import * as itemRelationStore from '../store/itemRelations'
import { ref, computed, onMounted, onUnmounted, onBeforeUpdate, watch } from '@vue/composition-api'
import LanguageDependentField from './LanguageDependentField'
import AttributeType from '../constants/attributeTypes'
import i18n from '../i18n'
import XRegExp from 'xregexp'
import eventBus from '../eventBus'
import dateFormat from 'dateformat'

import CustomAttributeValueComponent from '../_customizations/attributes/CustomAttributeValueComponent.vue'
import CustomAttributeTooltipComponent from '../_customizations/attributes/CustomAttributeTooltipComponent.vue'

// Jodit
import 'jodit/build/jodit.min.css'
import { JoditEditor } from 'jodit-vue'

export default {
  components: { LanguageDependentField, JoditEditor, CustomAttributeValueComponent, CustomAttributeTooltipComponent },
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
    },
    inTableView: {
      required: true,
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit, root }) {
    const componentRoot = ref(null)

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      getLOVData
    } = lovStore.useStore()

    const {
      findByIdentifier,
      getAvailableItemsForRelationAttr
    } = attrStore.useStore()

    const { showInformation } = errorStore.useStore()

    const itemStoreForAction = itemStore.useStore()
    const itemRelationStoreForAction = itemRelationStore.useStore()

    const { currentUserRef, currentRoles, canEditItem } = userStore.useStore()

    const lovSelection = computed(() => {
      let values = lovData.value

      if (props.attr && values) {
        values = values.filter(val => !val.attrs || val.attrs.length === 0 || val.attrs.includes(props.attr.internalId))
      }

      if (lovFilterRef.value) {
        values = values.filter(elem => {
          if (typeof elem.filter === 'string') {
            const arr = elem.filter.split(',').map(elem => parseInt(elem))
            return arr.includes(lovFilterRef.value)
          } else {
            return elem.filter === lovFilterRef.value
          }
        })
      }

      if (props.item) {
        values = values.filter(elem => !elem.level || elem.level.length === 0 || elem.level === '[]' || elem.level.find(path => props.item.path.startsWith(path)))
      }

      const arr = values.map(elem => { return { value: elem.id, text: elem.value[currentLanguage.value.identifier] || '[' + elem.value[defaultLanguageIdentifier.value] + ']', url: elem.url } })
      const sort = getOption('lovNameSort', false)

      let propsValues = props.values[props.attr.identifier]
      if (propsValues !== null && typeof (propsValues) !== 'undefined') {
        if (!Array.isArray(propsValues)) propsValues = [propsValues]
        for (let i = 0; i < propsValues.length; i++) {
          const propsValue = propsValues[i]
          const found = arr.find(el => el.value === propsValue)
          if (!found) arr.push({ value: propsValue, text: `[[[ ${propsValue} ]]]`, url: 'about:blank' })
        }
      }

      if (sort) arr.sort((a, b) => a.text.localeCompare(b.text))
      return arr
    })

    const {
      loadAllActions,
      actions
    } = actionsStore.useStore()

    const attributeChangedActions = computed(() => {
      if (props.item) {
        const pathArr = props.item.path.split('.').map(elem => parseInt(elem))
        const arr = []
        actions.forEach(action => {
          for (let i = 0; i < action.triggers.length; i++) {
            const trigger = action.triggers[i]
            const result = parseInt(trigger.type) === 1 && parseInt(trigger.event) === 11 && parseInt(props.item.typeId) === parseInt(trigger.itemType) && pathArr.includes(parseInt(trigger.itemFrom))
            if (result) {
              arr.push(action)
            }
          }
        })
        arr.sort((a, b) => a.order - b.order)
        return arr
      } else {
        return []
      }
    })

    const attributeBeforeShowActions = computed(() => {
      if (props.item) {
        const pathArr = props.item.path.split('.').map(elem => parseInt(elem))
        const arr = []
        actions.forEach(action => {
          for (let i = 0; i < action.triggers.length; i++) {
            const trigger = action.triggers[i]
            const result = parseInt(trigger.type) === 1 && parseInt(trigger.event) === 12 && parseInt(props.item.typeId) === parseInt(trigger.itemType) && pathArr.includes(parseInt(trigger.itemFrom))
            if (result) {
              arr.push(action)
            }
          }
        })
        arr.sort((a, b) => a.order - b.order)
        return arr
      } else {
        return []
      }
    })

    const itemId = computed(() => {
      return props.item.id
    })

    watch(() => props.item, (newValue, prevValue) => {
      if (props.attr.lov) {
        // TODO change to nextTick after moving to real Vue 3. Now nextTick is not available
        setTimeout(async () => { await lovChanged(true) }, 500)
      }
    })

    const searchRef = ref(null)
    const loadingRef = ref(false)

    if (props.attr.type === AttributeType.Relation) {
      const attrValue = computed(() => {
        return props.values[props.attr.identifier]
      })
      let awaitingSearch = null
      watch(searchRef, (val, prevVal) => {
        // eslint-disable-next-line eqeqeq
        if (val == prevVal) return
        loadingRef.value = true
        if (awaitingSearch) {
          clearTimeout(awaitingSearch)
          awaitingSearch = null
        }
        if (!awaitingSearch) {
          awaitingSearch = setTimeout(async () => {
            await updateAvailableItemsForRelationAttr(val)
          }, 1000)
        }
      })
      watch(attrValue, (val, prevVal) => {
        if (val === prevVal) return
        setTimeout(async () => {
          if (searchRef.value && searchRef.value.length) {
            await updateAvailableItemsForRelationAttr(searchRef.value)
          } else {
            await updateAvailableItemsForRelationAttr('')
          }
        }, 100)
      })
    }

    const getDisplayValue = (item, displayValueOption, displayAttr, lovData) => {
      let result
      if (displayValueOption && displayValueOption.value && displayValueOption.value.startsWith('#')) {
        const fieldName = displayValueOption.value.substr(1)
        result = item[fieldName]
      } else if (displayValueOption && displayValueOption.value) {
        // const displayAttr = displayValueOption ? findByIdentifier(displayValueOption.value) : null
        const langDependent = displayAttr && displayAttr.item && displayAttr.item.languageDependent
        if (langDependent) {
          result = item.values[displayValueOption.value] ? item.values[displayValueOption.value][currentLanguage.value.identifier] || item.values[displayValueOption.value][defaultLanguageIdentifier.value] : null
        } else if (lovData) {
          const found = lovData.find(el => parseInt(el.id) === parseInt(item.values[displayValueOption.value]))
          result = found ? found.value[currentLanguage.value.identifier] || item.name[defaultLanguageIdentifier.value] : ''
        } else {
          result = item.values[displayValueOption.value]
        }
      } else {
        result = item.name[currentLanguage.value.identifier] || item.name[defaultLanguageIdentifier.value]
      }
      return result
    }

    const updateAvailableItemsForRelationAttr = async (searchStr) => {
      loadingRef.value = true
      const displayValueOption = props.attr.options.find(el => el.name === 'displayValue')
      const displayAttr = displayValueOption ? findByIdentifier(displayValueOption.value) : null
      const lov = displayAttr && displayAttr.item && displayAttr.item.lov && displayAttr.item.type === 7
      const lovData = lov ? await getLOVData(displayAttr.item.lov) : null
      const data = await getAvailableItemsForRelationAttr(props.attr, props.values[props.attr.identifier], searchStr, currentLanguage.value.identifier || defaultLanguageIdentifier.value, 100, 0, 'ASC')

      availableItemsForRelationAttr.value = data.getItemsForRelationAttribute.map(el => {
        const text = getDisplayValue(el, displayValueOption, displayAttr, lovData)
        const damUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/'
        const imageUrl = el.values.__imagedata && el.values.__imagedata.id ? damUrl + 'asset/' + el.values.__imagedata.id + '/thumb?token=' + localStorage.getItem('token') : null
        return { identifier: el.identifier, value: el.id, text, imageUrl }
      })

      let propsValues = props.values[props.attr.identifier]
      if (propsValues !== null && typeof (propsValues) !== 'undefined') {
        if (!Array.isArray(propsValues)) propsValues = [propsValues]
        for (let i = 0; i < propsValues.length; i++) {
          const propsValue = propsValues[i]
          const found = availableItemsForRelationAttr.value.find(el => el.value === propsValue)
          if (!found) availableItemsForRelationAttr.value.push({ identifier: propsValue, value: propsValue, text: `[[[ ${propsValue} ]]]`, imageUrl: null })
        }
      }

      loadingRef.value = false
    }

    const dateMenu = ref(false)
    const timeMenu = ref(false)
    const timeMenuRef = ref(null)
    const time = ref(null)
    const errors = ref([])
    const validRef = ref(true)
    const lovFilterRef = ref(null)
    const multivalueRef = ref(false)

    const availableItemsForRelationAttr = ref([])

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

    async function attrInput (val) {
      for (let i = 0; i < attributeChangedActions.value.length; i++) {
        const action = attributeChangedActions.value[i]
        try {
          const utils = {
            canEditItem: () => {
              return canEditItem(props.item.typeId, props.$slotsitem.path)
            }
          }
          // eslint-disable-next-line no-new-func
          const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor
          const func = new AsyncFunction('item', 'values', 'attr', 'dense', 'inTableView', 'value', 'domElement', 'itemStore', 'itemRelationStore', 'user', 'roles', 'utils', '"use strict"; ' + action.code)
          await func.call(this, props.item, props.values, props.attr, props.dense, props.inTableView, val, componentRoot.value, itemStoreForAction, itemRelationStoreForAction, currentUserRef.value, currentRoles, utils)
        } catch (err) {
          console.error('Failed to evaluate expression: "' + action.code + '" for action: ' + action.identifier, err)
        }
      }
      emit('input', val)
    }

    function attrBlur () {
      errors.value = []
      validRef.value = true

      const rawVal = (props.attr.languageDependent ? props.values[props.attr.identifier][currentLanguage.value.identifier] : props.values[props.attr.identifier])
      if (props.attr.type === AttributeType.Integer && rawVal !== null && rawVal !== undefined) {
        const tst = '' + rawVal
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

      if (rawVal && props.attr.pattern) {
        const value = '' + rawVal
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

    async function lovChanged (skipInput) {
      const val = props.attr.languageDependent ? props.values[props.attr.identifier][currentLanguage.value.identifier] : props.values[props.attr.identifier]
      const data = { attr: props.attr.identifier, lov: props.attr.lov, value: val }
      eventBus.emit('lov_value_changed', data)
      if (!skipInput) await attrInput(val)
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

    const handler = async () => {
      const val = props.attr.languageDependent ? props.values[props.attr.identifier][currentLanguage.value.identifier] : props.values[props.attr.identifier]
      await attrInput(val)
    }
    onBeforeUpdate(() => {
      if (joditRef.value) {
        joditRef.value.editor.events.on('keyup', handler)
        joditRef.value.editor.events.on('afterPaste', handler)
      }
    })

    onMounted(() => {
      loadAllActions().then(() => {
        if (joditRef.value) {
          joditRef.value.editor.events.on('keyup', handler)
          joditRef.value.editor.events.on('afterPaste', handler)
          // joditRef.value.editor.events.on('change', handler)
        }

        const tst = props.attr.options.find(opt => opt.name === 'lovFilterAttr')
        const lovFilterAttr = tst ? tst.value : null
        eventBus.on('lov_value_changed', evt => {
          if (lovFilterAttr && evt.attr === lovFilterAttr) {
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
          setTimeout(async () => { await lovChanged(true) }, 500)
        }

        if (props.attr.type === AttributeType.Relation) {
          multivalueRef.value = getOption('multivalue', false)
          setTimeout(async () => { await updateAvailableItemsForRelationAttr('') }, 100)
        }
        runBeforeShowActions()
      })
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
      if (props.attr.type === AttributeType.Relation) {
        multivalueRef.value = getOption('multivalue', false)
        updateAvailableItemsForRelationAttr('')
      }
      runBeforeShowActions()
    })

    async function runBeforeShowActions () {
      if (componentRoot.value) {
        for (let i = 0; i < attributeBeforeShowActions.value.length; i++) {
          const action = attributeBeforeShowActions.value[i]
          try {
            const utils = {
              canEditItem: () => {
                return canEditItem(props.item.typeId, props.$slotsitem.path)
              }
            }
            const val = props.attr.languageDependent ? props.values[props.attr.identifier][currentLanguage.identifier] : props.values[props.attr.identifier]
            // eslint-disable-next-line no-new-func
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor
            const func = new AsyncFunction('item', 'values', 'attr', 'dense', 'inTableView', 'value', 'domElement', 'itemStore', 'itemRelationStore', 'user', 'roles', 'utils', '"use strict"; ' + action.code)
            await func.call(componentRoot.value, props.item, props.values, props.attr, props.dense, props.inTableView, val, componentRoot.value, itemStoreForAction, itemRelationStoreForAction, currentUserRef.value, currentRoles, utils)
          } catch (err) {
            console.error('Failed to evaluate expression: "' + action.code + '" for action: ' + action.identifier, err)
          }
        }
      }
    }

    function getNumberOption (name, defaultValue) {
      if (props.attr && props.attr.options) {
        const tst = props.attr.options.find(elem => elem.name === name)
        if (tst) {
          return tst.value === 'true' ? true : parseInt(tst.value)
        }
      }
      return defaultValue
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
      showInformation(text)
    }

    function removeValue (attr, val, lang) {
      if (attr.readonly) return
      if (!lang) {
        const arr = props.values[attr.identifier]
        if (arr && arr.length > 0) props.values[attr.identifier] = arr.filter(elem => elem !== val)
      } else {
        const arr = props.values[attr.identifier][lang]
        if (arr && arr.length > 0) props.values[attr.identifier][lang] = arr.filter(elem => elem !== val)
      }
    }

    async function clearValue () {
      if (props.attr.readonly) return
      if (props.attr.languageDependent) {
        props.values[props.attr.identifier][currentLanguage.value.identifier] = null
      } else {
        props.values[props.attr.identifier] = null
      }
      await attrInput(null)
    }

    return {
      multivalueRef,
      availableItemsForRelationAttr,
      updateAvailableItemsForRelationAttr,
      searchRef,
      loadingRef,
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
      getNumberOption,
      getOption,
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
      removeValue,
      clearValue,
      componentRoot
    }
  }
}
</script>
