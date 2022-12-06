<template>
  <v-dialog v-model="selectionDialogRef" persistent max-width="95%">
    <v-card>
      <v-card-title>
        <span class="headline">{{ $t('ColumnsSelection.Title') }}</span>
      </v-card-title>
      <v-card-text>
        <v-container class="pt-0">
          <v-row>
            <v-col cols="7"  class="pt-0">
              <v-text-field v-model="leftFilterRef" :label="$t('Filter')" required></v-text-field>
              <div>{{$t('ColumnsSelection.AvailableColumns')}}</div>
              <v-list nav dense style="max-height: 400px" class="overflow-y-auto">
                <v-list-item-group multiple v-model="selectedLeftRef" color="primary">
                  <v-list-item v-for="(elem, i) in availableColumnsComputed" :key="i">
                    <v-list-item-content>
                      <v-list-item-title>{{elem.text}}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-col cols="1" align="center">
              <v-btn class="mt-10" @click="moveFromLeft" :disabled="selectedLeftRef.length===0"><v-icon>mdi-arrow-right-bold-circle-outline</v-icon></v-btn>
              <v-btn class="mt-3" @click="moveFromRight" :disabled="selectedRightRef.length===0"><v-icon>mdi-arrow-left-bold-circle-outline</v-icon></v-btn>
              <v-btn class="mt-10" @click="moveUp" :disabled="selectedRightRef.length!==1"><v-icon>mdi-arrow-up-bold-circle-outline</v-icon></v-btn>
              <v-btn class="mt-3" @click="moveDown" :disabled="selectedRightRef.length!==1"><v-icon>mdi-arrow-down-bold-circle-outline</v-icon></v-btn>
              <v-btn class="mt-10" @click="moveFromLeftAll"><v-icon>mdi-arrow-right-bold-circle</v-icon></v-btn>
              <v-btn class="mt-3" @click="moveFromRightAll"><v-icon>mdi-arrow-left-bold-circle</v-icon></v-btn>
            </v-col>
            <v-col cols="4" class="pt-0">
              <v-text-field v-model="rightFilterRef" :label="$t('Filter')" required></v-text-field>
              <div>{{$t('ColumnsSelection.SelectedColumns')}}</div>
              <v-list nav dense style="max-height: 400px" class="overflow-y-auto">
                <v-list-item-group multiple v-model="selectedRightRef" color="primary">
                  <v-list-item v-for="(elem, i) in selectedColumnsComputed" :key="i">
                    <v-list-item-content>
                      <v-list-item-title>{{elem.text}}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="selectionDialogRef = false">{{ $t('Cancel') }}</v-btn>
        <v-btn color="blue darken-1" text @click="selected">{{ $t('Select') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { ref, computed } from 'vue'

export default {
  name: 'ColumnsSelection',

  props: {
    getColumns: {
      type: Function,
      required: true
    }
  },

  setup (props, { emit }) {
    const leftFilterRef = ref('')
    const rightFilterRef = ref('')
    const selectedLeftRef = ref([])
    const selectedRightRef = ref([])
    const availableColumnsRef = ref([])
    const selectedColumnsRef = ref([])
    const selectionDialogRef = ref(false)
    const maxColumnsNumber = 100

    const availableColumnsComputed = computed(() => {
      if (leftFilterRef.value) {
        return availableColumnsRef.value.filter(elem => elem.text.toLowerCase().indexOf(leftFilterRef.value.toLowerCase()) !== -1).slice(0, maxColumnsNumber)
      } else {
        return availableColumnsRef.value.slice(0, maxColumnsNumber)
      }
    })

    const selectedColumnsComputed = computed(() => {
      if (rightFilterRef.value) {
        return selectedColumnsRef.value.filter(elem => elem.text.toLowerCase().indexOf(rightFilterRef.value.toLowerCase()) !== -1)
      } else {
        return selectedColumnsRef.value
      }
    })

    function moveFromLeft () {
      const arrToMove = selectedLeftRef.value.map(idx => availableColumnsComputed.value[idx].identifier)
      arrToMove.forEach(ident => {
        const save = availableColumnsComputed.value.find(elem => elem.identifier === ident)
        const idx = availableColumnsRef.value.findIndex(elem => elem.identifier === save.identifier)
        availableColumnsRef.value.splice(idx, 1)
        if (save.textShort) save.text = save.textShort
        selectedColumnsRef.value.push(save)
      })
      selectedLeftRef.value = []
    }

    function moveFromRight () {
      const arrToMove = selectedRightRef.value.map(idx => selectedColumnsComputed.value[idx].identifier)
      arrToMove.forEach(ident => {
        const save = selectedColumnsComputed.value.find(elem => elem.identifier === ident)
        const idx = selectedColumnsRef.value.findIndex(elem => elem.identifier === save.identifier)
        selectedColumnsRef.value.splice(idx, 1)
        if (save.textLong) save.text = save.textLong
        availableColumnsRef.value.push(save)
      })
      selectedRightRef.value = []
    }

    function moveUp () {
      const idx = selectedRightRef.value[0]
      if (idx !== 0) {
        const newIdx = idx - 1
        const elem = selectedColumnsRef.value.splice(idx, 1)[0]
        selectedColumnsRef.value.splice(newIdx, 0, elem)
        selectedRightRef.value = [newIdx]
      }
    }

    function moveDown () {
      const idx = selectedRightRef.value[0]
      if (idx !== selectedColumnsRef.value.length - 1) {
        const newIdx = idx + 1
        const elem = selectedColumnsRef.value.splice(idx, 1)[0]
        selectedColumnsRef.value.splice(newIdx, 0, elem)
        selectedRightRef.value = [newIdx]
      }
    }

    function moveFromLeftAll () {
      const arrToMove = availableColumnsComputed.value.map(elem => elem.identifier)
      arrToMove.forEach(ident => {
        const save = availableColumnsComputed.value.find(elem => elem.identifier === ident)
        const idx = availableColumnsRef.value.findIndex(elem => elem.identifier === save.identifier)
        availableColumnsRef.value.splice(idx, 1)
        if (save.textShort) save.text = save.textShort
        selectedColumnsRef.value.push(save)
      })
      selectedLeftRef.value = []
    }

    function moveFromRightAll () {
      const arrToMove = selectedColumnsComputed.value.map(elem => elem.identifier)
      arrToMove.forEach(ident => {
        const save = selectedColumnsComputed.value.find(elem => elem.identifier === ident)
        const idx = selectedColumnsRef.value.findIndex(elem => elem.identifier === save.identifier)
        selectedColumnsRef.value.splice(idx, 1)
        if (save.textLong) save.text = save.textLong
        availableColumnsRef.value.push(save)
      })
      selectedRightRef.value = []
    }

    function selected () {
      emit('selected', selectedColumnsRef.value)
    }

    function showDialog (selected, onlyAttributes) {
      selectedColumnsRef.value = selected
      const arr = props.getColumns(onlyAttributes)
      availableColumnsRef.value = arr.filter(elem => !selected.find(elem2 => elem2.identifier === elem.identifier)) // .sort((a, b) => a.identifier.localeCompare(b.identifier))
      selectionDialogRef.value = true
    }

    function closeDialog () {
      selectionDialogRef.value = false
    }

    return {
      selectedLeftRef,
      selectedRightRef,
      selectionDialogRef,
      selected,
      showDialog,
      closeDialog,
      moveFromLeft,
      moveFromRight,
      moveUp,
      moveDown,
      moveFromLeftAll,
      moveFromRightAll,
      leftFilterRef,
      rightFilterRef,
      availableColumnsComputed,
      selectedColumnsComputed
    }
  }
}
</script>
