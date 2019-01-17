<template>
  <div class="wrapper">
      <top-navbar></top-navbar>

      <dashboard-content @click="toggleSidebar">

      </dashboard-content>

      <content-footer></content-footer>
  </div>
</template>
<style lang="scss">

</style>
<script>
  import TopNavbar from './TopNavbarOneColumn.vue'
  import ContentFooter from './ContentFooter.vue'
  import DashboardContent from './Content.vue'
  export default {
    computed: {
    },
    components: {
      TopNavbar,
      ContentFooter,
      DashboardContent,
    },
    methods: {
      toggleSidebar () {
        if (this.$sidebar.showSidebar) {
          this.$sidebar.displaySidebar(false)
        }
      }
    }
  }

</script>
