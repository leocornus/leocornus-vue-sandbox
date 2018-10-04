<template>
  <solr-page :pageName="name">
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
        name: "tracking"
      }
    }
}
</script>
