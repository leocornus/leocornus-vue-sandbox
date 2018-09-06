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
            footerTitle: "Footer title",

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
              {to: '/admin/solrsearch', 
               iconClass: 'nc-icon nc-circle-09',
               title: 'Solr Search'},
              {to: '/admin/sptryout', 
               iconClass: 'nc-icon nc-circle-09',
               title: 'SPO Metadata'}
            ],

            /**
             * settings for Solr search
             */
            solrRestBaseUrl: "https://search.example.com/solr/projects/",
            // the base URL for tracking core.
            solrTrackingUrl: "https://search.example.com/solr/track/",

            // the function to customize each field: field name and field value.
            // NOTE: It is used in ListingDetails component.
            // the field will be an Object with 2 properties:
            // {fieldName: "a name", fieldValue: "a value"}
            customizeField: function(field) {
                // This is a callback for Array.map
                return field;
            },

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
