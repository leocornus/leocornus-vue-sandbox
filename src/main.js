import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

import BootstrapVue from 'bootstrap-vue'

// LightBootstrap plugin
import LightBootstrap from './light-bootstrap-main'

// bootstrap-vue css.
import 'bootstrap-vue/dist/bootstrap-vue.css'

// local settings
import LocalSettings from './local-settings.js'

// router setup
import routes from './routes/routes'

Vue.use(BootstrapVue)
// plugin setup
Vue.use(VueRouter)
Vue.use(LightBootstrap)
Vue.use(LocalSettings)

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkActiveClass: 'nav-item active'
})

// use the before each to restric access.
router.beforeEach((to, from, next) => {
    if(to.fullPath == "/login") {
        next();
    } else if(localStorage.getItem('user') == null) {
        next({
            name: "login",
            params: { nextUrl: to.fullPath }
        });
    } else {
        next();
    }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router
})
