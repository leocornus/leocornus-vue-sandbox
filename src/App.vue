<template>
  <div :class="{'nav-open': $sidebar.showSidebar}">
    <notifications></notifications>
    <router-view @authenticated="setAuthenticated"></router-view>
  </div>
</template>

<script>
export default {
    data() {
        return {
            authenticated: false
        }
    },

    computed: {
        mockAccount: function() {

            if(this.$localSettings.hasOwnProperty('mockAccount')) {
                return this.$localSettings.mockAccount;
            } else {
                return {
                   username:"seanchen", 
                   password:"supervue1"
                };
            }
        }
    },

    mounted() {
        if(localStorage.getItem('user') == null) {
            this.$router.replace({name:"login"});
        }
    },

    methods: {
        setAuthenticated(status) {

            this.authenticated = status;
        },

        logout() {

            this.authenticated = false;
        }
    }
}
</script>
<style lang="scss">
  .vue-notifyjs.notifications{
    .list-move {
      transition: transform 0.3s, opacity 0.4s;
    }
    .list-item {
      display: inline-block;
      margin-right: 10px;

    }
    .list-enter-active {
      transition: transform 0.2s ease-in, opacity 0.4s ease-in;
    }
    .list-leave-active {
      transition: transform 1s ease-out, opacity 0.4s ease-out;
    }

    .list-enter {
      opacity: 0;
      transform: scale(1.1);

    }
    .list-leave-to {
      opacity: 0;
      transform: scale(1.2, 0.7);
    }
  }
</style>
