<template>
   <div class="nav-resizer bg-grey-lighten-2" :style="{left: left+'px'}" @mousedown="startDrag"></div>
</template>

<script>
import { onBeforeUnmount } from 'vue'

export default {
  props: {
    left: {
      type: Number,
      required: true
    }
  },
  setup (props, { emit }) {
    const resize = (e) => {
      if (e.screenX < 30) return

      emit('onResize', e.screenX)
    }

    const startDrag = () => {
      document.body.style.cursor = 'ew-resize'
      document.addEventListener('mousemove', resize, false)
      document.addEventListener('mouseup', endDrag, false)
    }

    const endDrag = () => {
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', endDrag)
    }

    onBeforeUnmount(() => {
      endDrag()
    })

    return {
      startDrag,
      endDrag
    }
  }
}
</script>
<style>
.v-navigation-drawer {
  transition: unset;
}
.nav-resizer {
  width: 3px;
  cursor: ew-resize;
  position: absolute;
  top: 0;
  bottom: 0;
}
</style>
