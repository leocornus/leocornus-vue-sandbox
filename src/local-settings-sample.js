/**
 * some sample data for local settings
 * copy this file to local-settings.js and update with your local settings.
 */
export default {

  install(Vue) {
    Vue.mixin({

      created: function() {

        this.$localSettings = {

            /**
             * some common settings
             */
            sideBarTitle: "in local",
            sideBarTitleLogo: "static/img/vue-logo.png",
            topNavBarBrandTitle: "Title in local",

            /**
             * local settings for real estate try out.
             */
            reSearchUrl: 'https://search.example.com/rest/searchApi/search',

            /**
             * lcoal settings for SharePoint Online try out.
             */
            targetSource: 'https://onegroup.sharepoint.com',
            sharepointSite: '/sites/qasite',
            accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1N'
        }
      }
    })
  }
}
