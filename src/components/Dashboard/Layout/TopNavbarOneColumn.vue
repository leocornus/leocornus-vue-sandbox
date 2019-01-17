<template>
  <nav class="navbar navbar-expand-lg mb-2">
    <div class="container">
      <a class="navbar-brand" href="#">VO Components</a>
      <div class="collapse navbar-collapse justify-content-end">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <a class="nav-link" href="/#/game/gameboard">
              GameBoard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/#/game/teamboard">
              TeamBoard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click="logout">
              Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
  export default {
    computed: {
      topNavBarBrandTitle() {
        return this.$localSettings.topNavBarBrandTitle;
      },

      routeName () {
        const {name} = this.$route
        return this.capitalizeFirstLetter(name)
      }
    },
    data () {
      return {
        activeNotifications: false
      }
    },
    methods: {

      logout() {

        localStorage.removeItem('user');
        this.$router.push({name:'login'});
      },

      capitalizeFirstLetter (string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
      },
      toggleNotificationDropDown () {
        this.activeNotifications = !this.activeNotifications
      },
      closeDropDown () {
        this.activeNotifications = false
      },
      toggleSidebar () {
        this.$sidebar.displaySidebar(!this.$sidebar.showSidebar)
      },
      hideSidebar () {
        this.$sidebar.displaySidebar(false)
      }
    }
  }

</script>
<style>

</style>
