<template>
<v-app>
  <v-navigation-drawer app></v-navigation-drawer>
  <v-toolbar app></v-toolbar>
  <v-content>
    <v-container fluid>
      <router-view></router-view>
    </v-container>
  </v-content>
  <v-footer app></v-footer>
</v-app>
</template>
<style lang="scss">

</style>
<script>
  //  vutify css.
  import 'vuetify/dist/vuetify.min.css'

  export default {
  }
</script>
