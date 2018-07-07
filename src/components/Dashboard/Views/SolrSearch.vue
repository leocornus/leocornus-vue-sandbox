<template>
<div class="content container">
  <div id="search-app">
    <b-input-group size="lg" class="mb-2">
      <b-form-input type="text" id="inputQuery"
             v-model="query"
             v-on:keyup.enter="simpleSearch"
             placeholder="Search b-form-group for..."/>
      <b-input-group-append>
        <b-button variant="outline-primary" size="lg"
                v-on:click="simpleSearch">Search!</b-button>
      </b-input-group-append>
    </b-input-group>
    <div class="input-group mb-2">
      <div class="input-group-prepend">
        <span id="restBaseUrl-addon" class="input-group-text">REST API Base URL: </span>
      </div>
      <input type="text" class="form-control" id="restBaseUrl"
             aria-describedby="restBaseUrl-addon"
             v-model="restBaseUrl"
             placeholder="RESTful API base URL https://www.rest.com">
    </div>
    <div class="input-group mb-2">
      <div class="input-group-prepend">
        <span id="facetFields-addon" class="input-group-text">Pick facets, separate by ,: </span>
      </div>
      <input type="text" class="form-control" id="facetFields"
             aria-describedby="facetFields-addon"
             v-model="facetFields"
             placeholder="project_id, customer_name">
    </div>
    <p>
      <h3>{{resultSummary}}</h3>
      <div class="row">
        <div class="col-3">
          <!-- statistics :stats="stats"></statistics -->
          <facet-buckets v-for="(facet, index) in facets" :facet="facet" :key="index">
          </facet-buckets>
        </div>
        <div class="col-9 accordion">
          <!-- results-list :docs="results" v-if="results">
          </results-list -->
          <listing-details v-for="(doc, index) in results" :doc="doc" :key="index" :index="index">
          </listing-details>
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

import axios from 'axios'
import ListingDetails from '@/components/UIComponents/ListingDetails.vue'
import FacetBuckets from '@/components/UIComponents/FacetBuckets.vue'

export default {
    components: {
      'listing-details': ListingDetails,
      'facet-buckets': FacetBuckets,
      'b-input-group': bInputGroup,
      'b-input-group-append': bInputGroupAppend,
      'b-form-input': bFormInput,
      'b-button': bButton
    },

    data() {
      return {
        restBaseUrl: 'http://search.example.com',
        query: '*:*',
        facetFields: "project_id,customer_name",
        totalHits: 0,
        facets: null,
        stats: null,
        results: null,
        resultSummary: "Click search to start.."
      }
    },

    computed: {
      // produce the csv format.
      resultsInCSV: function() {
          return "TODO: result list in CSV format!";
      }
    },

    methods: {
        /**
         * simple search function to demonstrate Solr search function.
         */
        simpleSearch() {

            self = this;
            console.log('I am in...');
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
            // this will show how to use query parameters in a JSON request.
            var postParams = {
                query: this.query,
                // we could mix parameters and JSON request.
                params: {
                  rows: 25,
                  start: 0,
                  facet: "on",
                  // using array for multiple values
                  // in association with multiple values in HTTP parameters.
                  // ?facet_field=project_id&facet_field=customer_id
                  //"facet.field":["project_id", "customer_id"]
                  "facet.field": self.facetFields.split(',')
                  // here is for single value
                  //"facet.field":"customer_id"
                }
            }

            // the query url should be some thing like this: 
            // - 'https://one.sites.leocorn.com/rest/searchApi/search',
            // it is seems easier to use query parameters in a JSON request.
            axios.post(this.restBaseUrl + 'select', postParams)
            .then(function(response) {
                console.log(response.data);
                self.totalHits = response.data.response.numFound;
                self.results = response.data.response.docs;
                console.log(self.results);
                //self.facets = response.data.facets;
                self.facets = self.getReadyFacets(response.data.facet_counts.facet_fields);
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

    created() {
      this.restBaseUrl = this.$localSettings.solrRestBaseUrl;
    }
}
</script>
