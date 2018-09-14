<template>
<div class="content container">
  <div id="search-app">

    <b-input-group class="mb-2">
      <b-dropdown right text="Choose Event Queue">
        <b-dropdown-item v-for="(queue, index) in eventQueues" :key="index"
                         v-on:click="switchQueue(queue.name, index)"
        >{{queue.name}}</b-dropdown-item>
      </b-dropdown>
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">{{queueLabel}}</span>
      </b-input-group-append>
      <b-form-input type="text" class="form-control" id="restBaseUrl"
             aria-describedby="restBaseUrl-addon"
             v-model="restBaseUrl"
             placeholder="RESTful API base URL https://www.rest.com"/>
    </b-input-group>

    <b-input-group size="lg" class="mb-2 d-none">
      <b-form-input type="text" id="inputQuery"
             v-model="query"
             v-on:keyup.enter.native="simpleSearch"
             placeholder="Search b-form-group for..."/>
      <b-input-group-append>
        <b-button variant="outline-primary" size="lg"
                v-on:click="simpleSearch">Search!</b-button>
      </b-input-group-append>
    </b-input-group>

    <!-- result list -->
    <p>
      <div class="row">
        <div class="col-3">
          <h3 class="m-0">Facets</h3>
          <!-- statistics :stats="stats"></statistics -->
          <facet-buckets v-for="(facet, index) in facets" :facet="facet" :key="index">
          </facet-buckets>
        </div>
        <div class="col-9 accordion">
          <h3 class="m-0">{{resultSummary}}
            <a href="#" class="badge badge-pill badge-primary float-right"
               v-on:click="loadEvents">Refresh</a>
          </h3>
          <!-- results-list :docs="results" v-if="results">
          </results-list -->
          <b-pagination :total-rows="totalHits" :per-page="perPage" v-if="results"
                        v-model="currentPage" align="center"></b-pagination>
          <listing-details v-for="(doc, index) in results" :doc="doc" :key="index" :index="index">
          </listing-details>
          <b-pagination :total-rows="totalHits" :per-page="perPage" v-if="results"
                        v-model="currentPage" align="center"></b-pagination>
        </div>
      </div>
    </p>
  </div>
</div>
</template>

<script>
// components from bootstrap-vue.
import bButton from 'bootstrap-vue/es/components/button/button'
import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group'
import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append'
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input'
import bDropdown from 'bootstrap-vue/es/components/dropdown/dropdown'
import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item'
import bPagination from 'bootstrap-vue/es/components/pagination/pagination'

import axios from 'axios'
import ListingDetails from '@/components/UIComponents/ListingDetails.vue'
import FacetBuckets from '@/components/UIComponents/FacetBuckets.vue'

import solr from '@/libs/solr'

export default {
    components: {
      'listing-details': ListingDetails,
      'facet-buckets': FacetBuckets,
      'b-dropdown': bDropdown,
      'b-dropdown-item': bDropdownItem,
      'b-input-group': bInputGroup,
      'b-input-group-append': bInputGroupAppend,
      'b-form-input': bFormInput,
      'b-button': bButton,
      'b-pagination' : bPagination
    },

    data() {
      return {
        restBaseUrl: 'http://search.example.com',
        // available event queues.
        eventQueues: [],
        // label for the current event queue
        eventLabel: "",
        query: '*:*',
        // default facet field is empty.
        facetFields: "",

        // set the default filter query to empty.
        filterQuery: "",

        // set the default sort
        sort: "",

        // set default field list to empty, which will return all fields.
        fieldList: "",

        totalHits: 0,
        facets: null,
        stats: null,
        results: null,

        // pagination properties.
        currentPage: 1,
        perPage: 10,

        // 
        resultSummary: "Click search to start.."
      }
    },

    computed: {
      // produce the csv format.
      resultsInCSV: function() {
          return "TODO: result list in CSV format!";
      }

      // the input event keyup.enter is broken in the 
      // b-form-input component.
      // we will using he $listeners property to override
      // check this page for details:
      // https://vuejs.org/v2/guide/components-custom-events.html#Binding-Native-Events-to-Components
    },

    watch: {
      // watch current page.
      currentPage: function(newValue) {
          // reload page.
          console.log("Watching currentPage: " + newValue);
          this.loadEvents();
      }
    },

    methods: {

        /**
         */
        loadEvents() {

            var vm = this;

            vm.resultSummary = "Searching Events ...";
            vm.results = null;

            // the parameters for query.
            // we will use Object assign to merge them all together.
            var params = Object.assign({
              rows: vm.perPage,
              start: (vm.currentPage - 1) * vm.perPage,
              sort: "eventSummary.messageTime desc"
            }, vm.getFacetFields(), vm.getFilterQuery());

            // this will show how to use query parameters in a JSON request.
            var postParams = {
                query: "eventData.ItemUrl:[* TO *]",
                // we could mix parameters and JSON request.
                params: params
            }

            var endPoint = this.restBaseUrl + "select";

            // track the post parameters.
            // the Object assign will merge / copy source object to target
            // object.
            var trackPayload = Object.assign({"end_point" : endPoint},
                                             postParams);
            solr.track(trackPayload);

            // the query url should be some thing like this: 
            // - 'https://one.sites.leocorn.com/rest/searchApi/search',
            // it is seems easier to use query parameters in a JSON request.
            axios.post(endPoint, postParams)
            .then(function(response) {

                console.log(response.data);
                vm.totalHits = response.data.response.numFound;

                vm.results = response.data.response.docs;
                //console.log(vm.results);

                // check if we have facets in response.
                // Object hasOwnProperty is like hasKey but more complex.
                if(response.data.hasOwnProperty('facet_counts')) {
                //self.facets = response.data.facets;
                    vm.facets = vm.getReadyFacets(response.data.facet_counts.facet_fields);
                }
                //self.stats = self.facets[self.facets.length - 1].statistics;
                //console.log("statistics: " + self.stats);
                vm.resultSummary = "Found " + vm.totalHits + " events in total!"
                if(self.totalHits > 0) {
                    console.log('total hits: ' + vm.totalHits);
                    //console.log(JSON.stringify(self.facets));
                    //console.log(JSON.stringify(response.data.documents[0]));
                    //console.log(response.data.documents[0].fields['title']);
                }
            })
            .catch(function(error) {
              vm.resultSummary = "Query Error!";
              console.log(error);
            });
        },

        /**
         * hook on the click event on queue selection dropdown.
         * we could use the inline JavaScript statement to pass the queue name.
         * here is a example:
         * <b-dropdown-item v-for="(queue, index) in eventQueues"
         *        v-on:click="switchQueue(queue.name, index)">
         */
        switchQueue(queueName, index) {

            //console.log("["+ index + "] " + queueName);

            this.queueLabel = this.eventQueues[index].name;
            this.restBaseUrl = this.eventQueues[index].url;
            this.loadEvents();
        },

        /**
         * The opportunity to customize the caption for each listing.
         */
        customizeListingDetailsCaption(oneDoc) {

            if(this.$localSettings.solr.eventQueue
                   .hasOwnProperty("customizeListingDetailsCaption")) {
                return this.$localSettings.solr.eventQueue
                    .customizeListingDetailsCaption(oneDoc);
            } else {
                return oneDoc['id'];
            }
        },

        /**
         * simple search function to demonstrate Solr search function.
         */
        simpleSearch() {

            var self = this;
            //console.log('I am in...');
            solr.config.baseUrl = self.restBaseUrl;
            solr.ping();

            self.resultSummary = "Searching ...";
            // set the results to null for hiding the whole section.
            self.results = null;
            self.facets = null;
            self.stats = null;

            // check the query, 
            if(!this.query) {
              // reset the query to search everything!
              this.query="*:*";
            }

            // make sure we have at less one statistics.
            //if(self.facetFields.includes('statistics')) {
            //} else {
            //    // add the statistics on listvalue_i
            //    self.facetFields = self.facetFields + 
            //      ",listvalue_i(statistics=true)";
            //}

            // post payload, it will be the query parameters here:
            // This is the JSON request payload.
            var postPayload = {
                //workflow: "customsearch",
                query: this.query,
                limit: 250,
                offset: 0,
                //fields: [".id","title","table","avgScore"],
                //sort: ["title:ASC"],
                // facets: ["table", "city", "agentname"],
                //facets: self.facetFields.split(',')
                facet: "on",
                "facet.field": "project_id",
                "facet.field": "customer_id"
            };

            // the parameters for query.
            // we will use Object assign to merge them all together.
            var params = Object.assign({
              rows: 25,
              start: 0,
              sort: self.sort
            }, self.getFacetFields(), self.getFieldList(), 
            self.getFilterQuery());

            // this will show how to use query parameters in a JSON request.
            var postParams = {
                query: this.query,
                // we could mix parameters and JSON request.
                params: params
            }

            var endPoint = this.restBaseUrl + "select";
            // track the post parameters.
            // the Object assign will merge / copy source object to target
            // object.
            var trackPayload = Object.assign({"end_point" : endPoint},
                                             postParams);
            solr.track(trackPayload);
            // the query url should be some thing like this: 
            // - 'https://one.sites.leocorn.com/rest/searchApi/search',
            // it is seems easier to use query parameters in a JSON request.
            axios.post(endPoint, postParams)
            .then(function(response) {

                console.log(response.data);
                self.totalHits = response.data.response.numFound;

                self.results = response.data.response.docs;
                console.log(self.results);

                // check if we have facets in response.
                // Object hasOwnProperty is like hasKey but more complex.
                if(response.data.hasOwnProperty('facet_counts')) {
                //self.facets = response.data.facets;
                    self.facets = self.getReadyFacets(response.data.facet_counts.facet_fields);
                }
                //self.stats = self.facets[self.facets.length - 1].statistics;
                //console.log("statistics: " + self.stats);
                self.resultSummary = "Found " + self.totalHits + " docs in total!"
                if(self.totalHits > 0) {
                    console.log('total hits: ' + self.totalHits);
                    //console.log(JSON.stringify(self.facets));
                    //console.log(JSON.stringify(response.data.documents[0]));
                    //console.log(response.data.documents[0].fields['title']);
                }
            })
            .catch(function(error) {
              self.resultSummary = "Query Error!";
              console.log(error);
            });
        },

        /**
         * this will return the facet fields query parameters.
         */
        getFacetFields() {

            // check the local settings for customization.
            // {
            //   solr: {
            //     eventQueue: {
            //       customizeGetFacetFields: function() {
            //       }
            //     }
            //   }
            // }
            if(this.$localSettings.solr.eventQueue
                   .hasOwnProperty("customizeGetFacetFields")) {
                return this.$localSettings.solr.eventQueue
                           .customizeGetFacetFields();
            } else {
                return {};
            }
        },

        /**
         * prepare the filter query for search.
         */
        getFilterQuery() {

            // return empty for now.
            // TODO: will have this based on user's actions on front-end.
            return {};
        },

        /**
         * process the facet_fields response to different format.
         *
         *  [
         *    { label:"field name",
         *      buckets: [
         *        {value: "field value one",
         *         count: 120},
         *        {value: "field value two",
         *         count: 20},
         *      ]
         *    }
         *  ]
         */
        getReadyFacets(facetFields) {

            // we will return the facets as array.
            var retFacets = [];
            // key is the field name.
            Object.keys(facetFields).forEach(function(fieldName) {

                var buckets = facetFields[fieldName];
                // get ready the buckets for each field.
                var facetBuckets = [];
                for(var i=0; i < buckets.length; i = i+2) {

                    if (buckets[i + 1] < 1) {

                       continue;
                    }

                    facetBuckets.push(
                      {
                        value: buckets[i],
                        count: buckets[i + 1]
                      }
                    );
                }

                // get ready the facet object.
                var facetItem = {
                  label: fieldName,
                  buckets: facetBuckets
                };

                retFacets.push(facetItem);
            });

            return retFacets;
        }
    },

    /**
     * created will be called after Vue mode is created.
     * Vue mode is avaiable now!
     */
    created() {

      this.eventQueues = this.$localSettings.solr.eventQueues;
      this.restBaseUrl = this.eventQueues[0].url;
      this.queueLabel = this.eventQueues[0].name;
      // set the tracking base url.
      solr.config.trackingBaseUrl = this.$localSettings.solrTrackingUrl;

      this.loadEvents();
    }
}
</script>
