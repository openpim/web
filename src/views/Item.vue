<template>
  <v-container v-if="itemRef" class="pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <v-btn x-small fab fixed bottom right color="primary" @click="toTop"><v-icon>mdi-arrow-up-thick</v-icon></v-btn>
        <v-card class="mx-auto mb-1" outlined>
          <v-card-title class="pt-0 pb-0">
            <v-breadcrumbs v-if="parents.length > 0" class="pa-1" dense :items="parents"></v-breadcrumbs>
            <v-container fluid class="pt-0 pb-0">
              <v-row dense>
                <v-col v-if="mainImage" :cols="getOption(itemType, 'thumbnail_cols', '1')">
                  <v-img :src="damUrl + 'asset/' + mainImage.id + '/thumb?token=' + token" contain :max-height="getOption(itemType, 'max_image_height', 200)"></v-img>
                </v-col>
                <v-col :cols="mainImage ? (12-getOption(itemType, 'thumbnail_cols', '1')-(channelsOnHead.length>0?3:0)) : 12-(channelsOnHead.length > 0 ? 3 : 0)">
                  <span class="mr-0" :class="getOption(itemType, 'name_head_class', '')" :style="getOption(itemType, 'name_head_style', '')">{{ itemRef.name[currentLanguage.identifier] || '[' + itemRef.name[defaultLanguageIdentifier] + ']' }}</span>
                  <SystemInformation :data="itemRef"></SystemInformation>
                  <template>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="toggleTabsMode" icon><v-icon :color="tabsMode ? 'primary' : ''">mdi-tab</v-icon></v-btn>
                      </template>
                      <span>{{ $t('ItemView.ToggleTabsMode.Tooltip') }}</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="toggleTableMode" icon><v-icon :color="tableMode ? 'primary' : ''">mdi-table</v-icon></v-btn>
                      </template>
                      <span>{{ $t('ItemView.ToggleTableMode.Tooltip') }}</span>
                    </v-tooltip>
                    <v-tooltip bottom v-if="canViewAttrConfigRef">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="showAttributesShowDialog(1)" icon><v-icon>mdi-format-list-bulleted-type</v-icon></v-btn>
                      </template>
                      <span>{{ $t('ShowAttributes') }}</span>
                    </v-tooltip>
                    <!-- v-tooltip bottom v-if="canViewAttrConfigRef">
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="showAttributesShowDialog(2)" icon><v-icon>mdi-format-list-bulleted-square</v-icon></v-btn>
                      </template>
                      <span>{{ $t('ShowAttributes2') }}</span>
                    </v-tooltip -->
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="refresh" icon><v-icon>mdi-refresh</v-icon></v-btn>
                      </template>
                      <span>{{ $t('DataTable.Refresh') }}</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn v-on="on" @click="showInNavigationTree" icon><v-icon>mdi-file-tree</v-icon></v-btn>
                      </template>
                      <span>{{ $t('ItemView.ShowInNavigationTree.Tooltip') }}</span>
                    </v-tooltip>
                  </template>
                  <div class="caption mb-2 mt-n2">
                    <v-icon :color="itemType ? itemType.iconColor : null">{{itemType ? 'mdi-'+itemType.icon : null}}</v-icon><span class="font-weight-bold">{{$t('Item.type')}} :</span> <router-link :to="'/config/types/' + itemType.identifier">{{ itemType.identifier }}</router-link><span class="ml-0"> ({{ itemType.name[currentLanguage.identifier] || '[' + itemType.name[defaultLanguageIdentifier] + ']' }})</span>
                  </div>
                  <div :key="headAttributesKeyRef">
                    <template v-for="(attr) in headerAttrs">
                      <v-col :cols="12" :key="attr.id" v-if="getOption(attr, 'head', null)" class="caption pa-0">
                        <span class="font-weight-bold mr-2">{{ attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']' }} :</span>
                          <span v-if="attr.type === AttributeType.URL">
                            <a :href="attr.languageDependent ? itemRef.values[attr.identifier][currentLanguage.identifier] : itemRef.values[attr.identifier]" target="_blank">{{attr.languageDependent ? itemRef.values[attr.identifier][currentLanguage.identifier] : itemRef.values[attr.identifier]}}</a>
                          </span>
                          <span v-else>{{attr.lov? getLOVValue(attr) : (attr.languageDependent ? itemRef.values[attr.identifier][currentLanguage.identifier] : itemRef.values[attr.identifier])}}</span>
                      </v-col>
                    </template>
                  </div>
                </v-col>
                <v-col v-if="channelsOnHead.length>0" :cols="3">
                  <div v-for="(channel, i) in channelsOnHead" :key="i" >
                  <v-card v-if="itemRef.channels[channel.identifier] && itemRef.channels[channel.identifier].status" flat class="ma-0 pa-0">
                    <v-card-title class="text-subtitle-2 pa-0 ma-0">
                      {{ channel.name[currentLanguage.identifier] || '[' + channel.name[defaultLanguageIdentifier] + ']' }}:
                      <v-chip small v-if="itemRef.channels[channel.identifier].status === 1" class="ma-2" color="" text-color="black"> {{$t('ItemView.Channels.Submitted')}}</v-chip>
                      <template v-if="itemRef.channels[channel.identifier].status === 2">
                        <v-tooltip top :disabled="!itemRef.channels[channel.identifier].message">
                          <template v-slot:activator="{ on }">
                            <v-chip small v-on="on" class="ma-2" color="green" text-color="white"> {{$t('ItemView.Channels.Synced')}}</v-chip>
                          </template>
                            <span>{{ itemRef.channels[channel.identifier].message }}</span>
                        </v-tooltip>
                      </template>

                      <template v-if="itemRef.channels[channel.identifier].status === 3">
                        <v-tooltip top :disabled="!itemRef.channels[channel.identifier].message">
                          <template v-slot:activator="{ on }">
                            <v-chip small v-on="on" class="ma-2" color="red" text-color="white"> {{$t('ItemView.Channels.Error')}}</v-chip>
                          </template>
                            <span>{{ itemRef.channels[channel.identifier].message || null }}</span>
                        </v-tooltip>
                      </template>

                      <template v-if="itemRef.channels[channel.identifier].status === 4">
                        <v-tooltip top :disabled="!itemRef.channels[channel.identifier].message">
                          <template v-slot:activator="{ on }">
                            <v-chip small v-on="on" class="ma-2" color="indigo" text-color="white"> {{$t('ItemView.Channels.Waiting')}}</v-chip>
                          </template>
                            <span>{{ itemRef.channels[channel.identifier].message || null }}</span>
                        </v-tooltip>
                      </template>
                    </v-card-title>
                  </v-card>
                  </div>
                  <v-btn x-small text @click="refreshChannels" v-text="$t('DataTable.Refresh')" class="ma-0 pa-0"></v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card-title>
          <v-card-actions style="max-height: 500px" class="overflow-y-auto">
            <v-btn v-if="canEditSelected && customEnableButton(itemRef, 'save')" :color="itemChangedRef ? 'primary' : ''" depressed :text="!itemChangedRef" @click="save" v-text="$t('Save')"></v-btn>
            <v-btn v-if="canEditSelected && customEnableButton(itemRef, 'move')" text @click="move" v-text="$t('Move')"></v-btn>
            <v-btn v-if="canEditSelected && customEnableButton(itemRef, 'duplicate')" text @click="duplicate" v-text="$t('Duplicate')"></v-btn>
            <v-btn v-if="canEditSelected && customEnableButton(itemRef, 'remove')" text @click="remove" v-text="$t('Remove')"></v-btn>
            <v-menu offset-y v-if="hasChannels">
              <template v-slot:activator="{ on }">
                <v-btn text v-on="on" v-text="$t('Submit')"></v-btn>
              </template>
              <v-list>
                <v-list-item >
                  <v-btn class="pl-1 pr-1" v-if="hasChannels" text @click="submit" v-text="$t('Item.toChannel')"></v-btn>
                </v-list-item>
                <v-list-item>
                  <v-btn class="pl-1 pr-1" text @click="submitToCollcetion" v-text="$t('Item.toCollection')"></v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
            <template v-if="!hasChannels">
              <v-btn class="pl-1 pr-1" text @click="submitToCollcetion" v-text="$t('Item.toCollection')"></v-btn>
            </template>
            <template v-if="buttonTemplates.length > 0">
              <v-menu offset-y>
                <template v-slot:activator="{ on }"><v-btn text v-on="on"> {{ $t('Item.Templates') }}</v-btn></template>
                <v-list>
                  <v-list-item v-for="(template, i) in buttonTemplates" :key="i" @click="executeTemplate(template)">
                    <v-list-item-title>{{ template.name[currentLanguage.identifier] || '[' + template.name[defaultLanguageIdentifier] + ']' }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
            <template v-if="buttonActions && buttonActions.length <= 3">
              <v-btn text @click="executeAction(trigger)" v-for="(trigger, i) in buttonActions" :key="i">{{trigger.itemButton}}</v-btn>
            </template>
            <template v-if="buttonActions && buttonActions.length > 3">
              <v-menu offset-y>
                <template v-slot:activator="{ on }"><v-btn text class="mr-4" v-on="on"> {{ $t('ItemView.More') }}</v-btn></template>
                <v-list>
                  <v-list-item v-for="(trigger, i) in buttonActions" :key="i" @click="executeAction(trigger)">
                    <v-list-item-title>{{trigger.itemButton}}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
            <AfterButtonsComponent :item="itemRef"></AfterButtonsComponent>
            <v-spacer></v-spacer>
            <template v-if="sourceRelationSearch.length + targetRelationSearch.length === 1">
              <v-btn v-if="sourceRelationSearch.length === 1" text @click="performRelationSearch(sourceRelationSearch[0].identifier, 'source')" v-text="getRelationSearchName(sourceRelationSearch[0]) || sourceRelationSearch[0].name[currentLanguage.identifier] || '[' + sourceRelationSearch[0].name[defaultLanguageIdentifier] + ']'"></v-btn>
              <v-btn v-else text @click="performRelationSearch(targetRelationSearch[0].identifier, 'target')" v-text="getRelationSearchName(targetRelationSearch[0]) || targetRelationSearch[0].name[currentLanguage.identifier] || '[' + targetRelationSearch[0].name[defaultLanguageIdentifier] + ']'"></v-btn>
            </template>
            <template v-if="sourceRelationSearch.length + targetRelationSearch.length > 1">
              <v-menu>
                <template v-slot:activator="{ on }"><v-btn text class="mr-4" v-on="on"> {{ $t('ItemView.Actions') }}</v-btn></template>
                <v-list>
                  <v-list-item v-for="(rel, index) in sourceRelationSearch" :key="index" @click="performRelationSearch(rel.identifier, 'source')">
                    <v-list-item-title>{{ getRelationSearchName(rel) || rel.name[currentLanguage.identifier] || '[' + rel.name[defaultLanguageIdentifier] + ']' }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-for="(rel, index) in targetRelationSearch" :key="index" @click="performRelationSearch(rel.identifier, 'target')">
                    <v-list-item-title>{{ getRelationSearchName(rel) || rel.name[currentLanguage.identifier] || '[' + rel.name[defaultLanguageIdentifier] + ']' }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
            <v-btn v-if="!itemRef.typeFile && hasFileUpload" text @click="fileUploadDialogRef.showDialog()" v-text="$t('ItemView.UploadFile')"></v-btn>
            <AfterSpacerComponent :item="itemRef"></AfterSpacerComponent>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-container ref="tabsContainerRef" class="ma-0 pa-0">
          <v-tabs v-model="tabRef">
          <FirstTabsComponent :item="itemRef"></FirstTabsComponent>
          <v-tab v-for="attrGroups in tabAttrGroups" :key="attrGroups.identifier" v-text="attrGroups.identifier"></v-tab>
          <v-tab v-if="itemRef.typeFile" v-text="$t('ItemView.Tab.File')"></v-tab>
          <v-tab v-if="!itemRef.typeFile && filesRef.length > 0" v-text="$t('ItemView.Tab.MediaFiles')"></v-tab>
          <v-tab v-if="hasSources" v-text="$t('ItemView.Tab.LinksFrom')"></v-tab>
          <v-tab v-if="hasTargets" v-text="$t('ItemView.Tab.LinksTo')"></v-tab>
          <v-tab v-if="totalChildrenRef === -1 || totalChildrenRef > 0">{{$t('ItemView.Tab.Children') + (totalChildrenRef > 0 ? ' (' + totalChildrenRef + ')' : '')}}</v-tab>
          <v-tab v-if="hasChannels" v-text="$t('ItemView.Tab.Channels')"></v-tab>
          <v-tab v-if="hasAccess('audit') && auditEnabled" v-text="$t('ItemView.Tab.Audit')"></v-tab>
          <LastTabsComponent :item="itemRef"></LastTabsComponent>
        </v-tabs>
        </v-container>
        <v-tabs-items v-model="tabRef">
          <FirstTabsItemComponent :item="itemRef"></FirstTabsItemComponent>
          <v-tab-item v-for="(attrGroups, grpIdx) in tabAttrGroups" :key="attrGroups.identifier"> <!-- Attributes -->
            <div class="mt-3"></div>
            <v-text-field v-if="!getOption(itemType, 'hideIdentifier', false)" class="pb-0 pr-5 pl-5" v-model="itemRef.identifier" readonly :label="$t('ItemCreationDialog.Identifier')" required></v-text-field>
            <div :class="getOption(itemType, 'name_class', '')" :style="getOption(itemType, 'name_style', '')"><LanguageDependentField class="pb-0 pr-5 pl-5" @input="nameInput" :values="itemRef.name" v-model="itemRef.name[currentLanguage.identifier]" :rules="nameRules" :label="$t('ItemCreationDialog.Name')"></LanguageDependentField></div>

            <v-card flat v-if="!tabsMode">
              <v-card-text class="pt-2 pl-0 pr-0">
                <BeforeAttributesComponent></BeforeAttributesComponent>
                <v-expansion-panels popout multiple focusable v-model="groupPanels[grpIdx]">
                  <v-expansion-panel v-for="(group,i) in attrGroups.groups" :key="i">
                    <v-expansion-panel-header>{{ group.name[currentLanguage.identifier] || '[' + group.name[defaultLanguageIdentifier] + ']' }}</v-expansion-panel-header>
                    <v-expansion-panel-content>
                       <v-container class="pa-0">
                        <v-row no-gutters v-if="!tableMode || getOption(group, 'noTableView')">
                          <template v-for="(attr,i) in group.itemAttributes">
                            <v-col :key="i" :cols="getOption(attr, 'cols', 12)" :class="getOption(attr, 'class', '')" :offset="getOption(attr, 'offset', '')" :style="getOption(attr, 'style', '')">
                              <AttributeValue @input="attrInput" :ref="el => { attributeValues[i] = el }" :item="itemRef" :attr="attr" :values="itemRef.values" :dense="false" :inTableView="false"></AttributeValue>
                            </v-col>
                            <v-col :key="i+1000" v-if="getOption(attr, 'space', null)" :cols="getOption(attr, 'space', null)">
                            </v-col>
                            </template>
                        </v-row>
                        <v-row no-gutters v-if="tableMode && !getOption(group, 'noTableView')">
                          <template v-for="n in parseInt(getOption(group, 'tableColumns', 2))">
                            <v-col :cols="Math.round(12/parseInt(getOption(group, 'tableColumns', 2)))" :key="n">
                              <v-simple-table dense class="stripped-table" style="width: 98%;">
                              <template v-slot:default>
                                <thead>
                                  <th style="width: 2%;">{{ $t('ItemView.TableMode.Column.Number') }}</th>
                                  <th style="width: 49%;">{{ $t('ItemView.TableMode.Column.Name') }}</th>
                                  <th style="width: 49%;">{{ $t('ItemView.TableMode.Column.Value') }}</th>
                                </thead>
                                <tbody>
                                  <template v-for="(attr,i) in group.itemAttributes">
                                    <tr v-if="getAttrRange(group.itemAttributes, i) < getTableRowsCount(group)*n && getAttrRange(group.itemAttributes, i) >= getTableRowsCount(group)*(n-1)" :key="i">
                                      <td :style="getOption(attr, 'style', '')" :class="getOption(attr, 'class', '')">{{ i + 1 }}</td>
                                      <td :style="getOption(attr, 'style', '')" :class="getOption(attr, 'class', 'stripped-table-text')" :title="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">{{ attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']' }}</td>
                                      <td :style="getOption(attr, 'style', '')" :class="getOption(attr, 'class', '')">
                                        <AttributeValue @input="attrInput" :ref="el => { attributeValues[i] = el }" :item="itemRef" :attr="attr" :values="itemRef.values" :dense="false" :inTableView="true"></AttributeValue>
                                      </td>
                                    </tr>
                                  </template>
                                </tbody>
                              </template>
                            </v-simple-table>
                            </v-col>
                          </template>
                        </v-row>
                       </v-container>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
                <AfterAttributesComponent></AfterAttributesComponent>
              </v-card-text>
            </v-card>
            <v-container class="pa-3" v-if="tabsMode">
              <v-card elevation="2" class="m-1" v-if="attrGroups.groups.length">
                <v-card-text>
                  <v-tabs v-model="attrTabRef" class="pb-5">
                    <v-tab v-for="(group,i) in attrGroups.groups" :key="i">{{ group.name[currentLanguage.identifier] || '[' + group.name[defaultLanguageIdentifier] + ']' }}</v-tab>
                  </v-tabs>
                  <v-tabs-items v-model="attrTabRef">
                    <v-tab-item v-for="(group,i) in attrGroups.groups" :key="i">
                      <v-container class="pa-0">
                        <v-row no-gutters v-if="!tableMode || getOption(group, 'noTableView')">
                          <template v-for="(attr,i) in group.itemAttributes">
                            <v-col :key="i" :cols="getOption(attr, 'cols', 12)" :class="getOption(attr, 'class', '')" :offset="getOption(attr, 'offset', '')" :style="getOption(attr, 'style', '')">
                              <AttributeValue @input="attrInput" :ref="el => { attributeValues[i] = el }" :item="itemRef" :attr="attr" :values="itemRef.values" :dense="false" :inTableView="false"></AttributeValue>
                            </v-col>
                            <v-col :key="i+1000" v-if="getOption(attr, 'space', null)" :cols="getOption(attr, 'space', null)">
                            </v-col>
                          </template>
                        </v-row>
                        <v-row no-gutters v-if="tableMode && !getOption(group, 'noTableView')">
                          <template v-for="n in parseInt(getOption(group, 'tableColumns', 2))">
                            <v-col :cols="Math.round(12/parseInt(getOption(group, 'tableColumns', 2)))" :key="n">
                              <v-simple-table dense class="stripped-table" style="width: 98%;">
                              <template v-slot:default>
                                <thead>
                                  <th style="width: 2%;">{{ $t('ItemView.TableMode.Column.Number') }}</th>
                                  <th style="width: 49%;">{{ $t('ItemView.TableMode.Column.Name') }}</th>
                                  <th style="width: 49%;">{{ $t('ItemView.TableMode.Column.Value') }}</th>
                                </thead>
                                <tbody>
                                  <template v-for="(attr,i) in group.itemAttributes">
                                    <tr v-if="getAttrRange(group.itemAttributes, i) < getTableRowsCount(group)*n && getAttrRange(group.itemAttributes, i) >= getTableRowsCount(group)*(n-1)" :key="i">
                                      <td :style="getOption(attr, 'style', '')" :class="getOption(attr, 'class', '')">{{ i + 1 }}</td>
                                      <td :style="getOption(attr, 'style', '')" :class="getOption(attr, 'class', 'stripped-table-text')" :title="attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']'">{{ attr.name[currentLanguage.identifier] || '[' + attr.name[defaultLanguageIdentifier] + ']' }}</td>
                                      <td :style="getOption(attr, 'style', '')" :class="getOption(attr, 'class', '')">
                                        <AttributeValue @input="attrInput" :ref="el => { attributeValues[i] = el }" :item="itemRef" :attr="attr" :values="itemRef.values" :dense="false" :inTableView="true"></AttributeValue>
                                      </td>
                                    </tr>
                                  </template>
                                </tbody>
                              </template>
                            </v-simple-table>
                            </v-col>
                          </template>
                        </v-row>
                      </v-container>
                    </v-tab-item>
                  </v-tabs-items>
                </v-card-text>
              </v-card>
            </v-container>
          </v-tab-item>
          <v-tab-item v-if="itemRef.typeFile">  <!-- File -->
            <v-card flat :key="imageKeyRef">
              <v-card-title>
                <v-col cols="8">
                  <v-file-input v-if="canEditSelected" show-size v-model="fileRef" :label="$t('ItemView.NewFile')"></v-file-input>
                </v-col>
                <v-col cols="4">
                  <v-btn class="d-inline" v-if="canEditSelected" :disabled="!fileRef" text @click="upload" v-text="$t('ItemView.Upload')"></v-btn>
                </v-col>
              </v-card-title>
              <v-card-text>
                <v-card v-if="isImage" flat>
                  <v-card-text>
                    <a target="_blank" :href="damUrl + 'asset/' + itemRef.id + '?key='+imageKeyRef+'&token=' + token"><v-img v-if="isImage" :src="damUrl + 'asset/' + itemRef.id + '?key='+imageKeyRef+'&token=' + token" contain max-width="500" max-height="500"></v-img></a>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn v-if="canEditSelected" text @click="removeFile" v-text="$t('Remove')"></v-btn>
                  </v-card-actions>
                </v-card>
                <v-card v-if="isFile">
                  <v-card-title>
                    <a v-if="itemRef.mimeType == 'application/pdf'" :href="damUrl + 'asset/' + itemRef.id + '?inline&key='+imageKeyRef+'&token=' + token" target="_blank"><pdf :src="damUrl + 'asset/' + itemRef.id + '?key='+imageKeyRef+'&token=' + token"> </pdf></a>
                    <a v-else :href="damUrl + 'asset/' + itemRef.id + '?key='+imageKeyRef+'&token=' + token">{{itemRef.fileOrigName}}</a>
                  </v-card-title>
                  <v-card-actions>
                    <v-btn v-if="canEditSelected" text @click="removeFile" v-text="$t('Remove')"></v-btn>
                  </v-card-actions>
                </v-card>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item v-if="!itemRef.typeFile && filesRef.length > 0">  <!-- MediaFiles -->
            <v-carousel height="500" show-arrows-on-hover>
              <v-carousel-item v-for="(file1, i) in filesRef" :key="i" :set="mainFile=filesRef[i]">
                <v-row class="justify-center">
                <v-col class="pl-0 pr-0" :cols="12/parseInt(getOption(itemType, 'galeryPageLength',  '1'))" v-for="(n, j) in parseInt(getOption(itemType, 'galeryPageLength',  '1'))" :key="'img'+j" :set="file=getGaleryFile(i, j)">
                  <v-card v-if="file && file.image" class="ma-2" flat style="background: white" >
                    <v-card-text class="pa-0">
                      <div class="d-inline-flex ml-3">
                        <router-link :to="'/item/' + file.identifier">
                          <div>{{getOption(file.type, 'hideIdentifier',  false) ? '' : '('+file.identifier+')' }} {{ file.name[currentLanguage.identifier] || '[' + file.name[defaultLanguageIdentifier] + ']' }} - {{ file.relationName[currentLanguage.identifier] || '[' + file.relationName[defaultLanguageIdentifier] + ']' }}</div>
                        </router-link>
                        <a :href="damUrl + 'asset/' + file.id + '?token=' + token" class="ml-1" style="text-decoration: none"><v-icon color="grey darken-1">mdi-download-circle-outline</v-icon></a>
                      </div>
                      <a target="_blank" :href="damUrl + 'asset/' + file.id + '?inline=true&token=' + token" class=""><v-img :aspect-ratio="getOption(file.type, 'aspect-ratio', undefined)" :src="damUrl + 'asset/' + file.id + '?token=' + token" contain></v-img></a>
                    </v-card-text>
                  </v-card>
                  <v-card v-if="file && !file.image" class="ma-4" style="background: white;border:1px solid grey">
                    <v-card-title>
                      <a v-if="file.mimeType == 'application/pdf'" :href="damUrl + 'asset/' + file.id + '?inline&token=' + token" target="_blank"><pdf :src="damUrl + 'asset/' + file.id + '?token=' + token"> </pdf></a>
                      <a v-else :href="damUrl + 'asset/' + file.id + '?token=' + token">{{ file.name[currentLanguage.identifier] || '[' + file.name[defaultLanguageIdentifier] + ']' }} - {{ file.relationName[currentLanguage.identifier] || '[' + file.relationName[defaultLanguageIdentifier] + ']' }}</a>
                      <v-btn :to="'/item/' + file.identifier" icon color="black" class="ml-4"><v-icon>mdi-arrow-right-bold-circle-outline</v-icon></v-btn>
                    </v-card-title>
                  </v-card>
                </v-col>
                </v-row>
              </v-carousel-item>
            </v-carousel>
          </v-tab-item>
          <v-tab-item v-if="hasSources" eager>  <!-- Links from -->
            <ItemRelationsList :item="itemRef" componentType="source" :itemRefreshFunction="refresh" @dataLoaded="sourcesLoaded" ref="sourceRelationsListRef" class="mb-12"></ItemRelationsList>
          </v-tab-item>
          <v-tab-item v-if="hasTargets" eager>  <!-- Links to -->
            <ItemRelationsList :item="itemRef" componentType="target" :itemRefreshFunction="refresh" @dataLoaded="targetsLoaded" ref="targetRelationsListRef" class="mb-12"></ItemRelationsList>
          </v-tab-item>
          <v-tab-item v-if="totalChildrenRef === -1 || totalChildrenRef > 0" eager>  <!-- Children -->

            <ItemsDataTable ref="itemRecordsTable" :loadItemChildren="loadDataFunction" @dataLoaded="childrenLoaded" :export="false" :item="itemRef" :marginTop="dataTableMarginTop"></ItemsDataTable>

          </v-tab-item>
          <v-tab-item v-if="hasChannels" eager>  <!-- Channels -->
            <div v-for="(channel, i) in awailableChannelsRef" :key="i">
              <v-card v-if="itemRef.channels && itemRef.channels[channel.identifier] && itemRef.channels[channel.identifier].status">
                <v-card-title class="text-subtitle-2">
                  {{ channel.name[currentLanguage.identifier] || '[' + channel.name[defaultLanguageIdentifier] + ']' }}
                  <v-tooltip top v-if="channel.config.showRemoveButton && canEditSelected">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="removeChannel(channel)" class="ml-3"><v-icon>mdi-delete-circle-outline</v-icon></v-btn>
                    </template>
                      <span>{{ $t('ItemView.Channels.RemoveChannel') }}</span>
                  </v-tooltip>
                  <v-tooltip top v-if="getChannelFactory(channel.type).hasItemSync">
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on" @click="syncItem(channel)" class="ml-3"><v-icon>mdi-sync</v-icon></v-btn>
                    </template>
                      <span>{{ $t('ItemView.Channels.SyncItem') }}</span>
                  </v-tooltip>
                </v-card-title>
                <v-card-text class="text-body-1">
                  <v-row no-gutters>
                    <v-col cols="3">
                      <div>{{$t('ItemView.Channels.Status')}}:
                        <template v-if="itemRef.channels[channel.identifier].status === 1"><v-chip class="ma-2" color="" text-color="black"> {{$t('ItemView.Channels.Submitted')}}</v-chip></template>
                        <template v-if="itemRef.channels[channel.identifier].status === 2"><v-chip class="ma-2" color="green" text-color="white"> {{$t('ItemView.Channels.Synced')}}</v-chip></template>
                        <template v-if="itemRef.channels[channel.identifier].status === 3"><v-chip class="ma-2" color="red" text-color="white"> {{$t('ItemView.Channels.Error')}}</v-chip></template>
                        <template v-if="itemRef.channels[channel.identifier].status === 4"><v-chip class="ma-2" color="indigo" text-color="white"> {{$t('ItemView.Channels.Waiting')}}</v-chip></template>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div v-if="itemRef.channels[channel.identifier].submittedAt">{{$t('ItemView.Channels.SubmittedAt')}}: {{ dateFormat(new Date(itemRef.channels[channel.identifier].submittedAt), DATE_FORMAT) }}</div>
                    </v-col>
                    <v-col cols="3">
                      <div>{{$t('ItemView.Channels.SubmittedBy')}}: {{ itemRef.channels[channel.identifier].submittedBy }}</div>
                    </v-col>
                    <v-col cols="3">
                      <div>{{$t('ItemView.Channels.SyncedAt')}}: {{ itemRef.channels[channel.identifier].syncedAt ? dateFormat(new Date(itemRef.channels[channel.identifier].syncedAt), DATE_FORMAT) : '' }}</div>
                    </v-col>
                    <v-col cols="12" v-if="itemRef.channels[channel.identifier].message">
                      <div>{{$t('ItemView.Channels.Message')}}: {{itemRef.channels[channel.identifier].message}}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>
          </v-tab-item>
          <v-tab-item v-if="hasAccess('audit') && auditEnabled">  <!-- History -->
            <HistoryTable ref="historyTableRef" :item="itemRef" componentType="item"></HistoryTable>
          </v-tab-item>
          <LastTabsItemComponent :item="itemRef"></LastTabsItemComponent>
        </v-tabs-items>
      </v-col>
    </v-row>
    <ActionStatusDialog ref="buttonActionStatusDialog" />
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemSelectionDialogSelected"/>
    <FileUploadDialog ref="fileUploadDialogRef" :typeId="itemRef.typeId" @upload="linkNewFile"/>
    <ItemDuplicationDialog ref="itemDuplicationDialogRef" @duplicated="itemDuplicated"/>
    <ChannelsSelectionDialog ref="chanSelectionDialogRef" :multiselect="true" :editAccessOnly="true" @selected="channelsSelected"/>
    <CollectionsSelectionDialog ref="collSelectionDialogRef" :editAccessOnly="true" @selected="collectionsSelected"/>
    <ShowAttributesDialog ref="showAttributesDialogRef" @selected="showAttributes"/>
  </v-container>
</template>

<style scoped>
.stripped-table tbody tr:nth-of-type(even) {
    background-color: rgba(0, 0, 0, .03);
}

.stripped-table tbody tr td.stripped-table-text {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    min-height: 30px;
    max-width: 100px;
}
</style>

<script>
import { ref, onMounted, watch, computed, onBeforeUpdate, onUnmounted } from '@vue/composition-api'
import goTo from 'vuetify/lib/services/goto'
import { useRouter } from '../router/useRouter'
import * as itemStore from '../store/item'
import * as attrStore from '../store/attributes'
import * as errorStore from '../store/error'
import * as userStore from '../store/users'
import * as typesStore from '../store/types'
import * as actionsStore from '../store/actions'
import * as relStore from '../store/relations'
import * as auditStore from '../store/audit'
import * as channelsStore from '../store/channels'
import * as searchStore from '../store/search'
import * as lovsStore from '../store/lovs'
import * as collectionsStore from '../store/collections'
import i18n from '../i18n'
import * as langStore from '../store/languages'
import * as tempStore from '../store/templates'
import AttributeValue from '../components/AttributeValue'
import ItemRelationsList from '../components/ItemRelationsList'
import SystemInformation from '../components/SystemInformation'
import LanguageDependentField from '../components/LanguageDependentField'
import ItemsDataTable from '../components/ItemsDataTable'
import router from '../router'
import AttributeType from '../constants/attributeTypes'
import ItemsSelectionDialog from '../components/ItemsSelectionDialog'
import FileUploadDialog from '../components/FileUploadDialog'
import ItemDuplicationDialog from '../components/ItemDuplicationDialog'
import ChannelsSelectionDialog from '../components/ChannelsSelectionDialog'
import CollectionsSelectionDialog from '../components/CollectionsSelectionDialog'
import ActionStatusDialog from '../components/ActionStatusDialog'
import ShowAttributesDialog from '../components/ShowAttributesDialog'
import HistoryTable from '../components/HistoryTable'

import AfterButtonsComponent from '../_customizations/item/afterButtons/AfterButtonsComponent'
import AfterSpacerComponent from '../_customizations/item/afterButtons/AfterSpacerComponent'
import FirstTabsComponent from '../_customizations/item/tabs/firstTabs/TabsComponent'
import FirstTabsItemComponent from '../_customizations/item/tabs/firstTabs/TabsItemComponent'
import LastTabsComponent from '../_customizations/item/tabs/lastTabs/TabsComponent'
import LastTabsItemComponent from '../_customizations/item/tabs/lastTabs/TabsItemComponent'
import customEnableButton from '../_customizations/item/customEnableButton.js'

import BeforeAttributesComponent from '../_customizations/item/beforeAttributes/BeforeAttributesComponent'
import AfterAttributesComponent from '../_customizations/item/afterAttributes/AfterAttributesComponent'

import eventBus from '../eventBus'
import dateFormat from 'dateformat'
import getChannelFactory from '../channels'
import pdf from 'vue-pdf'

export default {
  components: {
    AttributeValue,
    ItemRelationsList,
    SystemInformation,
    LanguageDependentField,
    ItemsDataTable,
    ItemsSelectionDialog,
    FileUploadDialog,
    ItemDuplicationDialog,
    HistoryTable,
    AfterButtonsComponent,
    AfterSpacerComponent,
    FirstTabsComponent,
    FirstTabsItemComponent,
    LastTabsComponent,
    LastTabsItemComponent,
    BeforeAttributesComponent,
    AfterAttributesComponent,
    ChannelsSelectionDialog,
    CollectionsSelectionDialog,
    ActionStatusDialog,
    ShowAttributesDialog,
    pdf
  },
  name: 'Home',
  setup (params, context) {
    const tabsContainerRef = ref(null)

    const itemRecordsTable = ref(null)

    const { route } = useRouter()

    const { showInfo, showError } = errorStore.useStore()

    const { currentUserRef, currentRoles, canEditItem, hasAccess, canEditItemRelation, canViewConfig } = userStore.useStore()

    const { checkAuditEnabled, auditEnabled } = auditStore.useStore()

    const { loadAllChannels, getAvailableChannels, submitItem, triggerChannel, updateItemChannels } = channelsStore.useStore()

    const { submitItemToCollection } = collectionsStore.useStore()

    const { searchEntityRef } = searchStore.useStore()

    const {
      findType,
      loadAllTypes
    } = typesStore.useStore()

    const {
      currentLanguage,
      defaultLanguageIdentifier,
      loadAllLanguages
    } = langStore.useStore()

    const {
      loadItemByIdentifier,
      loadItemsByIds,
      updateItem,
      moveItem,
      createItem,
      createItemInTree,
      removeItem,
      removeItemFromTree,
      uploadFile,
      uploadAndCreateFile,
      removeItemFile,
      loadAssets,
      loadChildren,
      searchItems,
      hasRelations,
      loadItemChannels
    } = itemStore.useStore()

    const {
      loadAllAttributes,
      getAttributesForItem
    } = attrStore.useStore()

    const {
      loadAllActions,
      actions,
      executeButtonAction
    } = actionsStore.useStore()

    const {
      loadAllRelations,
      relations
    } = relStore.useStore()

    const {
      getLOVData
    } = lovsStore.useStore()

    const {
      loadAllTemplates,
      templates
    } = tempStore.useStore()

    const itemsDataTableRef = ref(null)
    const historyTableRef = ref(null)
    const itemRef = ref(null)
    const tabRef = ref(null)
    const attrGroups = ref([])
    const itemPathRef = ref([])
    const fileRef = ref(null)
    const imageKeyRef = ref(1)
    const filesRef = ref([])
    const totalChildrenRef = ref(-1)
    const hasSources = ref(true)
    const hasTargets = ref(true)
    const itemSelectionDialogRef = ref(null)
    const fileUploadDialogRef = ref(null)
    const itemDuplicationDialogRef = ref(null)
    const chanSelectionDialogRef = ref(null)
    const collSelectionDialogRef = ref(null)
    const showAttributesDialogRef = ref(null)
    const awailableChannelsRef = ref([])
    const buttonActionStatusDialog = ref(null)
    const tabsMode = ref(localStorage.getItem('tabsMode') === 'true' || false)
    const tableMode = ref(localStorage.getItem('tableMode') === 'true' || false)
    const attrTabRef = ref(null)
    const dataTableMarginTop = ref(0)
    const sourceRelationsListRef = ref(null)
    const targetRelationsListRef = ref(null)

    const canViewAttrConfigRef = ref(false)

    const groupPanels = ref([[]])

    const attributeValues = ref([])
    onBeforeUpdate(() => {
      attributeValues.value = []
    })

    const itemType = computed(() => {
      if (itemRef.value) {
        return findType(itemRef.value.typeId).node
      } else {
        return null
      }
    })
    const isImage = computed(() => {
      return itemRef.value.mimeType && (
        (itemRef.value.mimeType === 'image/jpeg') ||
        (itemRef.value.mimeType === 'image/png') ||
        (itemRef.value.mimeType === 'image/bmp') ||
        (itemRef.value.mimeType === 'image/tiff') ||
        (itemRef.value.mimeType === 'image/gif') ||
        (itemRef.value.mimeType === 'image/webp'))
    })

    const isFile = computed(() => {
      return itemRef.value.mimeType && !(
        (itemRef.value.mimeType === 'image/jpeg') ||
        (itemRef.value.mimeType === 'image/png') ||
        (itemRef.value.mimeType === 'image/bmp') ||
        (itemRef.value.mimeType === 'image/tiff') ||
        (itemRef.value.mimeType === 'image/gif') ||
        (itemRef.value.mimeType === 'image/webp'))
    })

    const hasFileUpload = computed(() => {
      if (itemRef.value) {
        let found = false
        const typeId = parseInt(itemRef.value.typeId)
        relations.forEach(relation => {
          if (relation.sources.includes(typeId) && canEditItemRelation(relation.id)) {
            relation.targets.forEach(targetTypeId => {
              const targetType = findType(targetTypeId).node
              if (targetType && targetType.file) found = true
            })
          }
        })
        return found
      } else {
        return false
      }
    })

    const headerAttrs = computed(() => {
      const arr = []
      attrGroups.value.forEach(group => {
        group.itemAttributes.forEach(attr => {
          if (getOption(attr, 'head', null)) {
            arr.push(attr)
          }
        })
      })
      return [...new Set(arr.map(o => o.identifier))].map(identifier => { return arr.find(s => s.identifier === identifier) })
    })

    const buttonActions = computed(() => {
      if (itemRef.value) {
        const pathArr = itemRef.value.path.split('.').map(elem => parseInt(elem))
        const arr = []

        actions.forEach(action => {
          for (let i = 0; i < action.triggers.length; i++) {
            const trigger = action.triggers[i]

            const result = parseInt(trigger.type) === 3 && // button
                  parseInt(itemRef.value.typeId) === parseInt(trigger.itemType) &&
                  pathArr.includes(parseInt(trigger.itemFrom))
            if (result) {
              const isAdmin = currentRoles.some(role => role.identifier === 'admin')
              const hasRole = currentRoles.some(role => trigger.roles && trigger.roles.includes(parseInt(role.id)))
              if (!trigger.roles || trigger.roles.length === 0 || isAdmin || hasRole) {
                arr.push({ ...trigger, order: action.order })
              }
            }
          }
        })
        arr.sort((a, b) => a.order - b.order)
        return arr
      } else {
        return []
      }
    })

    const buttonTemplates = computed(() => {
      if (!itemRef.value) return []

      const pathArr = itemRef.value.path.split('.').map(elem => parseInt(elem))
      const typeId = itemRef.value.typeId

      return templates
        .filter(template => {
          const visibleResult = template.visible.some(el => pathArr.includes(parseInt(el)))
          const validResult = template.valid.includes(typeId)
          return visibleResult && validResult
        })
        .filter(temp => {
          if (!temp.options) return true
          const itemViewOption = temp.options.find(option => option.name === 'itemView')
          return !itemViewOption || itemViewOption.value !== 'false'
        })
        .map(template => ({
          name: template.name,
          order: template.order,
          options: template.options,
          id: template.id
        }))
        .sort((a, b) => a.order - b.order)
    })

    function executeTemplate (template) {
      const isDirectUrl = template.options.some(
        el => el.name === 'directUrl' && el.value === 'true'
      )

      const routePath = `template/${template.id}/${itemRef.value.id}`
      const token = localStorage.getItem('token')
      const damUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL
      const fullPath = isDirectUrl
        ? routePath
        : `${routePath}?token=${token}`
      window.open(damUrl + fullPath, '_blank')
    }

    const getRelationSearchName = (rel) => {
      if (rel && rel.options && rel.options.some(option => option.name === 'searchName')) {
        const option = rel.options.find(option => option.name === 'searchName')
        if (option.value) {
          return option.value
        }
      }
      return null
    }

    const sourceRelationSearch = computed(() => {
      const type = itemType.value
      if (type && type.options.some(option => option.name === 'sourceRelationSearch')) {
        const option = type.options.find(option => option.name === 'sourceRelationSearch')
        if (option.value) {
          const relIdents = option.value.split(',')
          return relations.filter(elem => relIdents.includes(elem.identifier))
        }
      }
      return []
    })

    const targetRelationSearch = computed(() => {
      const type = itemType.value
      if (type && type.options.some(option => option.name === 'targetRelationSearch')) {
        const option = type.options.find(option => option.name === 'targetRelationSearch')
        if (option.value) {
          const relIdents = option.value.split(',')
          return relations.filter(elem => relIdents.includes(elem.identifier))
        }
      }
      return []
    })

    function performRelationSearch (relIdent, type) {
      const oppositeType = type === 'source' ? 'target' : 'source'
      const lquery = itemRef.value.path + '.*'
      const where = { include: [{ as: oppositeType + 'Relation', required: true, where: { relationIdentifier: relIdent }, include: [{ as: type + 'Item', required: true, where: { path: { OP_regexp: lquery } } }] }] }

      const search = { user: '', filters: [], whereClause: where, extended: true }
      localStorage.setItem('last_search_entity', 'ITEM')
      localStorage.setItem('search_to_open', JSON.stringify(search))
      window.open('/#/search', '_blank')
    }

    function showInNavigationTree () {
      eventBus.emit('show_in_navigation_tree', itemRef.value)
    }

    let beforeShowActions = []
    function reloadBeforeShowActions (item) {
      if (item) {
        const pathArr = item.path.split('.').map(elem => parseInt(elem))
        const arr = []

        actions.forEach(action => {
          for (let i = 0; i < action.triggers.length; i++) {
            const trigger = action.triggers[i]

            const result = parseInt(trigger.type) === 1 && parseInt(trigger.event) === 7 && // before show
                  parseInt(item.typeId) === parseInt(trigger.itemType) &&
                  pathArr.includes(parseInt(trigger.itemFrom))
            if (result) {
              arr.push(action)
            }
          }
        })
        arr.sort((a, b) => a.order - b.order)
        beforeShowActions = arr
      } else {
        beforeShowActions = []
      }
    }

    const channelsOnHead = computed(() => {
      if (itemRef.value) {
        const pathArr = itemRef.value.path.split('.')
        return awailableChannelsRef.value.filter(channel => channel.config.statusOnHead && channel.valid.includes(itemRef.value.typeId) && channel.visible.find(elem => pathArr.includes(elem)))
      } else {
        return []
      }
    })

    function getRowsCount (attrs, index) {
      let rowsCount = 0
      for (let i = 0; i < index; i++) {
        const attr = attrs[i]
        if (attr) {
          if (attr.type === AttributeType.Text && attr.multiLine) {
            rowsCount += parseInt(getOption(attr, 'textareaRows', 3))
          } else if (attr.type === AttributeType.Text && attr.richText) {
            rowsCount += 3
          } else {
            rowsCount += 1
          }
        }
      }
      return rowsCount
    }

    function getAttrRange (attrs, index) {
      const count = getRowsCount(attrs, index)
      return count
    }

    function getTableRowsCount (group) {
      const count = getRowsCount(group.itemAttributes, group.itemAttributes.length)
      return Math.ceil((count / parseInt(getOption(group, 'tableColumns', 2))))
    }

    function childrenLoaded (rows, total) {
      totalChildrenRef.value = total || 0
    }

    function sourcesLoaded (links) {
      hasSources.value = links && Object.keys(links).length > 0
    }

    function targetsLoaded (links) {
      hasTargets.value = links && Object.keys(links).length > 0
    }

    function toggleTabsMode () {
      tabsMode.value = !tabsMode.value
      localStorage.setItem('tabsMode', tabsMode.value)
    }

    function toggleTableMode () {
      tableMode.value = !tableMode.value
      localStorage.setItem('tableMode', tableMode.value)
    }

    function upload () {
      uploadFile(itemRef.value.id, fileRef.value).then((item) => {
        if (item) {
          enrichItem(item)

          itemRef.value.values = item.values
          itemRef.value.mimeType = fileRef.value.type
          itemRef.value.fileOrigName = fileRef.value.name
          imageKeyRef.value++
          fileRef.value = null
        }
      })
    }

    function linkNewFile (filesData) {
      fileUploadDialogRef.value.closeDialog()
      const promises = []
      for (let i = 0; i < filesData.length; i++) {
        const fileData = filesData[i]
        const promise = new Promise((resolve, reject) => {
          uploadAndCreateFile(itemRef.value.id, fileData.file, fileData.fileItemTypeId, fileData.parentId, fileData.relationId, currentLanguage.value.identifier, fileData.fileName, fileData.fileIdentifier).then((ok) => {
            if (!ok) reject(new Error('Can not upload a file!'))
            else {
              sourceRelationsListRef.value.reloadRelation(fileData.relationId)
              loadAssets(itemRef.value.id).then(arr => {
                arr.forEach(elem => {
                  elem.type = findType(elem.typeId)?.node
                })
                filesRef.value = arr
                resolve()
              })
            }
          })
        })
        promises.push(promise)
      }
      Promise.all(promises).then((values) => {
        showInfo(i18n.t('Saved'))
      })
    }

    function removeFile () {
      if (confirm(i18n.t('ItemView.RemoveFile'))) {
        removeItemFile(itemRef.value.internalId).then(() => {
          itemRef.value.mimeType = ''
          itemRef.value.fileOrigName = ''
          imageKeyRef.value++
          fileRef.value = null
        })
      }
    }

    const mainImage = computed(() => {
      return filesRef.value.find(elem => elem.mainImage)
    })

    const canEditSelected = computed(() => {
      if (itemRef.value) {
        return canEditItem(itemRef.value.typeId, itemRef.value.path)
      } else {
        return true
      }
    })

    const parents = computed(() => {
      const arr = itemPathRef.value.map(elem => { return { disabled: false, to: '/item/' + elem.identifier, text: elem.name[currentLanguage.value.identifier] || '[' + elem.name[defaultLanguageIdentifier.value] + ']' } })
      // arr.push({ disabled: true, text: itemRef.value.name[currentLanguage.value.identifier] || '[' + itemRef.value.name[defaultLanguageIdentifier.value] + ']' })
      return arr
    })

    const itemChangedRef = ref(false)
    function nameInput () {
      router.dataChanged(itemRef.value.identifier + '_name', i18n.t('Router.Changed.Name'))
      itemChangedRef.value = true
    }

    function attrInput () {
      router.dataChanged(itemRef.value.identifier, i18n.t('Router.Changed.Attribute'))
      itemChangedRef.value = true
    }

    async function save () {
      // TODO !!! not working yet https://composition-api.vuejs.org/api.html#template-refs
      for (let i = 0; i < attributeValues.value.length; i++) {
        const attrVal = attributeValues.value[i]
        if (!attrVal.isValid()) return
      }
      if (sourceRelationsListRef.value) await sourceRelationsListRef.value.saveAll()
      if (targetRelationsListRef.value) await targetRelationsListRef.value.saveAll()
      await updateItem(itemRef.value)
      router.clearDataChanged(itemRef.value.identifier + '_name')
      router.clearDataChanged(itemRef.value.identifier)
      itemChangedRef.value = false
      // TODO: use existing table options
      const data = await loadDataFunction({ page: 1, itemsPerPage: 10 })
      childrenLoaded(data.rows, data.count)
      // if (itemsDataTableRef.value) itemsDataTableRef.value.DataChanged()
      if (itemRecordsTable.value) itemRecordsTable.value.DataChanged()
      eventBus.emit('item_changed', itemRef.value)

      const refreshItemAfterSave = getOption(itemType.value, 'refreshItemAfterSave', false)
      if (refreshItemAfterSave) refresh()

      showInfo(i18n.t('Saved'))
    }

    function duplicate () {
      itemDuplicationDialogRef.value.showDialog(itemRef.value)
    }

    function itemDuplicated (itemCopy) {
      itemDuplicationDialogRef.value.closeDialog()
      const parent = itemPathRef.value.length > 0 ? itemPathRef.value[itemPathRef.value.length - 1] : null

      createItem(itemCopy, parent, true).then(() => {
        router.push('/item/' + itemCopy.identifier)
        eventBus.emit('item_selected', itemCopy)
      })
    }

    function move () {
      itemSelectionDialogRef.value.showDialog('move')
    }

    function itemSelectionDialogSelected (id, initiator) {
      itemSelectionDialogRef.value.closeDialog()
      if (initiator !== 'move') {
        const trigger = initiator
        processButtonAction(trigger, id)
      } else { // move
        loadItemsByIds([id], false).then(items => {
          const parent = items[0]
          const parentType = findType(parent.typeId).node
          const tstType = parentType.children.find(elem => (elem.identifier === itemType.value.identifier) || (elem.link === itemType.value.id))
          if (tstType) {
            moveItem(itemRef.value, id).then(() => {
              itemPathRef.value = []
              loadItemPath(itemRef.value.path)
              showInfo(i18n.t('Saved'))
            })
          } else {
            showError(i18n.t('ItemView.Move.WrongParent'))
          }
        })
      }
    }

    async function remove () {
      if (confirm(i18n.t('ItemView.RemoveItem'))) {
        const data = await loadChildren(itemRef.value.internalId, { page: 1, itemsPerPage: 1 })
        if (data.count > 0) {
          showError(i18n.t('ItemView.Remove.HasChildrenError'))
        } else {
          const checkRelationsOnDelete = getOption(itemType.value, 'checkRelationsOnDelete', true)
          const res = !checkRelationsOnDelete ? false : await hasRelations(itemRef.value.internalId)
          if (res) {
            showError(i18n.t('ItemView.Remove.HasRelationsError'))
          } else {
            removeItem(itemRef.value.internalId).then(() => {
              router.push('/')
            })
          }
        }
      }
    }

    function itemSelected (item) {
      totalChildrenRef.value = -1
      hasSources.value = true
      hasTargets.value = true

      loadAssets(item.internalId).then(arr => {
        arr.forEach(elem => {
          elem.type = findType(elem.typeId)?.node
        })
        filesRef.value = arr
      })

      enrichItem(item)

      itemRef.value = item
      itemChangedRef.value = false
      // if (itemsDataTableRef.value) itemsDataTableRef.value.DataChanged()
      if (itemRecordsTable.value) itemRecordsTable.value.DataChanged()
    }

    const tabAttrGroups = ref([])

    function enrichItem (item) {
      const arr = getAttributesForItem(item.typeId, item.path)

      reloadBeforeShowActions(item)
      if (beforeShowActions.length > 0) {
        for (let i = 0; i < beforeShowActions.length; i++) {
          const action = beforeShowActions[i]
          try {
            const utils = {
              canEditItem: () => {
                return canEditItem(item.typeId, item.path)
              }
            }
            // eslint-disable-next-line no-new-func
            const func = new Function('item', 'attributes', 'user', 'roles', 'utils', '"use strict"; ' + action.code)
            func(item, arr, currentUserRef.value, currentRoles, utils)
          } catch (err) {
            console.error('Failed to evaluate expression: "' + action.code + '" for action: ' + action.identifier, err)
          }
        }
      }

      attrGroups.value = arr.filter(group => {
        if (!group.visible) return false
        const expr = getOption(group, 'visible', null)
        if (expr) {
          try {
            const utils = {
              canEditItem: () => {
                return canEditItem(item.typeId, item.path)
              }
            }
            // eslint-disable-next-line no-new-func
            const func = new Function('item', 'group', 'user', 'roles', 'utils', '"use strict"; return (' + expr + ')')
            return func(item, group, currentUserRef.value, currentRoles, utils)
          } catch (err) {
            console.error('Failed to evaluate expression: "' + expr + '" for group: ' + group.identifier, err)
            return false
          }
        } else {
          return true
        }
      })

      tabAttrGroups.value = [
        {
          identifier: i18n.t('ItemView.Tab.Attributes'),
          groups: attrGroups.value
        }
      ]

      const groupedByItemTabName = attrGroups.value.reduce((acc, group) => {
        const itemTabName = getOption(group, 'itemTabName', null)
        if (itemTabName) {
          if (!acc[itemTabName]) {
            acc[itemTabName] = []
            groupPanels.value.push([])
          }
          acc[itemTabName].push(group)
        }
        return acc
      }, {})

      Object.entries(groupedByItemTabName).forEach(([key, groups]) => {
        tabAttrGroups.value.push({
          identifier: key,
          groups
        })
      })

      if (tabAttrGroups.value.length > 0) {
        const firstGroup = tabAttrGroups.value[0]
        firstGroup.groups = firstGroup.groups.filter(group => !getOption(group, 'itemTabName', null))
      }

      if (!item.values) item.values = {}
      let tabGrpIdx = 0
      for (const tabAttrGroup of tabAttrGroups.value) {
        let grpIdx = 0
        tabAttrGroup.groups.forEach(group => {
          const expandTst = getOption(group, 'openByDefault', null)
          if (expandTst) groupPanels.value[tabGrpIdx].push(grpIdx)
          grpIdx++

          group.itemAttributes.forEach(attr => {
            let attrValue = getOption(attr, 'default', null)
            if (attrValue && attr.lov) attrValue = parseInt(attrValue)
            const isMultivalue = getOption(attr, 'multivalue', false)
            if (item.values[attr.identifier] === null || item.values[attr.identifier] === undefined) {
              if (attr.languageDependent) {
                item.values[attr.identifier] = {}
                item.values[attr.identifier][currentLanguage.value.identifier] = attrValue
              } else {
                item.values[attr.identifier] = attrValue
              }
            } else if (attr.languageDependent && typeof item.values[attr.identifier] !== 'object') {
            // attr was changed to languageDependent and it has old data that must be cleared
              item.values[attr.identifier] = {}
              item.values[attr.identifier][currentLanguage.value.identifier] = attrValue
            } else if (!attr.languageDependent && !Array.isArray(item.values[attr.identifier]) && typeof item.values[attr.identifier] === 'object') {
            // attr was changed to NOT languageDependent and it has old data that must be cleared
              item.values[attr.identifier] = null
            }

            if (attr.type === AttributeType.URL) {
              if (!item.values[attr.identifier + '_text']) {
                if (attr.languageDependent) {
                  item.values[attr.identifier + '_text'] = {}
                  item.values[attr.identifier + '_text'][currentLanguage.value.identifier] = ''
                } else {
                  item.values[attr.identifier + '_text'] = ''
                }
              } else if (attr.languageDependent && typeof item.values[attr.identifier + '_text'] !== 'object') {
              // attr was changed to languageDependent and it has old data that must be cleared
                item.values[attr.identifier + '_text'] = {}
                item.values[attr.identifier + '_text'][currentLanguage.value.identifier] = ''
              } else if (!attr.languageDependent && typeof item.values[attr.identifier + '_text'] === 'object') {
              // attr was changed to NOT languageDependent and it has old data that must be cleared
                item.values[attr.identifier + '_text'] = null
              }
            } else if (attr.type === AttributeType.Date) {
            // check that date is right
              const val = attr.languageDependent ? item.values[attr.identifier][currentLanguage.value.identifier] : item.values[attr.identifier]
              if (Object.prototype.toString.call(val) !== '[object String]') {
                if (attr.languageDependent) {
                  item.values[attr.identifier] = {}
                  item.values[attr.identifier][currentLanguage.value.identifier] = ''
                } else {
                  item.values[attr.identifier] = ''
                }
              }
            } else if ((attr.type === AttributeType.LOV || attr.type === AttributeType.Relation) && isMultivalue) {
              let val = item.values[attr.identifier]
              if (val !== null && val !== undefined) {
                if (!Array.isArray(val)) {
                  val = [val]
                }
                // remove null and Nan values from array if we have it
                item.values[attr.identifier] = val.filter(elem => elem !== null && !isNaN(parseInt(elem)))
                for (let i = 0; i < item.values[attr.identifier].length; i++) {
                  const val = item.values[attr.identifier][i]
                  if (typeof val === 'string' || val instanceof String) item.values[attr.identifier][i] = parseInt(val)
                }
              }
            } else if ((attr.type === AttributeType.LOV || attr.type === AttributeType.Relation) && !isMultivalue) {
              const val = item.values[attr.identifier]
              if (val && Array.isArray(val) && val.length) {
                item.values[attr.identifier] = val[0]
              } else if (typeof val === 'string' || val instanceof String) {
                item.values[attr.identifier] = parseInt(val)
              }
            }
          })
        })
        tabGrpIdx++
      }
    }

    function loadItemPath (path) {
      const arr = path.split('.')
      if (arr.length > 1) {
        arr.pop()
        loadItemsByIds(arr, true).then((data) => { itemPathRef.value = data })
      }
    }

    function executeAction (trigger) {
      if (trigger.askBeforeExec) {
        if (!confirm(i18n.t('Execute') + '?')) return
      }
      if (trigger.selectItems) {
        itemSelectionDialogRef.value.showDialog(trigger, trigger.selectItemsFilter ? trigger.selectItemsFilter.split(',').map(elem => parseInt(elem)) : null)
      } else {
        processButtonAction(trigger)
      }
    }

    async function processButtonAction (trigger, itemId) {
      buttonActionStatusDialog.value.showDialog()
      await executeButtonAction(itemRef.value.internalId, trigger.itemButton, itemId).then((result) => {
        if (result.data) {
          if (result.data.removeItem) {
            removeItemFromTree(result.data.removeItem)
          }
          if (result.data.reloadItem) {
            refresh()
          }
          if (result.data.createItem) {
            createItemInTree(result.data.createItem.item, result.data.createItem.parent)
            eventBus.emit('item_selected', result.data.createItem.item)
          }
          if (result.data.router) {
            router.push(result.data.router)
          }
          if (result.data.openUrl) {
            window.open(result.data.openUrl)
          }
        }
        if (result.compileError) {
          showError('Compile error: ' + result.compileError)
        } else if (result.error) {
          showError(result.error)
        } else if (result.message) {
          showInfo(result.message)
        } else {
          showInfo(i18n.t('Started'))
        }
      }).finally(() => {
        buttonActionStatusDialog.value.closeDialog()
      })
      buttonActionStatusDialog.value.closeDialog()
    }

    function getOption (attr, name, defaultValue) {
      if (attr.options) {
        const tst = attr.options.find(elem => elem.name === name)
        if (tst) {
          if (tst.value === 'null') return null
          if (tst.value === 'true') return true
          if (tst.value === 'false') return false
          return tst.value
        }
      }
      return defaultValue
    }

    watch(route, (current, previous) => {
      if (previous && current && current.params && current.params.id) {
        itemPathRef.value = []
        loadItemByIdentifier(current.params.id).then((item) => {
          loadItemPath(item.path)
          itemSelected(item)
        })
      } else {
        itemRef.value = null
      }
    })

    // we calculate margin from the top of the page. it allows us to set fixed table height.
    watch(tabsContainerRef, () => {
      if (tabsContainerRef.value) {
        dataTableMarginTop.value = tabsContainerRef.value.getBoundingClientRect().bottom
      }
    })

    function submit () {
      chanSelectionDialogRef.value.showDialog()
    }

    function channelsSelected (arr) {
      chanSelectionDialogRef.value.closeDialog()
      if (arr.length === 0) return
      submitItem(itemRef.value.internalId, itemRef.value.typeId, itemRef.value.path, arr, itemRef.value).then(() => {
        showInfo(i18n.t('Submitted'))
      })
    }

    function submitToCollcetion () {
      collSelectionDialogRef.value.showDialog()
    }

    function collectionsSelected (collectionId) {
      collSelectionDialogRef.value.closeDialog()
      submitItemToCollection(itemRef.value.internalId, collectionId).then(() => {
        showInfo(i18n.t('Collections.Submitted'))
      })
    }

    function showAttributesShowDialog (type) {
      showAttributesDialogRef.value.showDialog(itemRef.value, type)
    }

    function showAttributes () {
      showAttributesDialogRef.value.closeDialog()
    }

    const hasChannels = computed(() => {
      if (itemRef.value) {
        const pathArr = itemRef.value.path.split('.')

        for (let i = 0; i < awailableChannelsRef.value.length; i++) {
          const channel = awailableChannelsRef.value[i]
          const result = channel.valid.includes(itemRef.value.typeId) && channel.visible.find(elem => pathArr.includes(elem))
          if (result) return true
        }
      }
      return false
    })

    function syncItem (channel) {
      if (confirm('Запустить синхронизацию?')) triggerChannel(channel.internalId, { sync: true, item: itemRef.value.internalId })
    }

    function removeChannel (channel) {
      if (confirm(i18n.t('Config.Channels.ConfirmRemove'))) {
        const channels = itemRef.value.channels
        channels[channel.identifier].is_deleted = true
        updateItemChannels(itemRef.value, channels)
      }
    }

    async function refreshChannels () {
      if (itemRef.value && channelsOnHead.value.length > 0) {
        const channels = await loadItemChannels(itemRef.value.identifier)
        itemRef.value.channels = channels
      }
    }

    function toTop () {
      goTo(0)
    }

    function getGaleryFile (i, j) {
      const pageLength = parseInt(getOption(itemType.value, 'galeryPageLength', '1'))
      if (pageLength === 1) return filesRef.value[i + j]

      const oneSide = (pageLength - 1) / 2
      const sum = i + j
      if (sum < oneSide) {
        return filesRef.value[filesRef.value.length - oneSide + sum]
      } else if (sum >= filesRef.value.length + oneSide) {
        return filesRef.value[sum - oneSide - filesRef.value.length]
      } else {
        return filesRef.value[sum - oneSide]
      }
    }

    function refresh () {
      if (itemRef.value) {
        loadItemByIdentifier(itemRef.value.identifier).then((item) => {
          loadItemPath(item.path)
          itemSelected(item)
        })
      }
    }

    let timer
    onMounted(() => {
      window.addEventListener('keydown', hotkey)
      timer = setInterval(refreshChannels, 60000)
      Promise.all([loadAllLanguages(), loadAllChannels()]).then(() => {
        const channels = getAvailableChannels(false)
        channels.sort((a, b) => {
          const aName = '' + (a.name[currentLanguage.value.identifier] || a.name[defaultLanguageIdentifier.value])
          const bName = '' + (b.name[currentLanguage.value.identifier] || b.name[defaultLanguageIdentifier.value])
          return aName.localeCompare(bName)
        })
        awailableChannelsRef.value = channels
      })
      searchEntityRef.value = 'ITEM'
      Promise.all([
        checkAuditEnabled(),
        loadAllActions(),
        loadAllAttributes(),
        loadAllRelations(),
        loadAllTypes(),
        loadAllTemplates()]).then(() => {
        if (route.value && route.value.params && route.value.params.id) {
          itemPathRef.value = []
          loadItemByIdentifier(route.value.params.id).then((item) => {
            canViewAttrConfigRef.value = canViewConfig('attributes')
            loadItemPath(item.path)
            itemSelected(item)
          })
        }
      })
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', hotkey)
      clearInterval(timer)
    })

    function hotkey (event) {
      if ((event.ctrlKey || event.metaKey) && !(event.altKey) && (event.keyCode === 83 || event.keyCode === 115)) { // CTRL-S
        if (canEditSelected.value) {
          event.preventDefault()
          save()
        }
      }
    }

    let where = null
    function loadDataFunction (options) {
      const tmp = new Promise((resolve, reject) => {
        if (!options) return
        if (where) {
          searchItems(where, options)
            .then((data) => resolve(data))
            .catch((error) => showError(error))
        } else {
          loadChildren(itemRef.value.id, options).then(data => resolve(data))
        }
      })
      tmp.where = { parentIdentifier: itemRef.value.identifier }
      tmp.applyFilter = (newWhere) => {
        where = newWhere
      }
      return tmp
    }

    const headAttributesKeyRef = ref(1)
    const lovsMap = {}
    function getLOVValue (attr) {
      const values = lovsMap[attr.lov]
      if (values) {
        const attrValue = attr.languageDependent ? itemRef.value.values[attr.identifier][currentLanguage.value.identifier] : itemRef.value.values[attr.identifier]
        if (Array.isArray(attrValue)) { // multivalue attribute
          let result = ''
          for (let i = 0; i < attrValue.length; i++) {
            const val = attrValue[i]
            const elem = values.find(elem => elem.id === val)
            result += elem ? (elem.value[currentLanguage.value.identifier] || elem.value[defaultLanguageIdentifier.value]) : attrValue
            if (i !== attrValue.length - 1) result += ', '
          }
          return result
        } else {
          const elem = values.find(elem => elem.id === attrValue)
          return elem ? (elem.value[currentLanguage.value.identifier] || elem.value[defaultLanguageIdentifier.value]) : attrValue
        }
      } else {
        getLOVData(attr.lov).then(values => {
          lovsMap[attr.lov] = values
          headAttributesKeyRef.value++
        })
        return null
      }
    }

    return {
      buttonActionStatusDialog,
      AttributeType,
      executeAction,
      buttonActions,
      templates,
      buttonTemplates,
      executeTemplate,
      itemRef,
      parents,
      tabRef,
      attrGroups,
      tabAttrGroups,
      nameInput,
      attrInput,
      save,
      move,
      duplicate,
      remove,
      showInNavigationTree,
      isImage,
      isFile,
      currentLanguage,
      defaultLanguageIdentifier,
      canEditSelected,
      attributeValues,
      fileRef,
      removeFile,
      upload,
      imageKeyRef,
      filesRef,
      getGaleryFile,
      getAttrRange,
      getTableRowsCount,
      mainImage,
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/',
      token: localStorage.getItem('token'),
      loadDataFunction,
      itemsDataTableRef,
      itemRecordsTable,
      itemType,
      hasSources,
      hasTargets,
      totalChildrenRef,
      childrenLoaded,
      sourcesLoaded,
      targetsLoaded,
      itemSelectionDialogRef,
      itemSelectionDialogSelected,
      fileUploadDialogRef,
      linkNewFile,
      hasFileUpload,
      itemDuplicationDialogRef,
      itemDuplicated,
      auditEnabled,
      getOption,
      historyTableRef,
      hasAccess,
      awailableChannelsRef,
      channelsOnHead,
      hasChannels,
      submit,
      submitToCollcetion,
      showAttributesShowDialog,
      chanSelectionDialogRef,
      collSelectionDialogRef,
      showAttributesDialogRef,
      channelsSelected,
      collectionsSelected,
      showAttributes,
      dateFormat,
      headAttributesKeyRef,
      getLOVValue,
      getChannelFactory,
      syncItem,
      itemChangedRef,
      refreshChannels,
      sourceRelationSearch,
      targetRelationSearch,
      getRelationSearchName,
      performRelationSearch,
      toTop,
      tabsMode,
      tableMode,
      attrTabRef,
      headerAttrs,
      toggleTabsMode,
      toggleTableMode,
      tabsContainerRef,
      dataTableMarginTop,
      refresh,
      removeChannel,
      canViewAttrConfigRef,
      sourceRelationsListRef,
      targetRelationsListRef,
      groupPanels,
      customEnableButton,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT,
      nameRules: [
        v => !!v || i18n.t('ItemCreationDialog.NameRequired')
      ]
    }
  }
}
</script>
