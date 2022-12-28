<template>
  <Bar :data="data" :options="extendedOptions"/>
</template>

<script>

import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'HorizontalBarChart',
  components: { Bar },
  props: ['data', 'options'],
  setup (props) {
    const extendedOptions = {
      ...props.options,
      indexAxis: 'y'

    }

    return {
      extendedOptions
    }
  }
}
</script>
