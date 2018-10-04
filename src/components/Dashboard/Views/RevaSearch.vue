<template>
  <attivio-page :pageName="name">
  </attivio-page>
</template>

<script>
import AttivioPage from '@/components/UIComponents/AttivioPage.vue'

export default {

    components: {
      'attivio-page': AttivioPage 
    },

    data() {
      return {
        name: "reva"
      }
    }
}
</script>
