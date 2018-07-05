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
             * set the side bar links.
             */
            sideBarLinks: [
              {to: '/admin/overview', 
               iconClass: 'nc-icon nc-chart-pie-35',
               title: 'Overview'},
              {to: '/admin/realestate', 
               iconClass: 'nc-icon nc-circle-09',
               title: 'Real Estate'},
              {to: '/admin/d3tryout', 
               iconClass: 'nc-icon nc-circle-09',
               title: 'D3 Tryout'},
              {to: '/admin/sptryout', 
               iconClass: 'nc-icon nc-circle-09',
               title: 'SPO Metadata'}
            ],

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
