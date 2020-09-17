<template>
  <div>
    <BarChart v-if="component.chart === 1 && loadedRef" :data="dataRef" :options="{onClick: function(event, item){chartClick(event, item)},legend: {display: false}, title: {display: true, text: component.title}}"></BarChart>
    <HorizontalBarChart v-if="component.chart === 2 && loadedRef" :data="dataRef" :options="{onClick: function(event, item){chartClick(event, item)},legend: {display: false}, title: {display: true, text: component.title}}"></HorizontalBarChart>
    <CircleChart v-if="component.chart === 3 && loadedRef" :data="dataRef" :options="{onClick: function(event, item){chartClick(event, item)},title: {display: true, text: component.title}}"></CircleChart>
    <PieChart v-if="component.chart === 4 && loadedRef" :data="dataRef" :options="{onClick: function(event, item){chartClick(event, item)},title: {display: true, text: component.title}}"></PieChart>
  </div>
</template>
<script>
import { ref, onMounted } from '@vue/composition-api'
import * as dashStore from '../store/dashboards'
import * as searchStore from '../store/search'
import BarChart from './BarChart'
import HorizontalBarChart from './HorizontalBarChart'
import CircleChart from './CircleChart'
import PieChart from './PieChart'
import router from '../router'

export default {
  components: { BarChart, HorizontalBarChart, PieChart, CircleChart },
  props: {
    dashboard: {
      required: true
    },
    component: {
      required: true
    }
  },
  setup (props) {
    const {
      getDashboardComponentData
    } = dashStore.useStore()

    const {
      searchToOpenRef
    } = searchStore.useStore()

    const loadedRef = ref(false)
    const dataRef = ref(null)

    onMounted(() => {
      getDashboardComponentData(props.dashboard.id, props.component.id).then(data => {
        if (data) {
          dataRef.value = data
          loadedRef.value = true
        }
      })
    })

    function chartClick (event, item) {
      if (props.component.type === 2) {
        // list of queries
        const where = props.component.queries[item[0]._index].where
        searchToOpenRef.value = { whereClause: JSON.parse(where), extended: true }
        router.push('/search/')
      } else {
        // group by
        let data = dataRef.value.labels[item[0]._index]

        let where

        const query = {}
        const groupBy = props.component.groupBy
        if (groupBy.startsWith('name#')) {
          const lang = groupBy.substring(5)
          query.name = {}
          query.name[lang] = data
        } else if (groupBy.startsWith('attr#')) {
          const idx = groupBy.indexOf('#', 5)

          if (dataRef.value.lovValues) {
            const tst = dataRef.value.lovValues.find(lovItem => lovItem.value.ru === data)
            debugger
            if (tst) data = tst.id
          }

          if (idx === -1) {
            const attr = groupBy.substring(5)
            query.values = {}
            query.values[attr] = data
          } else {
            const attr = groupBy.substring(5, idx)
            const lang = groupBy.substring(idx + 1)
            query.values = {}
            query.values[attr] = {}
            query.values[attr][lang] = data
          }
        } else {
          query[props.component.groupBy] = data
        }

        if (props.component.groupWhere) {
          where = {
            OP_and: [
              query,
              JSON.parse(props.component.groupWhere)
            ]
          }
        } else {
          where = query
        }
        searchToOpenRef.value = { whereClause: where, extended: true }
        router.push('/search/')
      }
    }

    return {
      loadedRef,
      dataRef,
      chartClick
    }
  }
}
</script>
