<template>
<div class="content container">
  <div id="search-app">

    <b-input-group class="mb-2" size="sm">
      <b-dropdown right v-bind:text="pageSource">
        <b-dropdown-item v-for="(collection, index) in collections" :key="index"
                         v-on:click="switchCollection(collection.name, index)"
        >{{collection.name}}</b-dropdown-item>
      </b-dropdown>
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">{{collectionLabel}}</span>
      </b-input-group-append>
      <b-form-input type="text" class="form-control" id="restBaseUrl"
             aria-describedby="restBaseUrl-addon"
             v-model="restBaseUrl"
             placeholder="RESTful API base URL https://www.rest.com"/>
      <b-input-group-append>
        <b-button variant="outline-primary" v-if="!autoRefresh"
            v-on:click="loadItems">Refresh</b-button>
        <div class="input-group-text text-primary">
          <b-form-checkbox v-model="autoRefresh" @change="toggleAutoRefresh">
            Auto Refresh
          </b-form-checkbox>
        </div>
        <b-form-select v-if="autoRefresh" class="form-control" 
            @change="resetRefreshInterval"
            v-model="refreshInterval" :options="refreshIntervalOptions">
        </b-form-select>
      </b-input-group-append>
    </b-input-group>

    <!-- result list -->
    <p>
      <div class="row">
        <div class="col-3">
          <h3 class="m-0">Facets</h3>
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
          <h3 class="m-0">{{resultSummary}}</h3>
          <!-- results-list :docs="results" v-if="results">
          </results-list -->
          <listing-details v-for="(doc, index) in results" :doc="doc" :key="index" 
                           :index="index" idFieldName=".id">
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
import bCard from 'bootstrap-vue/es/components/card/card'
import bCardHeader from 'bootstrap-vue/es/components/card/card-header'
import bFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox';

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
      'b-card': bCard,
      'b-card-header': bCardHeader,
      'b-button': bButton,
      'b-form-checkbox': bFormCheckbox,
      'b-pagination' : bPagination
    },

    name: "solr-page",

    props: ["pageName"],

    data() {
      return {
        restBaseUrl: 'http://search.example.com',
        // available collections.
        collections: [],
        // label for the current event queue
        eventLabel: "",

        query: '*:*',
        // default facet field is empty.
        facetFields: "",

        // set the default filter query to empty.
        //filterQuery: "c4c_type:project,log_level:INFO",
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

        // 
        resultSummary: "Click search to start..",

        // auto refresh button.
        autoRefresh: false,
        // this will store the interval id for auto refresh
        refreshId: 0,
        // default interval is 5s
        refreshInterval: 5000,
        // the interval options for refresh.
        // TODO: make it customizable
        refreshIntervalOptions: [
          { value: 1000, text: '1s' },
          { value: 5000, text: '5s' },
          { value: 10000, text: '10s' },
          { value: 20000, text: '20s' },
          { value: 30000, text: '30s' },
          { value: 60000, text: '1m' }
        ]
      }
    },

    computed: {

      /**
       * the text attribute for dropdown
       */
      pageSource: function() {

          return "Choose " + this.pageName;
      },

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
          console.log("Watching currentPage: " + newValue);
          this.loadItems();
      }
    },

    methods: {

        /**
         * load items for this colleciton.
         */
        loadItems() {

            var vm = this;

            // reset results
            vm.resultSummary = "Searching Items ...";
            vm.results = null;

            // get ready the query:
            var postParams = vm.buildQuery();

            // get ready the end point.
            var endPoint = this.restBaseUrl + "searchApi/search";

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
                vm.totalHits = response.data.totalHits;

                // tweak the structure.
                vm.results = vm.formatDocuments(response.data.documents);
                //console.log(vm.results);

                // check if we have facets in response.
                // Attivio has the following format for facets buckets.
                //  [
                //    { label:"field name",
                //      buckets: [
                //        {value: "field value one",
                //         count: 120},
                //        {value: "field value two",
                //         count: 20},
                //      ]
                //    }
                //  ]
                // Object hasOwnProperty is like hasKey but more complex.
                self.facets = response.data.facets;
                //self.stats = self.facets[self.facets.length - 1].statistics;
                //console.log("statistics: " + self.stats);
                //vm.resultSummary = "Found " + vm.totalHits + " events in total!"
                var startRow = postParams.offset;
                vm.resultSummary =
                    "Showing " + (startRow + 1) + " - " +
                    Math.min(startRow + vm.perPage, vm.totalHits) + " of " +
                    vm.totalHits + " Items";
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
         * create a facility function to get ready post query.
         * for Attivio search.
         */
        buildQuery() {

            let thisVm = this;

            // calculate the start row.
            var startRow = (thisVm.currentPage - 1) * thisVm.perPage;

            // the parameters for query.
            // this will show how to use query parameters in a JSON request.
            var postParams = {
                workflow: "search",
                query: thisVm.getQueryString(),
                searchProfile: "checkcity",
                queryLanguage: "simple",
                rows: thisVm.perPage,
                offset: startRow,
                facets: thisVm.getFacetFields()
            }

            return postParams;
        },

        /**
         * get query string
         */
        getQueryString() {

            // check the local settings for customization.
            // {
            //   solr: {
            //     tracking: {
            //       customizeGetQueryString: function() {
            //       }
            //     }
            //   }
            // }
            if(this.page.hasOwnProperty("customizeGetQueryString")) {
                return this.page.customizeGetQueryString();
            } else {
                // by default, search everything
                return "*:*";
            }
        },

        /**
         * get sort for query.
         */
        getQuerySort() {

            if(this.page.hasOwnProperty("customizeGetQuerySort")) {
                return this.page.customizeGetQuerySort();
            } else {
                // by default, search everything
                return "id desc";
            }
        },

        /**
         * tweak the data structure for the returning documents.
         * convert the attivio return documents to propery format to
         * fit into the ListingDetails component.
         */
        formatDocuments(docs) {

            var newDocs = [];
            docs.forEach(function(doc) {
                // need add the id field. using Objec.assign
                newDocs.push(doc.fields);
            });

            return newDocs;
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
            this.loadItems();
        },

        /**
         * The opportunity to customize the caption for each listing.
         */
        customizeListingDetailsCaption(oneDoc) {

            if(this.page.hasOwnProperty("customizeListingDetailsCaption")) {
                return this.page.customizeListingDetailsCaption(oneDoc);
            } else {
                // by default, using the doc id as the caption.
                return oneDoc['.id'][0];
            }
        },

        /**
         * this will return the facet fields query parameters.
         * Attivio's faceting is different from Solr.
         */
        getFacetFields() {

            // check the local settings for customization.
            // {
            //   attivio: {
            //     reva: {
            //       customizeGetFacetFields: function() {
            //       }
            //     }
            //   }
            // }
            if(this.page.hasOwnProperty("customizeGetFacetFields")) {
                return this.page.customizeGetFacetFields();
            } else {
                // by default, this is no facet.
                return [];
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
            this.loadItems();
        },

        /**
         * handle remove filter.
         */
        removeFilter(filter) {

            var fqs = this.filterQuery.split(",").filter(fq => fq != filter);
            this.filterQuery = fqs.join();
            this.loadItems();
        },

        /**
         * toggle auto refresh.
         * This is binded to change event.
         * The checked will tell the new state
         */
        toggleAutoRefresh(checked) {

            var thisVm = this;

            //console.log("checked = " + checked);
            if(checked) {
                // set the refresh inverval and keep the interval ID as
                // refreshId.
                // we will remove it by call the window.clearInterval.
                thisVm.refreshId = setInterval(function () {
                    thisVm.loadItems();
                }.bind(thisVm), thisVm.refreshInterval);
            } else {
                clearInterval(thisVm.refreshId);
            }
        },

        /**
         * reset the refresh interval when the refresh interval changed.
         * there are multiple steps needed to do this:
         * - clear the current interval id if it is exist.
         * - set interval using the new value.
         * - store the new interval ID.
         */
        resetRefreshInterval(newInterval) {

            var thisVm = this;

            //console.log("new Interval:" + newInterval);
            clearInterval(thisVm.refreshId);

            thisVm.refreshId = setInterval(function () {
                thisVm.loadItems();
            }.bind(thisVm), newInterval);
        }
    },

    /**
     * created will be called after Vue mode is created.
     * Vue mode is avaiable now!
     */
    created() {

        // the page settings.
        //console.log(this.pageName);
        this.page = this.$localSettings.attivio[this.pageName];

        // get the collections.
        this.collections = this.page.collections;
        // set the the default collection, the first colleciton in the list.
        this.restBaseUrl = this.collections[0].url;
        this.collectionLabel = this.collections[0].name;

        // set the tracking base url.
        solr.config.trackingBaseUrl = this.$localSettings.solrTrackingUrl;

        this.loadItems();
    },

    /**
     * we will clear something when we leave this page.
     * Here are list of things we will clean up:
     * - refresh interval ID.
     */
    destroyed() {

        clearInterval(this.refreshId);
    }
}
</script>
