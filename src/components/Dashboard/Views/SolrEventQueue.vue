<template>
  <solr-page :pageName="name" :refreshInterval=10000>
  </solr-page>
</template>

<script>
import SolrPage from '@/components/UIComponents/SolrPage.vue'

export default {

    components: {
      'solr-page': SolrPage
    },

    data() {
      return {
        name: "eventQueue"
      }
    }
}
</script>
