<template>
  <div class="wrapper">
    <side-bar :title="sideBarTitle" :logoImg="sideBarTitleLogo">
      <mobile-menu slot="content"></mobile-menu>
      <sidebar-link v-for="(link, index) in this.$localSettings.sideBarLinks"
                    :to="link.to" :key="index">
        <i :class="link.iconClass"></i>
        <p>{{link.title}}</p>
      </sidebar-link>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <dashboard-content @click="toggleSidebar">

      </dashboard-content>

      <content-footer></content-footer>
    </div>
  </div>
</template>
<style lang="scss">

</style>
<script>
  import TopNavbar from './TopNavbar.vue'
  import ContentFooter from './ContentFooter.vue'
  import DashboardContent from './Content.vue'
  import MobileMenu from './MobileMenu.vue'
  export default {
    computed: {
      sideBarTitle() {
        return this.$localSettings.sideBarTitle;
      },
      sideBarTitleLogo() {
        return this.$localSettings.sideBarTitleLogo;
      }
    },
    components: {
      TopNavbar,
      ContentFooter,
      DashboardContent,
      MobileMenu
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
