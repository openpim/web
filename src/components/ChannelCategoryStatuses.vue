<template>
  <div style="position: relative;">
    <a href="#" @click.stop="barClick(1)"><v-sheet v-if="submittedPercent" style="display: inline-block; position: absolute;" color="#78909C" elevation="1" height="20" :width="submittedPercent+'%'"></v-sheet></a>
    <a href="#" @click.stop="barClick(2)"><v-sheet v-if="synckedPercent" :style="'display: inline-block; position: absolute; left: '+ submittedPercent + '%'" color="#66BB6A" elevation="1" height="20" :width="synckedPercent+'%'"></v-sheet></a>
    <a href="#" @click.stop="barClick(3)"><v-sheet v-if="errorPercent" :style="'display: inline-block; position: absolute; left: '+ ( submittedPercent + synckedPercent )+ '%'" color="#EF5350" elevation="1" height="20" :width="errorPercent+'%'"></v-sheet></a>
  </div>
</template>
<script>
import { computed } from '@vue/composition-api'

export default {
  props: {
    submitted: {
      required: true
    },
    syncked: {
      required: true
    },
    error: {
      required: true
    }
  },
  setup (props, { emit }) {
    const submittedPercent = computed(() => {
      return 90 * props.submitted / (props.submitted + props.syncked + props.error)
    })
    const synckedPercent = computed(() => {
      return 90 * props.syncked / (props.submitted + props.syncked + props.error)
    })
    const errorPercent = computed(() => {
      return 90 * props.error / (props.submitted + props.syncked + props.error)
    })

    function barClick (status) {
      emit('click', status)
    }

    return {
      submittedPercent,
      synckedPercent,
      errorPercent,
      barClick
    }
  }
}
</script>
