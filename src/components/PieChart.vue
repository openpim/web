<template>
  <Pie :data="data" :options="options"/>
</template>

<script>

import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default {
  components: { Pie },
  props: ['data', 'options']
}
</script>
