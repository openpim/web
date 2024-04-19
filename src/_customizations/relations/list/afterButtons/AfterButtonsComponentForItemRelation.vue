<template>
  <div v-if="false" class="pa-1"></div>
</template>
<script>
export default {
  props: {
    item: {
      required: true
    },
    componentType: {
      required: true
    },
    relationIdentifier: {
      required: true
    },
    itemRel: {
      required: true
    }
  },
  setup (props) {
    return {
    }
  }
}
</script>
