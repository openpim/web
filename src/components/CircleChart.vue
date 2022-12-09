<template>
  <Doughnut :data="data" :options="options"/>
</template>

<script>

import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default {
  components: { Doughnut },
  props: ['data', 'options']
}
</script>
