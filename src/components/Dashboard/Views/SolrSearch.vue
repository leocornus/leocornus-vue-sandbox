<template>
<div class="content container">
  <div id="search-app">

    <b-input-group class="mb-2">
      <b-dropdown right text="Pick Collection">
        <b-dropdown-item v-for="(collection, index) in collections" :key="index"
                         v-on:click="switchCollection(collection.name, index)"
        >{{collection.name}}</b-dropdown-item>
      </b-dropdown>
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">{{collectionLabel}}: </span>
      </b-input-group-append>
      <b-form-input type="text" class="form-control" id="restBaseUrl"
             aria-describedby="restBaseUrl-addon"
             v-model="restBaseUrl"
             placeholder="RESTful API base URL https://www.rest.com"/>
    </b-input-group>

    <b-input-group class="mb-2">
      <b-form-input type="text" id="inputQuery"
             v-model="query"
             v-on:keyup.enter.native="simpleSearch"
             placeholder="Search b-form-group for..."/>
      <b-input-group-append>
        <b-button variant="outline-primary"
                v-on:click="simpleSearch">Search!</b-button>
        <b-button variant="success" v-b-modal.query-params>
          Query Params
        </b-button>
        <b-button v-b-modal.search-settings>
          <i class="nc-icon nc-settings-gear-64 text-warning"></i> Settings
        </b-button>
      </b-input-group-append>
    </b-input-group>

    <b-modal id="query-params" title="Query Parameters" ok-only>
      TODO: we will show query parameters here!
    </b-modal>

    <b-modal id="search-settings" title="Search Settings"
             @ok="simpleSearch">
      <b-input-group class="mb-2">
        <b-input-group-append>
          <span id="idField-addon" class="input-group-text">Id Field: </span>
        </b-input-group-append>
        <b-form-input type="text" class="form-control" id="idField"
               aria-describedby="idField-addon"
               v-model="idField"
               placeholder=""/>
      </b-input-group>
      <b-input-group class="mb-2">
        <b-input-group-prepend>
          <span id="sort-addon" class="input-group-text">Sort: </span>
        </b-input-group-prepend>
        <b-form-input type="text" class="form-control" id="sort"
               aria-describedby="sort-addon"
               v-model="sort"
               placeholder="set sort here: id desc,type asc"/>
      </b-input-group>
      <div class="input-group mb-2">
        <div class="input-group-prepend">
          <span id="filterQuery-addon" class="input-group-text">Filter Query: </span>
        </div>
        <input type="text" class="form-control" id="filterQuery"
               aria-describedby="filterQuery-addon"
               v-model="filterQuery"
               placeholder="set filter query here: c4c_type:certificate,project_id:2453450">
      </div>

      <div class="input-group mb-2">
        <div class="input-group-prepend">
          <span id="fieldList-addon" class="input-group-text">Field List: </span>
        </div>
        <input type="text" class="form-control" id="fieldList"
               aria-describedby="fieldList-addon"
               v-model="fieldList"
               placeholder="set a list of fields to return: id,project_id,customer_id">
      </div>

      <div class="input-group mb-2">
        <div class="input-group-prepend">
          <span id="facetFields-addon" class="input-group-text">Facets: </span>
        </div>
        <input type="text" class="form-control" id="facetFields"
               aria-describedby="facetFields-addon"
               v-model="facetFields"
               placeholder="for example: project_id,customer_name">
      </div>
    </b-modal>

    <!-- result list -->
    <p>
      <h3>{{resultSummary}}</h3>
      <div class="row">
        <div class="col-3">
<b-card v-if="filters" no-body class="border-info mb-2">
  <b-card-header class="bg-info text-black" id="filters">
    Filters
  </b-card-header>
  <ul class="list-group list-group-flush">
    <li class="list-group-item list-group-item-info d-flex justify-content-between align-items-center"
        v-for="(filter, index) in filters" :key="index">
      {{filter.replace(":", ": ")}}
      <a href="#" v-on:click="removeFilter(filter)">
      <span class="badge badge-primary badge-pill">X</span>
      </a>
    </li>
  </ul>
</b-card>
          <!-- statistics :stats="stats"></statistics -->
          <facet-buckets v-for="(facet, index) in facets" :facet="facet" :key="index"
              v-on:bucket-select="handleBucketSelect">
          </facet-buckets>
        </div>
        <div class="col-9 accordion">
          <!-- results-list :docs="results" v-if="results">
          </results-list -->
          <listing-details v-for="(doc, index) in results" :doc="doc" :idFieldName="idField"
                           :key="index" :index="index" :thePage="page">
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
// TODO: need merge this into SolrPage ocmponent

// components from bootstrap-vue.
import bButton from 'bootstrap-vue/es/components/button/button'
import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group'
import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append'
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input'

import axios from 'axios'
import ListingDetails from '@/components/UIComponents/ListingDetails.vue'
import FacetBuckets from '@/components/UIComponents/FacetBuckets.vue'

import solr from '@/libs/solr'

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
        pageName: 'search',
        idField: 'id',
        restBaseUrl: 'http://search.example.com',
        // available collections, we will load it at the created hook.
        collections: [],
        collectionLabel: "Collection: ",

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
        perPage: 15,

        resultSummary: "Click search to start.."
      }
    },

    computed: {

      /**
       * return the filter querys.
       */
      filters: function() {

          if(this.filterQuery === "") {
              return null;
          } else {
              return this.filterQuery.split(",")
          }
      },

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
          //console.log("Watching currentPage: " + newValue);
          this.simpleSearch();
      }
    },

    methods: {
        /**
         * simple search function to demonstrate Solr search function.
         */
        simpleSearch() {

            var self = this;
            //console.log('I am in...');
            solr.config.baseUrl = self.restBaseUrl;
            //solr.ping();

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

            // this will show how to use query parameters in a JSON request.
            var postParams = self.buildQuery();

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
                //self.resultSummary = "Found " + self.totalHits + " docs in total!"
                var startRow = postParams.params.start;
                self.resultSummary =
                    "Showing " + (startRow + 1) + " - " +
                    Math.min(startRow + self.perPage, self.totalHits) + " of " +
                    self.totalHits + " Items";
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
         * hook on the click event on queue selection dropdown.
         * we could use the inline JavaScript statement to pass the queue name.
         * here is a example:
         * <b-dropdown-item v-for="(collection, index) in collections"
         *        v-on:click="switchCollection(collection.name, index)">
         */
        switchCollection(collectionName, index) {

            //console.log("["+ index + "] " + collectionName);

            this.collectionLabel = this.collections[index].name;
            this.restBaseUrl = this.collections[index].url;
            this.currentPage = 1;
            this.simpleSearch();
        },

        /**
         * create a facility function to get ready post query.
         */
        buildQuery() {

            let thisVm = this;

            // calculate the start row.
            var startRow = (thisVm.currentPage - 1) * thisVm.perPage;

            // the parameters for query.
            // we will use Object assign to merge them all together.
            var params = Object.assign({
              rows: thisVm.perPage,
              start: startRow,
              sort: thisVm.sort
            }, thisVm.getFacetFields(), thisVm.getFieldList(),
               thisVm.getFilterQuery());

            // this will show how to use query parameters in a JSON request.
            var postParams = {
                query: thisVm.query,
                // we could mix parameters and JSON request.
                params: params
            }

            return postParams;
        },

        /**
         * this will return the facet fields query parameters.
         */
        getFacetFields() {

            if(this.facetFields === "") {
                // return an empty object.
                return {};
            } else {
                return {
                  facet: "on",
                  // using array for multiple values
                  // in association with multiple values in HTTP parameters.
                  // ?facet_field=project_id&facet_field=customer_id
                  //"facet.field":["project_id", "customer_id"]
                  // here is for single value
                  //"facet.field":"customer_id"
                  "facet.field": this.facetFields.split(",")
                };
            }
        },

        /**
         * get field list.
         */
        getFieldList() {

            if(this.fieldList === "") {
                // not fieldList specified, return an enpty object.
                return {};
            } else {
                return {
                  // field list, control what fields to return in response.
                  //fl: ["id","project_id"],
                  fl: this.fieldList.split(",")
                };
            }
        },

        /**
         * prepare the filter query for search.
         */
        getFilterQuery() {

            if(this.filterQuery === "") {
                return {};
            } else {
                return {
                  // filter query list.
                  //fq: ["c4c_type:project"],
                  fq: this.filterQuery.split(",")
                }
            }
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
        },

        /**
         * handle the bucket select event.
         */
        handleBucketSelect(fieldName, bucketValue) {

            var fq = fieldName + ":" + bucketValue;
            this.filterQuery = this.filterQuery === "" ?
                fq : this.filterQuery + "," + fq;
            // load items to refresh the list.
            this.simpleSearch();
        },

        /**
         * handle remove filter.
         */
        removeFilter(filter) {

            var fqs = this.filterQuery.split(",").filter(fq => fq != filter);
            this.filterQuery = fqs.join();
            this.simpleSearch();
        }
    },

    /**
     * created will be called after Vue mode is created.
     * Vue mode is avaiable now!
     */
    created() {

      // the page settings.
      //console.log(this.pageName);
      this.page = this.$localSettings.solr[this.pageName];

      // get the collections.
      this.collections = this.page.collections;
      // set the the default collection, the first colleciton in the list.
      this.restBaseUrl = this.collections[0].url;
      this.collectionLabel = this.collections[0].name;

      // set the tracking base url.
      solr.config.trackingBaseUrl = this.$localSettings.solrTrackingUrl;

      // execute search.
      this.simpleSearch();
    }
}
</script>
