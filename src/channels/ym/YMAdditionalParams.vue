<template>
  <v-data-table
    :headers="headers"
    :items="data"
    sort-by="calories"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>Дополнительные параметры</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialog"
          max-width="500px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              dark
              icon
              class="mb-2"
              v-bind="attrs"
              v-on="on"
            >
            <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-text-field
                    v-model="editedItem.id"
                    label="Наименование"
                  ></v-text-field>
                </v-row>
                <v-row>
                  <v-autocomplete dense :readonly="readonly" v-model="editedItem.attrIdent" :items="pimAttributesRef" clearable label="Атрибут"></v-autocomplete>
                </v-row>
                <v-row
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-textarea
                    v-model="editedItem.expr"
                    label="Выражение"
                  ></v-textarea>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                text
                @click="close"
              >
                Отмена
              </v-btn>
              <v-btn
                color="blue darken-1"
                text
                @click="save"
              >
                Сохранить
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Удалить параметр?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete">Отмена</v-btn>
              <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        small
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
export default {
  props: {
    headers: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    pimAttributesRef: {
      type: Array,
      required: true
    },
    readonly: {
      type: Boolean,
      required: true
    }
  },
  setup (props) {
    const dialog = ref(false)
    const dialogDelete = ref(false)
    const editedIndex = ref(-1)

    const itemTemplate = {
      id: '',
      attrIdent: '',
      expr: ''
    }

    const defaultItem = ref({ ...itemTemplate })
    const editedItem = ref({ ...itemTemplate })

    function editItem (item) {
      editedIndex.value = props.data.indexOf(item)
      editedItem.value = Object.assign({}, item)
      dialog.value = true
    }

    function deleteItem (item) {
      editedIndex.value = props.data.indexOf(item)
      editedItem.value = Object.assign({}, item)
      dialogDelete.value = true
    }

    function deleteItemConfirm () {
      props.data.splice(editedIndex.value, 1)
      closeDelete()
    }

    function close () {
      dialog.value = false
      editedItem.value = Object.assign({}, defaultItem.value)
      editedIndex.value = -1
    }

    function closeDelete () {
      dialogDelete.value = false
      editedItem.value = Object.assign({}, defaultItem.value)
      editedIndex.value = -1
    }

    function save () {
      if (editedIndex.value > -1) {
        Object.assign(props.data[editedIndex.value], editedItem.value)
      } else {
        props.data.unshift(editedItem.value)
      }
      close()
    }

    const formTitle = computed(() => {
      return editedIndex.value === -1 ? 'Новый параметр' : 'Редактирование параметра'
    })

    return {
      dialog,
      dialogDelete,
      editedItem,
      editItem,
      deleteItem,
      deleteItemConfirm,
      save,
      close,
      closeDelete,
      formTitle
    }
  }
}
</script>
