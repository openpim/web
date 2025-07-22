<template>
  <pdf :src="src"></pdf>
</template>
<script>
import pdf from 'vue-pdf'

export default {
  components: {
    pdf
  },
  name: 'PDFViewer',
  props: {
    src: {
      required: true
    }
  }
}
</script>
