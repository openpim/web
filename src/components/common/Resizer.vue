<template>
   <div class="resizer" :style="{left: left+'px'}" @mousedown="startDrag"></div>
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
    /* function setResizeEvents () {
      // TODO: fix

      const el = drawerRef.value.$el
      const drawerBorder = el.querySelector('.v-navigation-drawer__border')
      const direction = el.classList.contains('v-navigation-drawer--right')
        ? 'right'
        : 'left'

      function resize (e) {
        if (e.screenX < 30) return

        document.body.style.cursor = 'ew-resize'
        const f = direction === 'right'
          ? document.body.scrollWidth - e.clientX
          : e.clientX
        el.style.width = f + 'px'
      }

      drawerBorder.addEventListener(
        'mousedown',
        function (e) {
          if (e.offsetX < 30) {
            el.style.transition = 'initial'; document.addEventListener('mousemove', resize, false)
          }
        },
        false
      )

      document.addEventListener(
        'mouseup',
        function () {
          el.style.transition = ''
          drawerWidth.value = el.style.width
          localStorage.setItem('drawerWidth', el.style.width)
          document.body.style.cursor = ''
          document.removeEventListener('mousemove', resize, false)
        },
        false
      )

     }
*/
    const resize = (e) => {
      if (e.screenX < 30) return

      //
      // const f = direction === 'right'
      //   ? document.body.scrollWidth - e.clientX
      //   : e.clientX

      console.log('resize', e.screenX, emit)
      emit('onResize', e.screenX)
    }

    const startDrag = (e) => {
      console.log('startDrag')
      document.body.style.cursor = 'ew-resize'
      document.addEventListener('mousemove', resize, false)
      document.addEventListener('mouseup', endDrag, false)
    }

    const endDrag = (e) => {
      console.log('endDrag')
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', endDrag)
    }

    onBeforeUnmount(() => {
      console.log('beforeUnmount')
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

.resizer {
  width: 3px;
  cursor: ew-resize;
  position: absolute;
  top: 0;
  bottom: 0;
  background: red;
}
</style>
