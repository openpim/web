<!-- eslint-disable eqeqeq -->
<template>
<div class="mb-10">
  <h3>{{ $t(searchHeader) }}</h3>
  <v-toolbar dense elevation="1" class="mt-2">
      <v-select dense v-if="savedOptionsVisible()" v-model="savedColumnsSelectionRef" :items="savedColumnsOptionsRef"></v-select>
      <v-spacer></v-spacer>
      <v-tooltip top v-if="item">
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="openSearch"><v-icon>mdi-text-search</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.OpenSearch') }}</span>
      </v-tooltip>
      <v-tooltip top v-if="!talendExportSelection && exportXLSEnabled">
        <template v-slot:activator="{ on }">
          <v-btn icon :disabled="!totalItemsRef" v-on="on" @click="exportExcel"><v-icon>mdi-application-export</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.ExportExcel') }}</span>
      </v-tooltip>
      <v-tooltip top v-if="!talendExportSelection && importXLSEnabled">
        <template v-slot:activator="{ on }">
          <v-btn icon :disabled="!totalItemsRef" v-on="on" @click="importConfigDialogRef = true"><v-icon>mdi-application-import</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.ImportExcel') }}</span>
      </v-tooltip>
      <v-tooltip top  v-if="talendExportSelection || (searchEntityRef !== 'ITEM_RELATION' && hasAccess('exportCSV'))">
        <template v-slot:activator="{ on }">
          <v-btn icon :disabled="!totalItemsRef" v-on="on" @click="exportData"><v-icon>mdi-export</v-icon></v-btn>
        </template>
        <span>{{  talendExportSelection ? $t('DataTable.TalendExportSelection') : $t('DataTable.ExportCSV') }}</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="editHeaders"><v-icon>mdi-table-settings</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.SelectColumns') }}</span>
      </v-tooltip>
      <v-tooltip top v-if="attrGroupsBtnVisible">
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="selectAttrGroups"><v-icon>mdi-table-plus</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.SelectGroups') }}</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="DataChanged()"><v-icon>mdi-refresh</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.Refresh') }}</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="columnsSaveDialogRef.showDialog(headersRef)"><v-icon>mdi-content-save</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.SaveColumns') }}</span>
      </v-tooltip>
      <v-tooltip top v-if="!hasChannelsRef">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="collSelectionDialogRef.showDialog()"><v-icon>mdi-access-point-plus</v-icon></v-btn>
        </template>
        <span>{{ $t('Item.toCollection') }}</span>
      </v-tooltip>
      <template v-if="hasChannelsRef && searchEntityRef !== 'ITEM_RELATION'">
        <v-menu offset-y>
          <template v-slot:activator="{ on }"><v-btn v-on="on" icon><v-icon>mdi-access-point-plus</v-icon></v-btn></template>
          <v-list>
            <v-list-item >
              <v-btn class="pl-1 pr-1" text @click="chanSelectionDialogRef.showDialog()" v-text="$t('Item.toChannel')"></v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn class="pl-1 pr-1" text @click="collSelectionDialogRef.showDialog()" v-text="$t('Item.toCollection')"></v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <v-tooltip top v-if="searchEntityRef !== 'ITEM_RELATION'">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="collSelectionDialogRef.showDialog(true)"><v-icon>mdi-access-point-minus</v-icon></v-btn>
        </template>
        <span>{{ $t('Collections.DeleteFromCollection') }}</span>
      </v-tooltip>
      <template v-if="headersStorageName === 'item_headers' && buttonActions && buttonActions.length > 0">
        <v-menu offset-y>
          <template v-slot:activator="{ on: menu, attrs }">
            <v-tooltip top>
              <template v-slot:activator="{ on: tooltip }">
                <v-btn icon v-bind="attrs" v-on="{ ...tooltip, ...menu }"><v-icon>mdi-gesture-tap-button</v-icon></v-btn>
              </template>
              <span>{{ $t('DataTable.Actions') }}</span>
            </v-tooltip>
          </template>
            <v-list style="max-height:500px;overflow-y:auto">
              <v-list-item v-for="(trigger, i) in buttonActions" :key="i" @click="executeAction(trigger)">
                <v-list-item-title>{{trigger.itemButton}}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
      </template>
      <v-tooltip top v-if="collection">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="deleteFromCollection"><v-icon>mdi-trash-can</v-icon></v-btn>
        </template>
        <span>{{ $t('Collections.DeleteFromCollection') }}</span>
      </v-tooltip>
      <v-tooltip top v-if="optionsTemplates">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="tempSelectionDialogRef.showDialog()"><v-icon>mdi-file-edit-outline</v-icon></v-btn>
        </template>
        <span>{{ $t('DataTable.ApplyTemplate') }}</span>
      </v-tooltip>
      <AfterButtonsComponent :headers="headersRef" :columnsSelected="columnsSelected" :items="itemsRef" :loadData="loadData" :processButtonAction="processButtonAction" :whereFunc="getTableWhere"></AfterButtonsComponent>
    </v-toolbar>
  <v-data-table @update:options="optionsUpdate"
      :options="optionsRef"
      :server-items-length="totalItemsRef"
      :loading="loadingRef"
      :headers="headersRef"
      :items="itemsRef"
      :index="itemsRef.length"
      :height="'calc(100vh - '+ (parseInt(marginTop) + 220) +'px)'"
      hide-default-footer
      hide-default-header
      item-key="identifier"
      :show-select="!!collection"
      class="elevation-1">

    <template v-slot:header="{ props }">
      <tr @mouseup="divMouseUp" @mousemove="divMouseMove">
        <th v-for="header in props.headers" :key="header.identifier" class="dataTableHeader">
            <span class="ml-1 mr-1 subtitle-2" style="white-space:normal">{{header.text}}</span>
            <v-btn small v-if="header.sortable" icon @click="headerSort(header)">
              <v-icon small>{{ header.icon || 'mdi-arrow-up-down'}}</v-icon>
            </v-btn>
            <v-btn small icon @click="showMassUpdateDialog(header)" v-if="typeof (header.identifier) !== 'undefined'
              && header.identifier !== 'id'
              && header.identifier !== 'identifier'
              && header.identifier !== 'parentIdentifier'
              && header.identifier !== 'itemIdentifier'
              && header.identifier !== 'targetIdentifier'
              && header.identifier !== '#parentName#'
              && header.identifier !== '#sourceParentName#'
              && header.identifier !== '#targetParentName#'
              && header.identifier !== '#thumbnail#'
              && header.identifier !== 'createdAt'
              && header.identifier !== 'updatedAt'
              && header.identifier !== 'createdBy'
              && header.identifier !== 'updatedBy'
              && header.identifier !== 'typeIdentifier'
              && !header.identifier.startsWith('#channel_')"><v-icon small>{{ 'mdi-rename-box' }}</v-icon></v-btn>
            <div @mouseover="divMouseOver" @mouseleave="divMouseLeave" @mousedown="divMouseDown" class="resizer"></div>
            <div v-if="header.identifier !== '#thumbnail#' && header.identifier !== '#parentName#' &&  header.identifier !== '#sourceParentName#' && header.identifier !== '#targetParentName#'">
              <input v-if="!header.lov && header.type !== AttributeType.Relation" type="text" style="border: solid; border-color: grey; border-width: 1px" v-model="header.filter" @input="filterChanged(header)"/>
              <v-autocomplete v-if="header.lov && header.type !== AttributeType.Relation " v-model="header.filter" :items="getLOVItems(header.lov)" dense clearable class="ml-2 mr-2" @input="filterChanged(header)"></v-autocomplete>
              <RelationAttributeSearchComponent v-if="header.type === AttributeType.Relation" :attrIdentifier="header.identifier.substring(5)" v-model="header.filter" @input="filterChanged(header)" />
            </div>
        </th>
      </tr>
    </template>
    <template v-slot:footer="{ props }">
          <v-divider class="pb-3"></v-divider>
          <v-container class="pa-0 pl-4">
            <v-row>
              <v-col cols="2" class="pb-0">
                <v-text-field type="number" v-model="pageSize" :label="$t('ItemRelationsList.RowsPerPage')" required :rules="[required, pageSizePositive]" @change="pageSizeChanged"></v-text-field>
              </v-col>
              <v-col cols="2" class="mt-5 pb-0">
                <span>{{ $t('ItemRelationsList.TotalRows') + ' ' + props.pagination.itemsLength}}</span>
              </v-col>
              <v-col cols="8" class="mt-1 pb-0">
                <template v-if="pageSize && pageSize !== '0'">
                  <v-pagination @input="pageChanged" v-model="tableFooterRef" :length="props.pagination.pageCount" :total-visible="11"></v-pagination>
                </template>
              </v-col>
            </v-row>
          </v-container>
    </template>
    <template v-slot:item="{ item, headers }">
      <tr @mouseup="divMouseUp" @mousemove="divMouseMove" class="zebra">
        <td v-for="(header, i) in headers" :key="i" @click="cellClicked(item, header)" class="truncate p-1">

          <template v-if="header.value === 'data-table-select'">
            <v-checkbox v-model="item.selected" required></v-checkbox>
          </template>

          <router-link v-if="header.identifier === 'identifier' && searchEntityRef !== 'ITEM_RELATION'" :to="'/item/' + item.identifier">{{ item.identifier }}</router-link>
          <router-link v-if="header.identifier === 'parentIdentifier' && searchEntityRef !== 'ITEM_RELATION'" :to="'/item/' + item.parentIdentifier">{{ item.parentIdentifier }}</router-link>
          <router-link v-if="header.identifier === 'itemIdentifier'" :to="'/item/' + item.itemIdentifier">{{ item.itemIdentifier }}</router-link>
          <router-link v-if="header.identifier === 'targetIdentifier'" :to="'/item/' + item.targetIdentifier">{{ item.targetIdentifier }}</router-link>
          <template v-if="header.identifier === 'identifier' && searchEntityRef === 'ITEM_RELATION' && (!inplaceItem || (item.identifier != inplaceItem.identifier || header.identifier != inplaceHeader.identifier))">
            <v-icon v-if="getValue(item, header) === true">mdi-check</v-icon>
            <span v-else>{{ getValue(item, header) }}</span>
          </template>

          <span v-if="header.identifier === '#parentName#'">{{ getParentName(item) }}</span>
          <span v-if="header.identifier === '#sourceParentName#'">{{ getParentNameByItemId(item.itemId) }}</span>
          <span v-if="header.identifier === '#targetParentName#'">{{ getParentNameByItemId(item.targetId) }}</span>

          <a v-if="header.identifier === '#thumbnail#' && getThumbnail(item.id)" :href="damUrl + 'asset/' + getThumbnail(item.id).id + '?inline=true&token=' + token" target="_blank"><img style="max-width: 100%; height: auto;" :src="damUrl + 'asset/' + getThumbnail(item.id).id + '/thumb?token=' + token" contain max-width="300" max-height="300"/></a>

          <template v-if="typeof (header.identifier) !== 'undefined' && !header.identifier.startsWith('#channel_') && header.type !== 9 && header.identifier !== 'identifier' && header.identifier !== 'parentIdentifier' && header.identifier != 'itemIdentifier' && header.identifier != 'targetIdentifier' && header.identifier !== '#parentName#' && header.identifier !== '#sourceParentName#' && header.identifier !== '#targetParentName#' &&  header.identifier !== '#thumbnail#' && (!inplaceItem || (item.identifier != inplaceItem.identifier || header.identifier != inplaceHeader.identifier))">
            <v-icon v-if="getValue(item, header) === true">mdi-check</v-icon>
            <span v-else> {{ getValue(item, header) }}</span>
          </template>

          <template v-if="typeof (header.identifier) !== 'undefined' && !header.identifier.startsWith('#channel_') && header.type === AttributeType.Relation && header.identifier !== 'identifier' && header.identifier !== 'parentIdentifier' && header.identifier != 'itemIdentifier' && header.identifier != 'targetIdentifier' && header.identifier !== '#parentName#' && header.identifier !== '#sourceParentName#' && header.identifier !== '#targetParentName#' &&  header.identifier !== '#thumbnail#' && (!inplaceItem || (item.identifier != inplaceItem.identifier || header.identifier != inplaceHeader.identifier))">
            <v-chip v-for="(val, i) in getValueForRelationAttribute(header, item, relationAttributesItemsRef)" class="ma-2" @click.stop="goto('#/item/' + val.identifier)" text-color="black" :key="i">
              <v-avatar left tile v-if="val.imageUrl">
                <v-img :src="val.imageUrl"></v-img>
              </v-avatar>
              {{ val.text }}
            </v-chip>
          </template>

          <template v-if="typeof (header.identifier) !== 'undefined' && header.identifier.startsWith('#channel_')">
            <template v-if="!getValue(item, header)"></template>
            <template v-else>
              <template v-if="getValue(item, header) === 1"><v-chip class="ma-2" color="" text-color="black"> {{$t('ItemView.Channels.Submitted')}}</v-chip></template>
              <template v-if="getValue(item, header) === 2"><v-chip class="ma-2" color="green" text-color="white"> {{$t('ItemView.Channels.Synced')}}</v-chip></template>
              <template v-if="getValue(item, header) === 3"><v-chip class="ma-2" color="red" text-color="white"> {{$t('ItemView.Channels.Error')}}</v-chip></template>
              <template v-if="getValue(item, header) === 4"><v-chip class="ma-2" color="indigo" text-color="white"> {{$t('ItemView.Channels.Waiting')}}</v-chip></template>
              <span v-if="header.identifier.endsWith('_submittedAt')  || header.identifier.endsWith('_syncedAt')">{{ dateFormat(new Date(getValue(item, header)), DATE_FORMAT) }}</span>
              <span v-if="header.identifier.endsWith('_submittedBy')">{{ getValue(item, header) }}</span>
              <span v-if="header.identifier.endsWith('_message')">{{ getValue(item, header) }}</span>
            </template>
          </template>

          <template v-if="typeof (header.identifier) !== 'undefined' && !header.identifier.startsWith('#channel_') && inplaceItem && item.identifier === inplaceItem.identifier && header.identifier === inplaceHeader.identifier">
            <!-- Text, Integer, Float, URL-->
            <v-textarea v-if="!inplaceAttribute || inplaceAttribute.type===AttributeType.Text" @blur="inplaceBlur" auto-grow no-resize autofocus dense v-model="inplaceValue" required></v-textarea>
            <v-text-field v-if="inplaceAttribute && (inplaceAttribute.type===AttributeType.Integer || inplaceAttribute.type===AttributeType.Float || inplaceAttribute.type===AttributeType.URL)"
              :type="(inplaceAttribute.type===AttributeType.Integer || inplaceAttribute.type===AttributeType.Float) ? 'number' : 'text'"
              @blur="inplaceBlur" autofocus dense v-model="inplaceValue" required></v-text-field>
            <!-- Boolean-->
            <v-checkbox v-if="inplaceAttribute && inplaceAttribute.type===AttributeType.Boolean" @click.stop="inplaceBlur" autofocus dense v-model="inplaceValue" required></v-checkbox>
            <!-- LOV-->
            <v-autocomplete :chips="inplaceMultivalue" :deletable-chips="inplaceMultivalue" :multiple="inplaceMultivalue" v-if="inplaceAttribute && inplaceAttribute.type===AttributeType.LOV" @blur="inplaceBlur" @click.stop="" autofocus dense v-model="inplaceValue" required :items="inplaceLovSelection"></v-autocomplete>
            <!-- Date-->
            <v-menu v-model="dateMenu" v-if="inplaceAttribute && inplaceAttribute.type===AttributeType.Date" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
              <template v-slot:activator="{ on }">
                <v-text-field v-model="inplaceValue" autofocus prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="inplaceValue" @input="dateMenu = false; inplaceBlur()"></v-date-picker>
            </v-menu>
            <!-- Time-->
            <v-menu ref="timeMenuRef" v-if="inplaceAttribute && inplaceAttribute.type===AttributeType.Time" v-model="timeMenu" :close-on-content-click="false" :nudge-right="40" :return-value.sync="time" transition="scale-transition" offset-y max-width="290px" min-width="290px">
              <template v-slot:activator="{ on }">
                <v-text-field v-model="inplaceValue" autofocus prepend-icon="mdi-clock-outline" readonly v-on="on"></v-text-field>
              </template>
              <v-time-picker v-if="timeMenu" v-model="values[attr.identifier]" format="24hr" full-width @click:minute="timeMenuRef.save(time); inplaceBlur()"></v-time-picker>
            </v-menu>
          </template>
        </td>
      </tr>
    </template>
  </v-data-table>
  <ColumnsSelectionDialog ref="columnsSelectionDialogRef" @selected="columnsSelected" :getColumns="getAvailableColumns" />
  <ChannelsSelectionDialog ref="chanSelectionDialogRef" :multiselect="true" :editAccessOnly="true" @selected="channelsSelected"/>
  <TemplatesSelectionDialog ref="tempSelectionDialogRef" :dataTable="true" :multiselect="true" :editAccessOnly="true" @selected="templateSelected"/>
  <CollectionsSelectionDialog ref="collSelectionDialogRef" :editAccessOnly="true" @selected="collectionsSelected" @delete="deleteFromCollections"/>
  <ColumnsSaveDialog ref="columnsSaveDialogRef" @changed="loadColumns(true)"/>
  <AttrGroupsSelectionDialog ref="attrSelectionDialogRef" :multiselect="true" @selected="attrGroupsSelected"/>
  <ActionStatusDialog ref="buttonActionStatusDialog" />
    <template>
      <v-row justify="center">
        <v-dialog v-model="excelDialogRef" persistent width="80%">
          <v-card>
            <v-card-title>
              <span class="headline">{{ excelDialogTitleRef }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-progress-linear v-model="excelDialogProgressRef" color="primary" height="25">
                      <template v-slot:default="{ value }">
                        <strong>{{ Math.ceil(value) }}%</strong>
                      </template>
                    </v-progress-linear>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="excelDialogClose">{{ $t('Cancel') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <template>
      <v-row justify="center">
        <v-dialog v-model="importFinishedDialogRef" persistent width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('DataTable.ExcelImport.Finished') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" class="d-flex justify-center align-center">
                    {{ $t('DataTable.ExcelImport.FinishedText', {count: importFinishedLogRef.length-1}) }}
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="d-flex justify-center align-center">
                    <v-btn color="blue darken-1" text @click="downloadImportFinishedLog">{{ $t('DataTable.ExcelImport.Report') }}</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="importFinishedDialogRef=false">{{ $t('Close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <template>
      <v-row justify="center">
        <v-dialog v-model="importConfigDialogRef" persistent width="80%">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('DataTable.ExcelImport.Config') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-file-input chips show-size v-model="fileUploadRef" :label="$t('DataTable.ExcelImport.FileUpload')"></v-file-input>
                    <v-select v-model="importModeRef" :items="importModes" :label="$t('DataTable.ExcelImport.ImportMode')"></v-select>
                    <v-checkbox v-model="importStopOnErrorRef" :label="$t('DataTable.ExcelImport.ErrorStop')" required></v-checkbox>
                    <v-checkbox v-model="importEmptyValuesRef" :label="$t('DataTable.ExcelImport.EmptyValues')" required></v-checkbox>
                    <v-text-field type="number" v-model="importPageSizeRef" :label="$t('DataTable.ExcelImport.PageSize')" required></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="fileUploadRef=null;importConfigDialogRef=false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text @click="importExcel" :disabled="!fileUploadRef || importPageSizeRef <= 0">{{ $t('DataTable.ExcelImport.Start') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
    <template>
      <v-row justify="center">
        <v-dialog v-model="massUpdateDialogRef" persistent width="80%">
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('DataTable.MassUpdateDialog.Title') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-if="massUpdateHeaderRef && !massUpdateHeaderRef.lov && massUpdateHeaderRef.type !== AttributeType.Relation" type="text" v-model="massUpdateInputRef" :label="$t('DataTable.MassUpdateDialog.EnterValue')" required/>
                    <v-autocomplete :multiple="massUpdateHeaderRef.multivalue" v-if="massUpdateHeaderRef && massUpdateHeaderRef.lov && massUpdateHeaderRef.type !== AttributeType.Relation" v-model="massUpdateInputRef" :items="getLOVItems(massUpdateHeaderRef.lov)" clearable required :label="$t('DataTable.MassUpdateDialog.SelectValue')"></v-autocomplete>
                    <RelationAttributeSearchComponent :multiple="massUpdateHeaderRef.multivalue" v-if="massUpdateHeaderRef && massUpdateHeaderRef.type === AttributeType.Relation" :attrIdentifier="massUpdateHeaderRef.identifier.substring(5)" v-model="massUpdateInputRef" required :label="$t('DataTable.MassUpdateDialog.SelectValue')"/>
                    <v-radio-group v-model="massUpdateActionRef" v-if="massUpdateHeaderRef && massUpdateHeaderRef.multivalue">
                      <v-radio :label="$t('DataTable.MassUpdateDialog.Replace')" value="1"></v-radio>
                      <v-radio :label="$t('DataTable.MassUpdateDialog.Add')" value="2"></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-expansion-panels flat focusable>
                      <v-expansion-panel>
                        <v-expansion-panel-header>{{ $t('DataTable.MassUpdateDialog.Additionally') }}</v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-container class="pa-0">
                            <v-row no-gutters>
                              <v-checkbox v-model="massUpdateSkipActionsRef" :label="$t('DataTable.MassUpdateDialog.SkipActons')"></v-checkbox>
                            </v-row>
                            <v-row no-gutters>
                              <v-text-field type="number" v-model="massUpdatePageSizeRef" :label="$t('DataTable.MassUpdateDialog.PageSize')"></v-text-field>
                            </v-row>
                          </v-container>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="massUpdateDialogRef=false">{{ $t('Cancel') }}</v-btn>
              <v-btn color="blue darken-1" text @click="massUpdate">{{ $t('DataTable.MassUpdateDialog.Button.Start') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
</div>
</template>
<script>
import { saveAs } from 'file-saver'
import * as langStore from '../store/languages'
import * as itemStore from '../store/item'
import * as lovsStore from '../store/lovs'
import * as errorStore from '../store/error'
import * as userStore from '../store/users'
import * as searchStore from '../store/search'
import * as attrStore from '../store/attributes'
import * as channelsStore from '../store/channels'
import * as collectionsStore from '../store/collections'
import * as tempStore from '../store/templates'
import * as typesStore from '../store/types'
import * as actionsStore from '../store/actions'
import i18n from '../i18n'
import { ref, onMounted, watch, computed } from '@vue/composition-api'
import ColumnsSelectionDialog from './ColumnsSelectionDialog'
import ColumnsSaveDialog from './ColumnsSaveDialog'
import ChannelsSelectionDialog from './ChannelsSelectionDialog'
import TemplatesSelectionDialog from './TemplatesSelectionDialog'
import CollectionsSelectionDialog from '../components/CollectionsSelectionDialog'
import AttrGroupsSelectionDialog from './AttrGroupsSelectionDialog'
import ActionStatusDialog from '../components/ActionStatusDialog'
import AttributeType from '../constants/attributeTypes'
import XLSX from 'xlsx'
import dateFormat from 'dateformat'
import router from '../router'

import AfterButtonsComponent from '../_customizations/table/afterButtons/AfterButtonsComponent'
import RelationAttributeSearchComponent from '../components/RelationAttributeSearch.vue'

export default {
  components: { ColumnsSelectionDialog, ColumnsSaveDialog, ChannelsSelectionDialog, TemplatesSelectionDialog, AttrGroupsSelectionDialog, AfterButtonsComponent, ActionStatusDialog, CollectionsSelectionDialog, RelationAttributeSearchComponent },
  props: {
    loadData: {
      required: true
    },
    export: {
      type: Boolean,
      required: true
    },
    item: {
      required: false
    },
    headersStorageName: {
      required: true
    },
    availableColumns: {
      required: true
    },
    defaultHeadersArr: {
      required: true
    },
    importEntities: {
      required: true
    },
    updateEntity: {
      required: true
    },
    searchHeader: {
      required: false
    },
    attrGroupsBtnVisible: {
      required: false,
      default: false
    },
    sendToChannelBtnVisible: {
      required: false,
      default: false
    },
    importXLSEnabled: {
      required: false,
      default: false
    },
    exportXLSEnabled: {
      required: false,
      default: false
    },
    marginTop: {
      required: false,
      default: 100
    },
    collection: {
      required: false,
      default: false
    }
  },
  setup (props, { emit, root }) {
    const { showError, showInfo } = errorStore.useStore()

    const { currentUserRef, hasAccess, canEditItem, canEditAttrGroup, currentRoles } = userStore.useStore()

    const { savedColumnsRef, loadAllSavedColumns, searchEntityRef } = searchStore.useStore()

    const { groups, findByIdentifier, getAttributesForItem } = attrStore.useStore()

    const { loadAllChannels, getAvailableChannels, submitItems } = channelsStore.useStore()

    const { submitItemToCollection, removeFromCollection } = collectionsStore.useStore()

    const {
      loadAllActions,
      actions,
      executeTableButtonAction
    } = actionsStore.useStore()

    const {
      languages,
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadThumbnails,
      loadItemsByIds,
      loadItemsByIdsForImport,
      getItemsForRelationAttributeImport
    } = itemStore.useStore()

    const {
      getLOVData
    } = lovsStore.useStore()

    const {
      loadAllTypes,
      findTypeByIdentifier
    } = typesStore.useStore()

    const {
      loadAllTemplates,
      templates
    } = tempStore.useStore()

    const columnsSelectionDialogRef = ref(null)
    const columnsSaveDialogRef = ref(null)
    const attrSelectionDialogRef = ref(null)

    const excelDialogRef = ref(false)
    const excelDialogProgressRef = ref(0)
    const excelDialogTitleRef = ref('import')
    const itemsRef = ref([])
    const totalItemsRef = ref(0)
    const optionsRef = ref({ page: 1, itemsPerPage: localStorage.getItem('searchItemsPerPage') ? parseInt(localStorage.getItem('searchItemsPerPage')) : 10, sortBy: [], sortDesc: [] })
    const loadingRef = ref(false)

    const headersRef = ref([])

    const thumbnailsRef = ref([])
    const lovsMap = {}
    const savedColumnsSelectionRef = ref(null)
    const savedColumnsOptionsRef = ref([])
    const chanSelectionDialogRef = ref(null)
    const tempSelectionDialogRef = ref(null)
    const collSelectionDialogRef = ref(null)
    const hasChannelsRef = ref([])

    // dor inplace editing
    const inplaceItem = ref(null)
    const inplaceHeader = ref(null)
    const inplaceValue = ref(null)
    const inplaceMultivalue = ref(false)
    let inplaceValueSave = null
    const inplaceAttribute = ref(null)
    const dateMenu = ref(false)
    const timeMenu = ref(false)
    const timeMenuRef = ref(null)
    const time = ref(null)
    const actionLoadedRef = ref(false)

    const pageSize = ref(localStorage.getItem('searchItemsPerPage') ? parseInt(localStorage.getItem('searchItemsPerPage')) : 10)
    const tableFooterRef = ref(1)

    const importFinishedDialogRef = ref(null)
    const importFinishedLogRef = ref([])
    const importConfigDialogRef = ref(null)

    const massUpdateDialogRef = ref(false)
    const massUpdateInputRef = ref(null)
    const massUpdatePageSizeRef = ref(100)
    const massUpdateHeaderRef = ref(null)
    const massUpdateSkipActionsRef = ref(false)
    const massUpdateActionRef = ref('1')

    const fileUploadRef = ref(null)
    const importModeRef = ref('UPDATE_ONLY')
    const importStopOnErrorRef = ref(false)
    const importEmptyValuesRef = ref(false)
    const importPageSizeRef = ref(process.env.VUE_APP_IMPORT_PAGE || 100)
    const importModes = [
      { text: i18n.t('DataTable.ExcelImport.CREATE_ONLY'), value: 'CREATE_ONLY' },
      { text: i18n.t('DataTable.ExcelImport.UPDATE_ONLY'), value: 'UPDATE_ONLY' },
      { text: i18n.t('DataTable.ExcelImport.CREATE_UPDATE'), value: 'CREATE_UPDATE' }
    ]

    function pageSizeChanged (itemsPerPage) {
      optionsRef.value.itemsPerPage = parseInt(itemsPerPage)
      localStorage.setItem('searchItemsPerPage', itemsPerPage)
      optionsRef.value.page = 1
    }

    function pageChanged (page) {
      optionsRef.value.page = page
    }

    function cellClicked (item, header) {
      if (!canEditItem(item.typeId, item.path)) return
      if (header.type === AttributeType.Relation) return

      if (typeof header.value === 'object') { // name or values
        if (header.value.path[0] === 'values') {
          const node = findByIdentifier(header.value.path[1])
          if (!canEditAttrGroup(node.groups[0].id)) return
          inplaceAttribute.value = node.item
        } else {
          inplaceAttribute.value = null
        }
        inplaceItem.value = item
        inplaceHeader.value = header
        inplaceValue.value = getValue(item, header, true)
        inplaceMultivalue.value = inplaceAttribute.value && inplaceAttribute.value.options.some(opt => opt.name === 'multivalue' && opt.value === 'true')
        inplaceValueSave = inplaceValue.value
      }
    }

    function goto (url) {
      window.open(url)
    }

    function inplaceBlur () {
      if (inplaceValueSave !== inplaceValue.value) {
        const itemToUpdate = { internalId: inplaceItem.value.id }
        const valPath = inplaceHeader.value.value.path
        if (valPath[0] === 'values') {
          itemToUpdate.values = {}
          if (valPath.length === 3) {
            if (!inplaceItem.value.values[valPath[1]]) inplaceItem.value.values[valPath[1]] = {}
            inplaceItem.value.values[valPath[1]][valPath[2]] = inplaceValue.value
            itemToUpdate.values[valPath[1]] = {}
            itemToUpdate.values[valPath[1]][valPath[2]] = inplaceValue.value
          } else {
            inplaceItem.value.values[valPath[1]] = inplaceValue.value
            itemToUpdate.values[valPath[1]] = inplaceValue.value
          }
        } else {
          // name
          inplaceItem.value.name[valPath[1]] = inplaceValue.value
          itemToUpdate.name = {}
          itemToUpdate.name[valPath[1]] = inplaceValue.value
        }
        props.updateEntity(itemToUpdate)
      }
      inplaceAttribute.value = null
      inplaceItem.value = null
      inplaceHeader.value = null
      inplaceValue.value = null
    }

    const inplaceLovSelection = computed(() => {
      if (inplaceAttribute.value && inplaceAttribute.value.lov) {
        const lovValues = lovsMap[inplaceAttribute.value.lov]
        const values = lovValues.filter(elem => !elem.level || elem.level.length === 0 || elem.level === '[]' || elem.level.find(path => inplaceItem.value.path.startsWith(path)))
        return values.map(elem => { return { value: elem.id, text: elem.value[currentLanguage.value.identifier] || '[' + elem.value[defaultLanguageIdentifier.value] + ']' } })
      } else {
        return []
      }
    })

    watch(savedColumnsSelectionRef, (val) => {
      if (val) {
        let savedCols = []

        for (const property in savedColumnsRef.value) {
          const tst = savedColumnsRef.value[property].find(elem => elem.id === val)
          if (tst) {
            savedCols = tst.columns
            break
          }
        }

        headersRef.value = savedCols
        localStorage.setItem('savedColumnsSelection', savedColumnsSelectionRef.value)
        loadLOVs()
      }
    })

    function editHeaders () {
      let onlyAttributes = null
      if (props.item && itemsRef.value && itemsRef.value.length > 0) { // filter attributes only when table show children (not in search)
        const first = itemsRef.value[0]
        onlyAttributes = getAttributesForItem(first.typeId, first.path)
      }

      columnsSelectionDialogRef.value.showDialog([...headersRef.value], onlyAttributes)
    }

    async function columnsSelected (arr) {
      savedColumnsSelectionRef.value = null
      localStorage.removeItem('savedColumnsSelection')
      columnsSelectionDialogRef.value.closeDialog()
      headersRef.value = arr
      loadLOVs()
      loadParentsIfNecessary()
      localStorage.setItem(props.headersStorageName, JSON.stringify(arr))
      relationAttributesItemsRef.value = await getRelationAttributesItems(itemsRef.value, false)
    }

    async function loadLOVs () {
      let refresh = false
      for (let i = 0; i < headersRef.value.length; i++) {
        const elem = headersRef.value[i]
        if (elem.lov) {
          const values = await getLOVData(elem.lov)
          lovsMap[elem.lov] = values
          refresh = true
        }
      }
      if (refresh) DataChanged()
    }

    async function loadLOVsForRelationAttrs () {
      for (let i = 0; i < headersRef.value.length; i++) {
        const header = headersRef.value[i]
        if (header.type === AttributeType.Relation) {
          const attrIdentifier = header.identifier.substring(5)
          const attrNode = findByIdentifier(attrIdentifier)
          if (!attrNode) return
          const displayValueOption = attrNode.item.options.find(el => el.name === 'displayValue')
          const displayAttr = displayValueOption ? findByIdentifier(displayValueOption.value) : null
          const lov = displayAttr && displayAttr.item && displayAttr.item.lov && displayAttr.item.type === 7
          if (lov && !lovsMap[displayAttr.item.lov]) {
            const values = await getLOVData(displayAttr.item.lov)
            lovsMap[displayAttr.item.lov] = values
          }
        }
      }
    }

    function headerSort (header) {
      const idx = optionsRef.value.sortBy.findIndex(elem => elem === header.value)
      if (idx === -1) {
        // replace previous sorting
        /* const prevHeader = headersRef.value.find(elem => elem.value === optionsRef.value.sortBy[0])
        if (prevHeader) prevHeader.icon = 'mdi-arrow-up-down'
        optionsRef.value.sortBy = [header.value, 'id']
        optionsRef.value.sortDesc = [false, false] */
        // replace previous sorting

        optionsRef.value.sortBy.push(header.value)
        optionsRef.value.sortDesc.push(false)
        header.icon = 'mdi-arrow-down'
      } else {
        if (!optionsRef.value.sortDesc[idx]) {
          optionsRef.value.sortDesc[idx] = true
          header.icon = 'mdi-arrow-up'
        } else {
          optionsRef.value.sortBy.splice(idx, 1)
          optionsRef.value.sortDesc.splice(idx, 1)
          header.icon = 'mdi-arrow-up-down'
        }
      }

      optionsUpdate(optionsRef.value)
    }

    async function getRelationAttributesItems (rows, isExport) {
      await loadLOVsForRelationAttrs()
      let relationAttributesItemsIds = []
      let loadMainImages = false
      for (let i = 0; i < headersRef.value.length; i++) {
        const header = headersRef.value[i]
        if (header.type === AttributeType.Relation) {
          const attrIdentifier = header.identifier.substring(5)
          const attrNode = findByIdentifier(attrIdentifier)
          if (attrNode) {
            const showThumbnail = attrNode.item.options ? attrNode.item.options.find(el => el.name === 'showThumbnail') : false
            loadMainImages = showThumbnail && showThumbnail.value === 'true'
          }
          rows.forEach(row => {
            if (row.values[attrIdentifier]) {
              if (Array.isArray(row.values[attrIdentifier])) {
                relationAttributesItemsIds = relationAttributesItemsIds.concat(row.values[attrIdentifier])
              } else {
                relationAttributesItemsIds.push(row.values[attrIdentifier])
              }
            }
          })
        }
      }

      let relationAttributesItems = []
      if (relationAttributesItemsIds.length) {
        relationAttributesItems = await loadItemsByIdsForImport(relationAttributesItemsIds, isExport ? false : loadMainImages, true)
      }

      return relationAttributesItems
    }

    const relationAttributesItemsRef = ref([])
    function optionsUpdate (options) {
      loadingRef.value = true
      totalItemsRef.value = 0
      props.loadData(options).then(async data => {
        itemsRef.value = data.rows
        totalItemsRef.value = data.count
        loadingRef.value = false
        const ids = data.rows.map(elem => elem.id)
        loadThumbnails(ids).then(arr => { thumbnailsRef.value = arr })
        loadParentsIfNecessary()
        relationAttributesItemsRef.value = await getRelationAttributesItems(data.rows, false)
      })
    }

    async function exportExcel () {
      excelDialogTitleRef.value = i18n.t('DataTable.ExcelDialog.TitleExport')
      excelDialogRef.value = true
      const itemsPerPage = 1000
      let total = 0
      let page = 0
      excelDialogProgressRef.value = 0

      const columns = ['parent', 'type', 'Identifier']
      headersRef.value.forEach(header => {
        if (header.identifier !== '#thumbnail#' && header.identifier !== 'identifier' && header.identifier !== '#parentName#' && header.identifier !== '#sourceParentName#' && header.identifier !== '#targetParentName#' && header.identifier !== 'typeIdentifier') {
          columns.push(header.text)
        }
      })
      const ws = XLSX.utils.aoa_to_sheet([columns])
      ws['!cols'] = []
      ws['!cols'][0] = { hidden: true }
      ws['!cols'][1] = { hidden: true }

      let cell = ws[XLSX.utils.encode_cell({ c: 0, r: 0 })]
      cell.c = []
      cell.c.hidden = true
      cell.c.push({ a: 'OpenPIM', t: 'parent' })

      cell = ws[XLSX.utils.encode_cell({ c: 1, r: 0 })]
      cell.c = []
      cell.c.hidden = true
      cell.c.push({ a: 'OpenPIM', t: 'type' })

      cell = ws[XLSX.utils.encode_cell({ c: 2, r: 0 })]
      cell.c = []
      cell.c.hidden = true
      cell.c.push({ a: 'OpenPIM', t: 'identifier' })

      let idx = 3
      headersRef.value.forEach(header => {
        if (header.identifier !== '#thumbnail#' && header.identifier !== 'identifier' && header.identifier !== '#parentName#' && header.identifier !== '#sourceParentName#' && header.identifier !== '#targetParentName#' && header.identifier !== 'typeIdentifier') {
          cell = ws[XLSX.utils.encode_cell({ c: idx, r: 0 })]
          cell.c = []
          cell.c.hidden = true
          cell.c.push({ a: 'OpenPIM', t: header.identifier + (header.lov ? '#' + header.lov : '') })
          idx++
        }
      })

      let sortBy = ['id']
      let sortDesc = [false]
      if (optionsRef.value.sortBy && optionsRef.value.sortBy.length > 0) {
        sortBy = optionsRef.value.sortBy
        sortBy.push('id')
        sortDesc = optionsRef.value.sortDesc
        sortDesc.push(false)
      }

      do {
        page++
        const data = await props.loadData({ page: page, itemsPerPage: itemsPerPage, sortBy: sortBy, sortDesc: sortDesc })
        const relationAttributesItems = await getRelationAttributesItems(data.rows, true)

        total = data.count
        if (!excelDialogRef.value) return // exit if process was canceled
        data.rows.forEach(row => {
          const rowData = []
          rowData.push(row.parentIdentifier)
          rowData.push(row.typeIdentifier)
          rowData.push(row.identifier)
          headersRef.value.forEach(header => {
            if (header.identifier !== '#thumbnail#' && header.identifier !== 'identifier' && header.identifier !== '#parentName#' && header.identifier !== '#sourceParentName#' && header.identifier !== '#targetParentName#' && header.identifier !== 'typeIdentifier') {
              if (header.type === AttributeType.Relation && relationAttributesItems.length) {
                rowData.push(getValueForRelationAttribute(header, row, relationAttributesItems).map(el => el.text).join(','))
              } else {
                rowData.push(getValueWithChannels(header, row, false))
              }
            }
          })
          XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: -1 })
        })
        const tst = page * itemsPerPage * 100 / total
        excelDialogProgressRef.value = tst > 100 ? 100 : tst
      } while (page * itemsPerPage < total)

      if (!excelDialogRef.value) return // exit if process was canceled

      var wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'results.xlsx')

      excelDialogRef.value = false
    }

    const getDisplayValue = (item, displayValueOption, displayAttr, lovData) => {
      let result
      if (displayValueOption && displayValueOption.value && displayValueOption.value.startsWith('#')) {
        const fieldName = displayValueOption.value.substr(1)
        result = item[fieldName]
      } else if (displayValueOption && displayValueOption.value) {
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

    function getValueForRelationAttribute (header, row, items) {
      if (!items.length) return []
      const value = getValue(row, header)
      const attrIdentifier = header.identifier.substring(5)
      const attrNode = findByIdentifier(attrIdentifier)
      const displayValueOption = attrNode.item.options.find(el => el.name === 'displayValue')
      const displayValue = attrNode.item.options ? attrNode.item.options.find(el => el.name === 'displayValue') : null
      const displayAttr = displayValueOption ? findByIdentifier(displayValueOption.value) : null
      const lov = displayAttr && displayAttr.item && displayAttr.item.lov && displayAttr.item.type === 7
      const lovData = lov ? lovsMap[displayAttr.item.lov] : null
      let data = []
      if (value && Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const val = value[i]
          const found = items.find(el => parseInt(el.id) === parseInt(val))
          if (found) data.push(found)
        }
      } else if (value) {
        const tmp = items.find(el => parseInt(el.id) === parseInt(value))
        if (tmp) data = [tmp]
      }
      const damUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/'
      data = data.map(el => ({
        identifier: el.identifier,
        imageUrl: el.values.__imagedata && el.values.__imagedata.id ? damUrl + 'asset/' + el.values.__imagedata.id + '/thumb?token=' + localStorage.getItem('token') : null,
        text: getDisplayValue(el, displayValue, displayAttr, lovData)
      }))
      return data
    }

    function getValueWithChannels (header, row, formatDate) {
      let value
      if (!header.identifier.startsWith('#channel_')) {
        value = getValue(row, header)
      } else {
        if (getValue(row, header)) {
          if (header.identifier.endsWith('_status')) {
            const status = getValue(row, header)
            if (status === 1) value = i18n.t('ItemView.Channels.Submitted')
            else if (status === 2) value = i18n.t('ItemView.Channels.Synced')
            else if (status === 3) value = i18n.t('ItemView.Channels.Error')
            else if (status === 4) value = i18n.t('ItemView.Channels.Waiting')
          } else if (header.identifier.endsWith('_submittedAt') || header.identifier.endsWith('_syncedAt')) {
            value = formatDate ? dateFormat(new Date(getValue(row, header)), process.env.VUE_APP_DATE_FORMAT) : new Date(getValue(row, header))
          } else {
            value = getValue(row, header)
          }
        } else {
          value = ''
        }
      }
      return value
    }

    /* generate a download */
    function s2ab (s) {
      var buf = new ArrayBuffer(s.length)
      var view = new Uint8Array(buf)
      for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
      return buf
    }

    function showMassUpdateDialog (header) {
      massUpdateHeaderRef.value = header
      massUpdateDialogRef.value = true
      massUpdateInputRef.value = null
    }

    async function massUpdate () {
      const itemsPerPage = !isNaN(parseInt(massUpdatePageSizeRef.value, 10)) ? parseInt(massUpdatePageSizeRef.value, 10) : 100
      let total = -1
      let page = 0
      massUpdateDialogRef.value = false
      excelDialogRef.value = true
      excelDialogProgressRef.value = 0
      excelDialogTitleRef.value = i18n.t('DataTable.MassUpdate.ProgressTitle')
      do {
        // cancel button pressed
        if (!excelDialogRef.value) {
          DataChanged()
          return
        }
        page++
        const data = await props.loadData({ page, itemsPerPage, sortBy: ['id'], sortDesc: [false] })
        if (total === -1) total = data.count
        let rows = []
        if (massUpdateHeaderRef.value.identifier.startsWith('name_')) {
          const lang = massUpdateHeaderRef.value.identifier.substr(5)
          rows = data.rows.map(el => ({
            identifier: el.identifier,
            name: { [lang]: massUpdateInputRef.value },
            skipActions: massUpdateSkipActionsRef.value
          }))
        } else if (massUpdateHeaderRef.value.identifier.startsWith('attr_')) {
          rows = data.rows.map(el => ({
            identifier: el.identifier,
            values: { [massUpdateHeaderRef.value.identifier.substr(5)]: getValueForMassUpdate(el, massUpdateInputRef.value) },
            skipActions: massUpdateSkipActionsRef.value
          }))
        }
        await props.importEntities(rows, 'UPDATE_ONLY')
        excelDialogProgressRef.value = (page * itemsPerPage / total) * 100 < 100 ? (page * itemsPerPage / total) * 100 : 100
      } while (itemsPerPage * page < total)
      excelDialogRef.value = false
      DataChanged()
    }

    function getValueForMassUpdate (entity, newValue) {
      // replace
      if (!massUpdateHeaderRef.value.multivalue || massUpdateActionRef.value === '1') return newValue
      // add: concat values
      let oldValues = entity.values[massUpdateHeaderRef.value.identifier.substr(5)]
      if (!Array.isArray(oldValues)) oldValues = [oldValues]
      return [...new Set(oldValues.concat(newValue))]
    }

    function importExcel (event) {
      importConfigDialogRef.value = false
      excelDialogTitleRef.value = i18n.t('DataTable.ExcelDialog.TitleImport')
      const pageSize = parseInt(importPageSizeRef.value)

      const file = fileUploadRef.value
      if (!file) return

      const log = [['identifier', 'result', 'errors', 'warnings']]

      excelDialogProgressRef.value = 0
      excelDialogRef.value = true
      var reader = new FileReader()
      reader.onload = async function (evt) {
        const data = evt.target.result

        try {
          const wb = XLSX.read(data, { type: 'binary' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const availableLangs = languages.map(lang => lang.identifier)

          const range = XLSX.utils.decode_range(ws['!ref'])
          const headers = []
          for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
            const cell = ws[XLSX.utils.encode_cell({ r: 0, c: colNum })]
            if (!cell) continue
            if ((!cell.c || cell.c.length === 0) && cell.v !== '#delete#' && cell.v !== '#skipActions#') {
              showError(i18n.t('DataTable.ExcelImport.WrongFormat'))
              excelDialogRef.value = false
              return
            } else {
              headers.push(cell.v === '#delete#' || cell.v === '#skipActions#' ? cell.v : cell.c[0].t)
            }
          }

          let rows = []
          const totalRows = range.e.r
          let currentRow = 0
          const multivalueMap = {}
          await loadLOVs2(headers, multivalueMap)

          let firstRow = true
          for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
            if (firstRow) {
              firstRow = false
              continue
            }
            if (!excelDialogRef.value) return
            const item = {}
            for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
              const cell = ws[XLSX.utils.encode_cell({ r: rowNum, c: colNum })]
              const header = headers[colNum]

              if (!header) continue

              if (header === 'parent') {
                if (cell && cell.v) item.parentIdentifier = '' + cell.v
              } else if (header === 'itemIdentifier') {
                if (cell && cell.v) item.itemIdentifier = '' + cell.v
              } else if (header === 'relationIdentifier') {
                if (cell && cell.v) item.relationIdentifier = '' + cell.v
              } else if (header === 'targetIdentifier') {
                if (cell && cell.v) item.targetIdentifier = '' + cell.v
              } else if (header === 'type') {
                if (cell && cell.v) item.typeIdentifier = '' + cell.v
              } else if (header === 'identifier') {
                if (cell && cell.v) item.identifier = '' + cell.v
              } else if (header === '#delete#') {
                if (cell && cell.v) item.delete = cell.v
              } else if (header === '#skipActions#') {
                if (cell && cell.v) item.skipActions = cell.v
              } else if (header.startsWith('name')) {
                if (cell && cell.v) {
                  const arr = ('' + header).split('_')
                  const lang = arr[1]
                  if (!item.name) item.name = {}
                  item.name[lang] = '' + cell.v
                }
              } else if (header.startsWith('attr') && ((cell && cell.v !== null && cell.v !== undefined) || ((!cell || !cell.v) && importEmptyValuesRef.value))) {
                if (!item.values) item.values = {}
                let attr = header.substring(5)
                let cellVal = cell ? cell.v : null
                // check LOV
                const tst = attr.indexOf('#')
                if (tst !== -1) {
                  const lov = parseInt(attr.substring(tst + 1))
                  attr = attr.substring(0, tst)

                  const lovValues = lovsMap[lov]
                  if (lovValues) {
                    const val = cell ? '' + cell.v : ''
                    if (multivalueMap[attr]) { // multivalue lov
                      let errors = ''
                      if (val === '' || val === null) {
                        cellVal = []
                      } else {
                        cellVal = val.split(',').reduce((accumulator, currentValue) => {
                          const tmp = currentValue.trim()
                          const tst2 = lovValues.find(elem => elem.value[currentLanguage.value.identifier] === tmp)
                          if (tst2) accumulator.push(tst2.id)
                          else {
                            errors += i18n.t('DataTable.ExcelImport.NoLOVValue', { val: tmp, attr: attr })
                          }
                          return accumulator
                        }, [])
                      }
                      if (errors.length > 0) {
                        log.push([item.identifier, 'ERROR', errors])
                        if (importStopOnErrorRef.value) {
                          showError(errors)
                          excelDialogRef.value = false
                        }
                        continue
                      }
                    } else {
                      if (val === '' || val === null) {
                        cellVal = null
                      } else {
                        const tst2 = lovValues.find(elem => elem.value[currentLanguage.value.identifier] === val)
                        if (tst2) {
                          cellVal = tst2.id
                        } else {
                          const err = i18n.t('DataTable.ExcelImport.NoLOVValue', { val: val, attr: attr })
                          log.push([item.identifier, 'ERROR', err])
                          if (importStopOnErrorRef.value) {
                            showError(err)
                            excelDialogRef.value = false
                          }
                          continue
                        }
                      }
                    }
                  }
                }

                const idx = attr.lastIndexOf('_')
                if (idx !== -1) {
                  const attrIdent = attr.substring(0, idx)
                  const tst = attr.substring(idx + 1)
                  if (availableLangs.includes(tst)) {
                    if (!item.values[attrIdent] || typeof item.values[attrIdent] !== 'object') item.values[attrIdent] = {}
                    item.values[attrIdent][tst] = convertValueIfNecessary(attrIdent, cellVal)
                  } else {
                    item.values[attr] = convertValueIfNecessary(attr, cellVal)
                  }
                } else {
                  item.values[attr] = convertValueIfNecessary(attr, cellVal)
                }
              }
            }
            if (item.identifier) rows.push(item)
            if (rows.length === pageSize) {
              await importRows(rows, headers, log)
              rows = []
            }
            excelDialogProgressRef.value = currentRow++ * 100 / totalRows
          }
          if (rows.length > 0) {
            await importRows(rows, headers, log)
          }
          excelDialogProgressRef.value = 100
          setTimeout(() => {
            importFinishedDialogRef.value = true
            importFinishedLogRef.value = log
            DataChanged()
          }, 2500)
          excelDialogRef.value = false
        } catch (err) {
          console.error('Error opening file', err)
          showError(err.message)
          excelDialogRef.value = false
        }
      }
      reader.readAsBinaryString(file)
      fileUploadRef.value = null
    }

    function convertValueIfNecessary (attr, cellVal) {
      const attrNode = findByIdentifier(attr)
      if (cellVal === null) {
        return attrNode && attrNode.item.type === AttributeType.Text ? '' : null
      } else {
        return attrNode && attrNode.item.type === AttributeType.Text ? '' + cellVal : cellVal
      }
    }

    async function importRows (rows, headers, log) {
      await replaceRelAttrDataForImport(rows, headers, log)
      const returnRows = await props.importEntities(rows, importModeRef.value)
      let errors = ''
      returnRows.forEach(row => {
        if (row.errors.length > 0) {
          errors += row.identifier + ': ' + row.errors[0].message
        }
        log.push([row.identifier, row.result, JSON.stringify(row.errors), JSON.stringify(row.warnings)])
      })
      if (importStopOnErrorRef.value && errors.length > 0) {
        showError(errors)
        excelDialogRef.value = false
      }
    }

    function downloadImportFinishedLog () {
      const ws = XLSX.utils.aoa_to_sheet(importFinishedLogRef.value)
      var wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'log.xlsx')
    }

    async function loadLOVs2 (importHeaders, multivalueMap) {
      for (let i = 0; i < importHeaders.length; i++) {
        const header = importHeaders[i]
        if (header.startsWith('attr') && header.indexOf('#') !== -1) {
          const tst = header.indexOf('#')
          const attr = header.substring(5, tst)
          const attrNode = findByIdentifier(attr)
          multivalueMap[attr] = attrNode.item.options && Array.isArray(attrNode.item.options) && attrNode.item.options.some(option => option.name === 'multivalue' && option.value === 'true')

          const lov = parseInt(header.substring(tst + 1))
          const lovValues = lovsMap[lov]
          if (!lovValues) {
            const values = await getLOVData(lov)
            lovsMap[lov] = values
          }
        }
      }
    }

    async function replaceRelAttrDataForImport (rows, importHeaders, log) {
      for (let i = 0; i < importHeaders.length; i++) {
        const header = importHeaders[i]
        if (header.substring(0, 5) === 'attr_') {
          const attr = header.substring(5)
          const attrNode = findByIdentifier(attr)

          if (attrNode && attrNode.item && attrNode.item.type === AttributeType.Relation) {
            const langDependent = attrNode.item.langDependent
            const displayValue = attrNode.item.options ? attrNode.item.options.find(el => el.name === 'displayValue') : null
            const displayAttr = displayValue ? findByIdentifier(displayValue.value) : null
            const multivalue = attrNode.item.options ? attrNode.item.options.find(el => el.name === 'multivalue' && el.value === 'true') : null

            let searchArr = []
            for (let rowIndx = 0; rowIndx < rows.length; rowIndx++) {
              const row = rows[rowIndx]
              if (row.values && row.values[attrNode.item.identifier] && multivalue) {
                searchArr = searchArr.concat((row.values[attrNode.item.identifier] + '').split(','))
              } else if (row.values && typeof row.values[attrNode.item.identifier] !== 'undefined' && row.values[attrNode.item.identifier] !== null) {
                searchArr.push(row.values[attrNode.item.identifier] + '')
              }
            }

            const attrAvailableItems = await getItemsForRelationAttributeImport(attrNode.item, searchArr, currentLanguage.value.identifier, 10000, 0, 'ASC')
            for (let k = 0; k < rows.length; k++) {
              const row = rows[k]
              if (row.values) {
                if (multivalue) {
                  if (row.values[attrNode.item.identifier] === null || row.values[attrNode.item.identifier] === '') {
                    row.values[attrNode.item.identifier] = []
                    continue
                  }
                  const arr = (row.values[attrNode.item.identifier] + '').length ? (row.values[attrNode.item.identifier] + '').split(',') : []
                  const mappedArr = []
                  for (let arrIndx = 0; arrIndx < arr.length; arrIndx++) {
                    let tst
                    if (displayValue && displayValue.value && displayValue.value.startsWith('#')) {
                      const fieldName = displayValue.value.substr(1)
                      // eslint-disable-next-line eqeqeq
                      tst = attrAvailableItems.getItemsForRelationAttributeImport.find(el => el[fieldName] == arr[arrIndx])
                    } else if (displayAttr && displayAttr.item && displayAttr.item.lov && displayAttr.item.type === 7) {
                      if (!lovsMap[displayAttr.item.lov]) {
                        lovsMap[displayAttr.item.lov] = await getLOVData(displayAttr.item.lov)
                      }
                      // eslint-disable-next-line eqeqeq
                      const lovData = lovsMap[displayAttr.item.lov].find(el => el.value[currentLanguage.value.identifier] == arr[arrIndx])
                      // eslint-disable-next-line eqeqeq
                      tst = lovData ? attrAvailableItems.getItemsForRelationAttributeImport.find(el => el.values[displayValue.value] == lovData.id) : null
                    } else if (displayValue && !langDependent) {
                      // eslint-disable-next-line eqeqeq
                      tst = attrAvailableItems.getItemsForRelationAttributeImport.find(el => el.values[displayValue.value] == arr[arrIndx])
                    } else if (displayValue && langDependent) {
                      // eslint-disable-next-line eqeqeq
                      tst = attrAvailableItems.getItemsForRelationAttributeImport.find(el => el.values[displayValue.value][currentLanguage.value.identifier] == arr[arrIndx])
                    } else {
                      // eslint-disable-next-line eqeqeq
                      tst = attrAvailableItems.getItemsForRelationAttributeImport.find(el => el.name[currentLanguage.value.identifier] == arr[arrIndx])
                    }
                    if (tst) {
                      mappedArr.push(parseInt(tst.id))
                    } else {
                      // throw new Error('Can not find item for name ' + row.values[attrNode.item.identifier])
                      const err = i18n.t('DataTable.ExcelImport.NoRelAttrValue', { val: arr[arrIndx], attr: attr })
                      log.push([row.identifier, 'ERROR', err])
                      if (importStopOnErrorRef.value) {
                        showError(err)
                        excelDialogRef.value = false
                      }
                      continue
                    }
                  }
                  row.values[attrNode.item.identifier] = mappedArr
                } else {
                  if (row.values[attrNode.item.identifier] === null || row.values[attrNode.item.identifier] === '') {
                    row.values[attrNode.item.identifier] = null
                    continue
                  }
                  let tst
                  if (displayValue && displayValue.value && displayValue.value.startsWith('#')) {
                    const fieldName = displayValue.value.substr(1)
                    tst = attrAvailableItems.getItemsForRelationAttributeImport.find(el => el[fieldName] === row.values[attrNode.item.identifier])
                  } else if (displayAttr && displayAttr.item && displayAttr.item.lov && displayAttr.item.type === 7) {
                    if (!lovsMap[displayAttr.item.lov]) {
                      lovsMap[displayAttr.item.lov] = await getLOVData(displayAttr.item.lov)
                    }
                    // eslint-disable-next-line eqeqeq
                    const lovData = lovsMap[displayAttr.item.lov].find(el => el.value[currentLanguage.value.identifier] == row.values[attrNode.item.identifier])
                    // eslint-disable-next-line eqeqeq
                    tst = lovData ? attrAvailableItems.getItemsForRelationAttributeImport.find(el => el.values[displayValue.value] == lovData.id) : null
                  } else if (displayValue && !langDependent) {
                    // eslint-disable-next-line eqeqeq
                    tst = attrAvailableItems.getItemsForRelationAttributeImport.find(el => el.values[displayValue.value] == row.values[attrNode.item.identifier])
                  } else if (displayValue && langDependent) {
                    // eslint-disable-next-line eqeqeq
                    tst = attrAvailableItems.getItemsForRelationAttributeImport.find(el => el.values[displayValue.value][currentLanguage.value.identifier] == row.values[attrNode.item.identifier])
                  } else {
                    // eslint-disable-next-line eqeqeq
                    tst = attrAvailableItems.getItemsForRelationAttributeImport.find(el => el.name[currentLanguage.value.identifier] == row.values[attrNode.item.identifier])
                  }
                  if (tst) {
                    row.values[attrNode.item.identifier] = parseInt(tst.id)
                  } else {
                    // throw new Error('Can not find item for name ' + row.values[attrNode.item.identifier])
                    const err = i18n.t('DataTable.ExcelImport.NoRelAttrValue', { val: row.values[attrNode.item.identifier], attr: attr })
                    log.push([row.identifier, 'ERROR', err])
                    if (importStopOnErrorRef.value) {
                      showError(err)
                      excelDialogRef.value = false
                    }
                    continue
                  }
                }
              }
            }
          }
        }
      }
    }

    function excelDialogClose () {
      excelDialogRef.value = false
    }

    function exportData () {
      const maxRows = 10000
      if (totalItemsRef.value > maxRows && confirm(i18n.t('DataTable.Export.Limit', { number: totalItemsRef.value, max: maxRows }))) {
        performExport(maxRows)
      } else {
        performExport(maxRows)
      }
    }

    function performExport (maxRows) {
      loadingRef.value = true
      const sortBy = optionsRef.value.sortBy && optionsRef.value.sortBy.length > 0 ? optionsRef.value.sortBy : ['id']
      const sortDesc = optionsRef.value.sortDesc && optionsRef.value.sortDesc.length > 0 ? optionsRef.value.sortDesc : [false]
      props.loadData({ page: 1, itemsPerPage: maxRows, sortBy: sortBy, sortDesc: sortDesc }).then(data => {
        if (props.export) {
          console.log('#@SELECTED_ITEMS@#')
          const identHeader = { value: 'identifier' }
          data.rows.forEach(row => {
            console.log(getValue(row, identHeader))
          })
          console.log('#@END@#')

          loadingRef.value = false
        } else {
          let csv = ''
          headersRef.value.forEach(header => {
            if (header.identifier !== '#thumbnail#') {
              csv += '"' + header.text.replaceAll('"', '""') + '",'
            }
          })
          csv += '\n'

          data.rows.forEach(row => {
            headersRef.value.forEach(header => {
              if (header.identifier !== '#thumbnail#') {
                const value = '' + getValueWithChannels(header, row, true)
                csv += '"' + value.replaceAll('"', '""') + '",'
              }
            })
            csv += '\n'
          })

          loadingRef.value = false

          // set BOM at the begining so that Excel can open UTF-8 right
          const blob = new Blob([String.fromCharCode(0xFEFF), csv], { type: 'application/vnd.ms-excel;charset=utf-8' })
          saveAs(blob, 'export.csv')
        }
      })
    }

    function DataChanged () {
      clearFilters()
      optionsRef.value.page = 1
      loadingRef.value = true
      totalItemsRef.value = 0
      props.loadData(optionsRef.value).then(async data => {
        itemsRef.value = data.rows
        totalItemsRef.value = data.count
        loadingRef.value = false

        emit('dataLoaded', itemsRef.value, totalItemsRef.value)

        const ids = data.rows.map(elem => elem.id)
        loadThumbnails(ids).then(arr => { thumbnailsRef.value = arr })
        loadParentsIfNecessary()
        relationAttributesItemsRef.value = await getRelationAttributesItems(data.rows, false)
      })
    }

    function getThumbnail (id) {
      return thumbnailsRef.value.find(elem => elem.itemId === ('' + id))
    }

    function getValue (item, header, skipLOV) {
      if (typeof header.value === 'object') {
        let val = getDeepValue(header.value.path, item)
        if (header.lov) {
          if (!skipLOV) {
            const lovValues = lovsMap[header.lov]
            if (lovValues) {
              if (typeof val === 'object' && val) { // multivalue lov
                return Object.values(val).reduce((accumulator, currentValue, currentIndex, array) => {
                  const tst = lovValues.find(elem => elem.id === currentValue)
                  if (tst) accumulator += tst.value[currentLanguage.value.identifier] || '[' + tst.value[defaultLanguageIdentifier.value] + ']'

                  if (currentIndex !== array.length - 1 && tst) accumulator += ', '
                  return accumulator
                }, '')
              } else {
                const tst = lovValues.find(elem => elem.id === val)
                if (tst) {
                  val = tst.value[currentLanguage.value.identifier] || '[' + tst.value[defaultLanguageIdentifier.value] + ']'
                } else {
                  val = null
                }
                return val
              }
            } else {
              return val
            }
          } else {
            return typeof val === 'object' && val ? Object.values(val) : val
          }
        } else {
          return val
        }
      } else {
        return item[header.value]
      }
    }

    // https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a
    const getDeepValue = (path, obj) => path.reduce((accumulator, currentValue) => (accumulator && accumulator[currentValue]) ? accumulator[currentValue] : null, obj)

    function savedOptionsVisible () {
      return savedColumnsOptionsRef.value && savedColumnsOptionsRef.value.length > 0
    }

    async function loadColumns (force) {
      await loadAllSavedColumns(force)
      let arr = []
      if (savedColumnsRef.value[currentUserRef.value.login]) {
        arr.push({ header: currentUserRef.value.login + ':' })
        const tmp = savedColumnsRef.value[currentUserRef.value.login].map(col => { return { text: col.name[currentLanguage.value.identifier] || '[' + col.name[defaultLanguageIdentifier.value] + ']', value: col.id, identifier: col.identifier } })
        arr = arr.concat(tmp)
        arr.push({ divider: true })
      }

      for (const property in savedColumnsRef.value) {
        if (property !== currentUserRef.value.login) {
          const columns = savedColumnsRef.value[property]
          arr.push({ header: property + ':' })
          const tmp = columns.map(col => { return { text: col.name[currentLanguage.value.identifier] || '[' + col.name[defaultLanguageIdentifier.value] + ']', value: col.id, identifier: col.identifier } })
          arr = arr.concat(tmp)
          arr.push({ divider: true })
        }
      }

      savedColumnsOptionsRef.value = arr
    }

    async function channelsSelected (arr) {
      const where = filterWhere || props.loadData().where
      chanSelectionDialogRef.value.closeDialog()
      if (arr.length === 0) return
      excelDialogTitleRef.value = i18n.t('DataTable.ExcelDialog.TitleSubmit')
      excelDialogRef.value = true
      excelDialogProgressRef.value = 0
      await submitItems(where, arr)
      excelDialogProgressRef.value = 100
      excelDialogRef.value = false
      showInfo(i18n.t('Submitted'))
    }

    async function collectionsSelected (colId) {
      collSelectionDialogRef.value.closeDialog()
      const itemsPerPage = 1000
      let total = -1
      let page = 0

      do {
        page++
        let data = await props.loadData({ page: page, itemsPerPage: itemsPerPage, sortBy: ['id'], sortDesc: [false] })
        if (total === -1) total = data.count
        if (page !== 1 && data.rows.length === 0) {
          // if we are iterating through channel status itself (for example the query is select all items that has status OK)
          // them when we set status we are changing the result of query, so we can not iterate through pages, we need to always ask for 1 page until data will not be finished
          // so try to load first page in this case
          data = await props.loadData({ page: 1, itemsPerPage: itemsPerPage, sortBy: ['id'], sortDesc: [false] })
        }
        const mas = []
        data.rows.forEach(row => {
          mas.push(row.id)
        })
        submitItemToCollection(mas, colId)
      } while (page * itemsPerPage < total)

      excelDialogRef.value = false
      showInfo(i18n.t('Submit'))
    }

    async function deleteFromCollections (colId) {
      collSelectionDialogRef.value.closeDialog()
      const itemsPerPage = 1000
      let total = -1
      let page = 0

      do {
        page++
        let data = await props.loadData({ page: page, itemsPerPage: itemsPerPage, sortBy: ['id'], sortDesc: [false] })
        if (total === -1) total = data.count
        if (page !== 1 && data.rows.length === 0) {
          // if we are iterating through channel status itself (for example the query is select all items that has status OK)
          // them when we set status we are changing the result of query, so we can not iterate through pages, we need to always ask for 1 page until data will not be finished
          // so try to load first page in this case
          data = await props.loadData({ page: 1, itemsPerPage: itemsPerPage, sortBy: ['id'], sortDesc: [false] })
        }
        const selectedItems = []
        data.rows.forEach(item => {
          selectedItems.push(item.id)
        })
        removeFromCollection(selectedItems, colId)
      } while (page * itemsPerPage < total)

      showInfo(i18n.t('Collections.Deleted'))
    }

    async function deleteFromCollection () {
      const selectedItems = []
      itemsRef.value.forEach(item => {
        if (item.selected) selectedItems.push(item.id)
      })
      await removeFromCollection(selectedItems, props.collection.id)
      DataChanged()
      showInfo(i18n.t('Collections.Deleted'))
    }

    async function templateSelected (arr) {
      const where = filterWhere || props.loadData().where
      tempSelectionDialogRef.value.closeDialog()

      if (arr.length === 0) return

      const damUrl = window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL
      const form = document.createElement('form')
      form.method = 'POST'

      form.action = damUrl + 'templateforitems'

      const inputWhere = document.createElement('input')
      inputWhere.type = 'hidden'
      inputWhere.name = 'where'
      inputWhere.value = JSON.stringify(where)
      form.appendChild(inputWhere)

      const inputTemplateId = document.createElement('input')
      inputTemplateId.type = 'hidden'
      inputTemplateId.name = 'templateId'
      inputTemplateId.value = arr[0]
      form.appendChild(inputTemplateId)

      const inputItemId = document.createElement('input')
      inputItemId.type = 'hidden'
      inputItemId.name = 'itemId'
      inputItemId.value = props?.item?.id || ''
      form.appendChild(inputItemId)

      const newWindow = window.open(damUrl + 'templateforitems', '_blank')

      if (newWindow) {
        newWindow.document.body.appendChild(form)
        form.submit()
      } else {
        console.log('Failed to open a new window. Make sure pop-ups are not blocked.')
      }
    }

    const optionsTemplates = computed(() => {
      return templates.some(template =>
        template.options?.some(option => option.name === 'tableView' && option.value === 'true')
      )
    })

    function openSearch () {
      const name = props.item.name[currentLanguage.value.identifier] || '[' + props.item.name.name[defaultLanguageIdentifier.value] + ']'
      const search = { user: '', filters: [{ type: 'attr', attr: '#level#', operation: 1, value: name, path: props.item.path }], whereClause: {}, extended: false }

      const type = findTypeByIdentifier(props.item.typeIdentifier).node
      const typesToExclude = []
      collectTypes(type, typesToExclude)
      typesToExclude.forEach(type => {
        search.filters.push({ type: 'attr', attr: 'typeIdentifier', operation: 2, value: type.identifier })
      })

      localStorage.setItem('last_search_entity', 'ITEM')
      localStorage.setItem('search_to_open', JSON.stringify(search))
      window.open('/#/search', '_blank')
    }

    function collectTypes (type, array) {
      if (type.children && type.children.length > 0) {
        array.push(type)
        type.children.forEach(childType => {
          collectTypes(childType, array)
        })
      }
    }

    function selectAttrGroups () {
      let filter = null
      if (props.item && itemsRef.value && itemsRef.value.length > 0) {
        const first = itemsRef.value[0]
        const onlyAttributes = getAttributesForItem(first.typeId, first.path)
        filter = onlyAttributes.map(elem => elem.id)
      }
      attrSelectionDialogRef.value.showDialog(null, null, filter)
    }

    function attrGroupsSelected (groupIds, initiator) {
      attrSelectionDialogRef.value.closeDialog()

      let onlyAttributes = null
      if (props.item && itemsRef.value && itemsRef.value.length > 0) {
        const first = itemsRef.value[0]
        onlyAttributes = getAttributesForItem(first.typeId, first.path)
      }

      groupIds.forEach(groupId => {
        const group = onlyAttributes ? onlyAttributes.find(elem => elem.id === groupId) : groups.find(elem => elem.id === groupId)
        if (group && group.visible) {
          const attrs = onlyAttributes ? group.itemAttributes : group.attributes
          attrs.forEach(attr => {
            const nameText = attr.identifier + ': ' + (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']') + ' [' + (group.name[currentLanguage.value.identifier] || attr.group.name[defaultLanguageIdentifier.value]) + ']'
            const nameShort = (attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']')
            if (attr.languageDependent) {
              for (let i = 0; i < languages.length; i++) {
                const lang = languages[i]
                const langText = ' (' + (lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']') + ')'
                const data = { identifier: 'attr_' + attr.identifier + '_' + lang.identifier, text: nameShort + langText, type: attr.type, textLong: nameText + langText, textShort: nameShort + langText, align: 'start', sortable: true, filterable: false, value: { path: ['values', attr.identifier, lang.identifier] } }
                if (attr.type === 7 && attr.lov) data.lov = attr.lov
                if (!headersRef.value.some(elem => elem.identifier === data.identifier)) headersRef.value.push(data)
              }
            } else {
              const data = { identifier: 'attr_' + attr.identifier, text: nameShort, type: attr.type, textLong: nameText, textShort: nameShort, align: 'start', sortable: true, filterable: false, value: { path: ['values', attr.identifier] } }
              if (attr.type === 7 && attr.lov) data.lov = attr.lov
              if (!headersRef.value.some(elem => elem.identifier === data.identifier)) headersRef.value.push(data)
            }
          })
        }
      })
      loadLOVs()
      // loadLOVsForRelationAttrs()
    }

    onMounted(async () => {
      loadAllActions().then(() => { actionLoadedRef.value = true })
      loadAllTypes()
      loadAllChannels()
      loadAllTemplates().then(() => {
        hasChannelsRef.value = getAvailableChannels(true).length > 0
      })
      await loadColumns(false)
      let tst = localStorage.getItem(props.headersStorageName)
      if (tst) {
        // check for old format of headers list
        let changed = false
        tst = JSON.parse(tst)
        tst = tst.map(header => {
          if (Array.isArray(header.value)) {
            changed = true
            const arr = header.value
            header.value = { path: arr }
          }
          if (header.identifier !== '#thumbnail#') header.sortable = true
          return header
        })
        if (changed) localStorage.setItem(props.headersStorageName, JSON.stringify(tst))
        headersRef.value = tst
      }
      const tst2 = localStorage.getItem('savedColumnsSelection')
      if (tst2) savedColumnsSelectionRef.value = tst2

      if (!tst && !tst2 && headersRef.value.length === 0) {
        const defColumns = savedColumnsOptionsRef.value.find(elem => elem.identifier === 'default')
        if (defColumns) {
          savedColumnsSelectionRef.value = defColumns.value
        } else {
          headersRef.value = props.defaultHeadersArr
        }
      }
      loadLOVs()
      DataChanged()
    })

    const parentsRef = ref([])

    function loadParentsIfNecessary () {
      let parents = []
      // if (props.headersStorageName !== 'item_headers') return parents // if not item search

      if (itemsRef.value.length > 0) {
        if (headersRef.value.some(elem => elem.identifier === '#parentName#') && searchEntityRef.value !== 'ITEM_RELATION') {
          parents = itemsRef.value.map(item => {
            const arr = item.path.split('.')
            return arr[arr.length - 2]
          })
        }
        if (headersRef.value.some(elem => elem.identifier === '#sourceParentName#') && searchEntityRef.value === 'ITEM_RELATION') {
          parents = parents.concat(itemsRef.value.map(item => {
            return item.itemId
          }))
        }
        if (headersRef.value.some(elem => elem.identifier === '#targetParentName#') && searchEntityRef.value === 'ITEM_RELATION') {
          parents = parents.concat(itemsRef.value.map(item => {
            return item.targetId
          }))
        }
      }

      if (parents.length) {
        // remove possible duplicates
        const uniqueParentItems = parents.filter((value, index, self) => self.indexOf(value) === index)
        loadItemsByIds(uniqueParentItems).then(data => {
          parentsRef.value = data
          const refresh = parentsRef.value.length === 0
          if (refresh) DataChanged()
        })
      }
    }

    function getParentName (item) {
      if (props.headersStorageName !== 'item_headers') return null // if not item search
      const arr = item.path.split('.')
      const parentId = parseInt(arr[arr.length - 2])
      const parent = parentsRef.value.find(elem => elem.id === parentId)
      return parent ? (parent.name[currentLanguage.value.identifier] || parent.name[defaultLanguageIdentifier.value]) : null
    }

    function getParentNameByItemId (itemId) {
      const parent = parentsRef.value.find(elem => elem.id === parseInt(itemId))
      return parent ? (parent.name[currentLanguage.value.identifier] || parent.name[defaultLanguageIdentifier.value]) : null
    }

    // https://codepen.io/crwilson311/pen/Bajbdwd
    let table, curTableWidth, pageX, curCol, curColWidth
    function divMouseOver (event) {
      event.currentTarget.style.borderRight = '2px solid #000000'
    }
    function divMouseLeave (event) {
      event.currentTarget.style.borderRight = ''
    }
    function divMouseDown (e) {
      curCol = e.currentTarget.parentElement
      table = curCol.parentElement.parentElement
      pageX = e.pageX

      var padding = paddingDiff(curCol)

      curColWidth = curCol.offsetWidth - padding

      curTableWidth = table.offsetWidth
    }
    function divMouseUp (e) {
      curCol = undefined
      pageX = undefined
      curColWidth = undefined
      curTableWidth = undefined
    }
    function divMouseMove (e) {
      if (curCol) {
        var diffX = e.pageX - pageX

        curCol.style.width = (curColWidth + diffX) + 'px'
        table.style.width = (curTableWidth + diffX) + 'px'
      }
    }
    function paddingDiff (col) {
      if (getStyleVal(col, 'box-sizing') === 'border-box') {
        return 0
      }

      var padLeft = getStyleVal(col, 'padding-left')
      var padRight = getStyleVal(col, 'padding-right')
      return (parseInt(padLeft) + parseInt(padRight))
    }
    function getStyleVal (elm, css) {
      return (window.getComputedStyle(elm, null).getPropertyValue(css))
    }

    const buttonActionStatusDialog = ref(null)
    const buttonActions = computed(() => {
      // eslint-disable-next-line no-unused-expressions
      actionLoadedRef.value
      const pathArr = props.item ? props.item.path.split('.').map(elem => parseInt(elem)) : null
      const arr = []

      actions.forEach(action => {
        for (let i = 0; i < action.triggers.length; i++) {
          const trigger = action.triggers[i]

          const result = parseInt(trigger.type) === 6 && // table button
                  ((!trigger.itemType && !trigger.itemFrom) ||
                  (props.item && parseInt(props.item.typeId) === parseInt(trigger.itemType) && pathArr.includes(parseInt(trigger.itemFrom))))
          if (result) {
            const hasRole = currentRoles.some(role => trigger.roles && trigger.roles.includes(parseInt(role.id)))
            if (!trigger.roles || trigger.roles.length === 0 || hasRole) {
              arr.push({ ...trigger, order: action.order })
            }
          }
        }
      })
      arr.sort((a, b) => a.order - b.order)
      return arr
    })

    function executeAction (trigger) {
      if (trigger.askBeforeExec) {
        if (!confirm(i18n.t('Execute') + '?')) return
      }
      processButtonAction(trigger.itemButton)
    }

    async function processButtonAction (button, data) {
      buttonActionStatusDialog.value.showDialog()
      const where = getTableWhere()
      await executeTableButtonAction(props.item ? props.item.internalId : null, button, where || {}, headersRef.value || [], data).then((result) => {
        optionsUpdate(optionsRef.value)
        if (result.data) {
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

    let awaitingFilter = null
    function filterChanged (header) {
      if (awaitingFilter) {
        clearTimeout(awaitingFilter)
        awaitingFilter = null
      }
      if (!awaitingFilter) {
        awaitingFilter = setTimeout(() => {
          applyFilter(header)
        }, 1000)
      }
    }
    const filterHeaders = []
    let filterWhere = null
    function applyFilter (header) {
      if (!header.filter) {
        const idx = filterHeaders.findIndex(elem => elem.identifier === header.identifier)
        if (idx !== -1) filterHeaders.splice(idx, 1)
      } else if (!filterHeaders.some(elem => elem.identifier === header.identifier)) {
        filterHeaders.push(header)
      }

      if (filterHeaders.length === 0) {
        props.loadData().applyFilter(null)
        optionsUpdate(optionsRef.value)
        filterWhere = null
        return
      }

      // calculate new where
      const prevCondition = props.loadData().where
      const arr = [prevCondition]
      const newWhere = { OP_and: arr }
      for (const filterHeader of filterHeaders) {
        const operation = {}
        if (typeof filterHeader.value === 'object' && !Array.isArray(filterHeader.value)) {
          const valuePath = filterHeader.value.path
          let obj = operation
          for (let i = 0; i < valuePath.length - 1; i++) {
            const pathElem = valuePath[i]
            const internalObj = {}
            obj[pathElem] = internalObj
            obj = internalObj
          }
          if (filterHeader.lov) {
            obj[valuePath[valuePath.length - 1]] = filterHeader.multivalue ? { OP_substring: '' + filterHeader.filter } : { OP_eq: filterHeader.filter }
          } else {
            obj[valuePath[valuePath.length - 1]] = { OP_iLike: '%' + filterHeader.filter + '%' }
          }
        } else {
          if (filterHeader.lov) {
            operation[filterHeader.value] = filterHeader.multivalue ? { OP_substring: '' + filterHeader.filter } : { OP_eq: filterHeader.filter }
          } else {
            operation[filterHeader.value] = { OP_iLike: '%' + filterHeader.filter + '%' }
          }
        }
        arr.push(operation)
      }
      if (prevCondition.include) {
        // if we have include at old where we should move it under new where root
        if (prevCondition.where) delete arr[0].include // leave the old where as we have it and delete include to move it
        else arr.splice(0, 1) // we have only include at first level so delete all first condition as we are moving include
        newWhere.include = prevCondition.include
      }

      props.loadData().applyFilter(newWhere)
      filterWhere = newWhere
      optionsUpdate(optionsRef.value)
    }
    function clearFilters () {
      props.loadData().applyFilter(null)
      filterHeaders.forEach(header => {
        header.filter = ''
      })
      filterWhere = null
      filterHeaders.splice(0, filterHeaders.length)
    }
    function getLOVItems (lovId) {
      if (!lovsMap) return []
      const lovValues = lovsMap[lovId]
      if (!lovValues) return []
      return lovValues.map(elem => { return { value: elem.id, text: elem.value[currentLanguage.value.identifier] || '[' + elem.value[defaultLanguageIdentifier.value] + ']' } })
    }

    function getTableWhere () {
      return filterWhere || props.loadData().where
    }

    return {
      columnsSelectionDialogRef,
      columnsSaveDialogRef,
      cellClicked,
      inplaceItem,
      inplaceHeader,
      inplaceAttribute,
      inplaceValue,
      inplaceBlur,
      inplaceLovSelection,
      inplaceMultivalue,
      dateMenu,
      getAvailableColumns: props.availableColumns,
      timeMenu,
      timeMenuRef,
      time,
      AttributeType,
      loadColumns,
      itemsRef,
      totalItemsRef,
      headersRef,
      currentLanguage,
      searchEntityRef,
      defaultLanguageIdentifier,
      DataChanged,
      getValue,
      headerSort,
      optionsUpdate,
      optionsRef,
      loadingRef,
      editHeaders,
      columnsSelected,
      damUrl: window.location.href.indexOf('localhost') >= 0 ? process.env.VUE_APP_DAM_URL : window.OPENPIM_SERVER_URL + '/',
      token: localStorage.getItem('token'),
      getThumbnail,
      exportData,
      exportExcel,
      importExcel,
      massUpdate,
      massUpdateInputRef,
      massUpdatePageSizeRef,
      massUpdateSkipActionsRef,
      massUpdateHeaderRef,
      massUpdateActionRef,
      showMassUpdateDialog,
      fileUploadRef,
      excelDialogRef,
      excelDialogProgressRef,
      excelDialogTitleRef,
      excelDialogClose,
      hasAccess,
      savedColumnsOptionsRef,
      savedColumnsSelectionRef,
      savedOptionsVisible,
      talendExportSelection: props.export,
      hasChannelsRef,
      chanSelectionDialogRef,
      tempSelectionDialogRef,
      templates,
      optionsTemplates,
      channelsSelected,
      templateSelected,
      collSelectionDialogRef,
      collectionsSelected,
      deleteFromCollection,
      deleteFromCollections,
      openSearch,
      attrSelectionDialogRef,
      attrGroupsSelected,
      selectAttrGroups,
      pageSize,
      tableFooterRef,
      pageSizeChanged,
      pageChanged,
      divMouseOver,
      divMouseLeave,
      divMouseUp,
      divMouseDown,
      divMouseMove,
      getParentName,
      getParentNameByItemId,
      importFinishedDialogRef,
      importFinishedLogRef,
      importConfigDialogRef,
      massUpdateDialogRef,
      importModeRef,
      importModes,
      importStopOnErrorRef,
      importEmptyValuesRef,
      importPageSizeRef,
      downloadImportFinishedLog,
      dateFormat,
      buttonActions,
      executeAction,
      processButtonAction,
      getTableWhere,
      buttonActionStatusDialog,
      filterChanged,
      getLOVItems,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT,
      required: value => !!value || i18n.t('ItemRelationsList.Required'),
      pageSizePositive: value => parseInt(value) > 1 || i18n.t('ItemRelationsList.MustBePositive'),
      getValueForRelationAttribute,
      relationAttributesItemsRef,
      goto
    }
  },
  methods: {

  }
}

</script>
<style>
  .truncate {
    max-width: 1px;
    overflow: hidden;
    border-right: thin solid rgba(0, 0, 0, 0.12);
    border-bottom: thin solid rgba(0, 0, 0, 0.12);
  }

  .truncate > span {
    white-space: pre-wrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    /* number of visible lines */
    -webkit-line-clamp: 10;
    -webkit-box-orient: vertical;
  }

  .zebra:nth-of-type(even) {
    background-color: #FCFCFC;
  }

  th.dataTableHeader {
    white-space: nowrap;
    height: 80px;
    border-right: thin solid rgba(0, 0, 0, 0.12);
    background-color: rgb(240, 240, 240);
    position: sticky;
    top: 0;
    z-index: 1;
  }

  div.resizer {
    position:absolute;
    top: 0px; right: -1px;
    width: 5px;
    cursor: col-resize;
    user-select: none;
    height: 80px;
  }
</style>
