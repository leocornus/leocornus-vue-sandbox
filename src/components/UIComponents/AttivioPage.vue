<template>
<div class="content container">
<b-input-group class="mb-2 d-none">
  <div class="input-group-prepend">
    <span id="restBaseUrl-addon" class="input-group-text">Base URL: </span>
  </div>
  <b-form-select class="form-control"
      aria-describedby="restBaseUrl-addon"
      v-model="restBaseUrl" :options="baseUrlOptions">
  </b-form-select>
</b-input-group>

<b-card no-body>
<b-tabs card>
  <b-tab title="Search" active>
  <div id="search-app">

    <b-input-group class="mb-2">
      <b-form-input type="text" id="inputQuery"
             v-model="query"
             aria-describedby="query-addon"
             v-on:keyup.enter.native="loadItems"
             placeholder="Type your search term here"/>
      <b-input-group-append>
        <b-button variant="outline-primary"
                v-on:click="loadItems">Search!</b-button>
        <b-button variant="success" v-b-modal.query-params>
          Query Params
        </b-button>
        <b-button v-b-modal.search-settings>
          <i class="nc-icon nc-settings-gear-64 text-warning"></i> Settings
        </b-button>
      </b-input-group-append>
    </b-input-group>

    <b-modal id="query-params" title="Query Parameters" ok-only>
      <pre style="height: 220px">{{JSON.stringify(this.buildQuery(),null,2)}}</pre>
    </b-modal>

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
        v-for="(filter, index) in filters" :key="'filter-' + index">
      {{filter.replace(":", ": ")}}
      <a href="#" v-on:click="removeFilter(filter)">
      <span class="badge badge-primary badge-pill">X</span>
      </a>
    </li>
  </ul>
</b-card>
          <stats-card v-for="stat, index) in stats" :stats="stat" 
              :key="'stats-' + index" 
              v-if="stats">
          </stats-card>
          <facet-buckets v-for="(facet, index) in facets" :facet="facet" 
              :key="'facet-' + index"
              v-on:bucket-select="handleBucketSelect">
          </facet-buckets>
        </div>
        <div class="col-9 accordion">
          <h3 class="m-0">{{resultSummary}}</h3>
          <b-pagination :total-rows="totalHits" :per-page="perPage" v-if="results"
                        v-model="currentPage" align="center"></b-pagination>
          <!-- results-list :docs="results" v-if="results">
          </results-list -->
          <listing-details-preview v-for="(doc, index) in results" 
              :doc="doc" :key="doc.id" 
              :index="index" :idFieldName="idField" :thePage="page"
              v-on:show-slides="showSlides">
          </listing-details-preview>
          <b-pagination :total-rows="totalHits" :per-page="perPage" v-if="results"
                        v-model="currentPage" align="center"></b-pagination>
        </div>
      </div>
    </p> <!-- END result list -->

    <!-- search settings modal -->
    <b-modal id="search-settings" title="Search Settings"
             button-size="sm" size="lg"
             @ok="updateSearchSettings">
      <b-row>
        <b-col sm="4">
      <b-input-group class="mb-2" size="sm">
        <b-input-group-append>
          <span id="idField-addon" class="d-none input-group-text">Id Field: </span>
        </b-input-group-append>
        <b-form-input type="text" class="d-none form-control" id="idField"
               aria-describedby="idField-addon"
               v-model="idField"
               placeholder=""/>

        <!-- Items per page -->
        <b-input-group-prepend>
          <span id="perpage-addon" class="input-group-text">Items Per Page: </span>
        </b-input-group-prepend>
        <b-form-input type="text" class="form-control" id="perpage"
               aria-describedby="perpage-addon"
               v-model="perPage"/>
      </b-input-group>
        </b-col>
        <b-col>
      <b-input-group class="mb-2" size="sm">
        <!-- sorting -->
        <b-input-group-prepend>
          <span id="sort-addon" class="input-group-text">Sort: </span>
        </b-input-group-prepend>
        <b-form-input type="text" class="form-control" id="sort"
               aria-describedby="sort-addon"
               v-model="sort"
               placeholder="set sort here: id desc,type asc"/>
      </b-input-group>
        </b-col>
      </b-row>

      <b-input-group class="mb-2" size="sm">
        <b-input-group-prepend>
          <span id="residence-addon"
                class="input-group-text">Residence Type: </span>
        </b-input-group-prepend>
        <b-form-input type="text" class="form-control" id="residencetype"
               aria-describedby="residence-addon"
               v-model="residenceType"
               placeholder="chose residence type"/>
        <b-input-group-prepend>
          <span id="city-addon" class="input-group-text">City: </span>
        </b-input-group-prepend>
        <b-form-input type="text" class="form-control" id="city"
               aria-describedby="city-addon"
               v-model="city"
               placeholder="set city"/>
        <b-input-group-prepend>
          <span id="neighbourhood-addon"
                class="input-group-text">Neighbourhood: </span>
        </b-input-group-prepend>
        <b-form-input type="text" class="form-control" id="neighbourhood"
               aria-describedby="neighbourhood-addon"
               v-model="neighbourhood"
               placeholder="set neighbourhood"/>
      </b-input-group>

      <b-input-group class="mb-2" size="sm">
        <b-input-group-prepend>
          <span id="price-addon" class="input-group-text">Price Range: </span>
        </b-input-group-prepend>
        <b-form-input type="number" class="form-control" id="pricefrom"
               aria-describedby="price-addon"
               v-model="priceFrom"
               placeholder="set price"/>
        <b-input-group-prepend>
          <span id="priceto-addon"
                class="input-group-text">--</span>
        </b-input-group-prepend>
        <b-form-input type="number" class="form-control" id="priceto"
               aria-describedby="priceto-addon"
               v-model="priceTo"
               placeholder="set price"/>
      </b-input-group>

      <b-input-group class="mb-2" size="sm">
        <b-input-group-prepend>
          <span id="facetFields-addon" class="input-group-text">Facets: </span>
        </b-input-group-prepend>
        <b-form-input type="text" class="form-control" id="facetFields"
               aria-describedby="facetFields-addon"
               v-model="facetFields"
               placeholder="for example: .id,table"/>
      </b-input-group>
    </b-modal>
    <!-- END search settings modal -->

    <!-- carousel modal -->
    <b-modal ref="carouselModal" hide-footer hide-header>
<b-carousel
      id="carousel1"
      style="text-shadow: 1px 1px 2px #333;"
      controls
      indicators
      background="#ababab"
      :interval="4000"
      img-width="1024"
      img-height="480"
    >
  <b-carousel-slide v-for="(img, index) in slideImages"
    :img-src="img" :index="index" :key="index"
  >
  </b-carousel-slide>
</b-carousel>
    </b-modal>
    <!-- END carousel modal -->
  </div>
  </b-tab>
  <!-- reports tab -->
  <b-tab title="Reports">
    <b-input-group class="mb-2">
      <div class="input-group-prepend">
        <span id="cities-addon" class="input-group-text">Pick Cities: </span>
      </div>
      <b-form-input type="text" id="cities" v-model="cities"
            placeholder="pick cities..." v-b-tooltip="suggestionTooltip"/>
      <b-button variant="outline-primary"
          v-on:click="neighborhoodAgents">Agents by Neighborhood Report</b-button>
      <div class="input-group-prepend" v-if="dataHref">
        <a :href="dataHref" download="report.json" class="btn">Download Report</a>
      </div>
    </b-input-group>
    <div>
      <h3 class="mt-2">Messages:</h3>
      <ul class="list-group" style="height: 350px; overflow-y: auto;">
        <li class="list-group-item" v-for="(msg, index) in messages" 
                                    :key="index">
          {{messages.length - index}} : {{msg}}
        </li>
      </ul>
    </div>
  </b-tab>
</b-tabs>
</b-card>
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
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select';

import axios from 'axios'
import ListingDetailsPreview from '@/components/UIComponents/ListingDetailsPreview.vue'
import FacetBuckets from '@/components/UIComponents/FacetBuckets.vue'
import StatisticsCard from '@/components/UIComponents/StatisticsCard.vue'

import solr from '@/libs/solr'
import strategy from '@/libs/strategy'

export default {
    components: {
      'listing-details-preview': ListingDetailsPreview,
      'facet-buckets': FacetBuckets,
      'stats-card': StatisticsCard,
      'b-dropdown': bDropdown,
      'b-dropdown-item': bDropdownItem,
      'b-input-group': bInputGroup,
      'b-input-group-append': bInputGroupAppend,
      'b-form-input': bFormInput,
      'b-form-checkbox': bFormCheckbox,
      'b-form-select': bFormSelect,
      'b-card': bCard,
      'b-card-header': bCardHeader,
      'b-button': bButton,
      'b-pagination' : bPagination
    },

    name: "attivio-page",

    props: ["pageName"],

    data() {
      return {
        restBaseUrl: 'http://search.example.com',

        idField: '.id',
        // , separated string for the facet fields.
        // default is table field and listvalue_i field with statistics.
        facetFields: "table,city,agentname,neighbourhoodname,agentphone,listvalue_i(statistics=true)",

        query: '*:*',

        // set the default filter query to empty.
        // filterQuery: "category:\"test one\",keywords:\"key one\"",
        // price:[1000 to 2000]
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

        // the images for slide show
        slideImages: [],

        // result summary
        resultSummary: "Click search to start..",

        // variables for reports.
        cities: "",
        // gessages.
        messages: [],
        // report data to download.
        dataHref: "",

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
              return this.filterQuery.split(",");
          }
      },

      // produce the csv format.
      resultsInCSV: function() {
          return "TODO: result list in CSV format!";
      },

      // the input event keyup.enter is broken in the 
      // b-form-input component.
      // we will using he $listeners property to override
      // check this page for details:
      // https://vuejs.org/v2/guide/components-custom-events.html#Binding-Native-Events-to-Components

      // suggestions.
      suggestionTooltip: function() {

          var titles = ["Cras justo odio", "Cras justo odio"];
          titles = titles.map(title => "<a href='#' class='list-group-item-secondary'>" + title + "</a>");
          var theTitle = "<ul class='list-group'>" + titles.join(' ') + "</ul>";
          return {
            title: theTitle,
            html: true,
            trigger: "click",
            placement: "bottomright"
          };
      }
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
                if(response.data.hasOwnProperty("documents")) {
                    vm.results = vm.formatDocuments(response.data.documents);
                }
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
                vm.facets = response.data.facets;
                // TODO: need smart way to find statistics facet
                //vm.stats = vm.facets[vm.facets.length - 1].statistics;
                vm.stats = vm.getReadyStats();
                //console.log("statistics: " + self.stats);
                //vm.resultSummary = "Found " + vm.totalHits + " events in total!"
                var startRow = postParams.offset;
                vm.resultSummary =
                    "Showing " + (vm.totalHits == 0 ? 0 : (startRow + 1)) + " - " +
                    Math.min(startRow + vm.perPage, vm.totalHits) + " of " +
                    vm.totalHits + " Items";
                if(vm.totalHits > 0) {
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
         * update search settings,
         * handle the ok button on search settings modal.
         */
        updateSearchSettings() {
            // prepare price range.
            this.preparePriceRange();
            this.loadItems();
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
            //console.log(thisVm.getQueryString());
            var postParams = {
                workflow: "search",
                query: thisVm.getQueryString(),
                searchProfile: "checkcity",
                //queryLanguage: "simple",
                queryLanguage: "advanced",
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

                // set a query.
                let queryString = this.query;
                if(queryString === "") {
                    // reset it to select all
                    queryString = "*:*";
                }

                if(this.filterQuery === "") {
                    // by default, search everything
                    return queryString;
                } else {
                    // apply the filer.
                    return 'FILTER(' + queryString +
                           ',AND(' + this.filterQuery + '))';
                }
            }
        },

        /**
         * get price range.
         */
        preparePriceRange() {

            let vm = this;

            // if user set the price range.
            if(vm.priceFrom && vm.priceTo) {
                if(vm.priceTo > vm.priceFrom) {
                    let priceRange = "listvalue_i:[" + vm.priceFrom +
                      " to " + vm.priceTo + "]";
                    vm.filterQuery = vm.filterQuery === "" ?
                        priceRange : vm.filterQuery + "," + priceRange;
                }
            }
            return;
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

            if(this.facetFields === "") {
                return [];
            } else {
                return this.facetFields.trim().split(",");
            }
            //if(this.page.hasOwnProperty("customizeGetFacetFields")) {
            //    return this.page.customizeGetFacetFields();
            //} else {
            //    // by default, this is no facet.
            //    return [];
            //}
        },

        /**
         * prepare the filter query for search.
         */
        getFilterQuery() {

            if(this.filterQuery === "") {
                return "";
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
         * process the response to get the statistics data.
         * which will include statistics field name and data.
         */
        getReadyStats() {

            /**
             * Attivio wraps statistics data inside the facets resposne.
             * for example:
"facets": [
  {
    "name": "value_i",
    "field": "value_i",
    "label": "value_i",
    "statistics": {
      "count": 304482,
      "sum": 170599094355,
      "min": 0,
      "max": 129900300,
      "mean": 560292.872337281,
      "midpoint": 64950150,
      "stdev": 801532.8750940931,
      "var": 642454949856.6031
    },
    "buckets": [
      {}
    ]
  }
]
            *
            * We will use array.filter to return the facets with statistics
            * property
            */ 
            var statsFacets = 
                this.facets.filter(facet => facet.hasOwnProperty("statistics"));

            /**
             * mapping to only pick the field name and the actuall statistics.
             */
            let statss = statsFacets.map(obj => {
                return {
                    "label": obj.field,
                    "statistics": obj.statistics
                };
            });

            return statss;
        },

        /**
         * handle the bucket select event.
         */
        handleBucketSelect(fieldName, bucketValue) {

            // prepare the filter query string based on Attivio query syntax.
            var fq = fieldName.toLowerCase() + ":\"" + bucketValue + "\"";
            // update the filter query with new field.
            this.filterQuery = this.filterQuery === "" ? 
                fq : this.filterQuery + "," + fq;

            // load items to refresh the list.
            this.loadItems();

            // update fields on settings modal.
            switch(fieldName.toLowerCase()) {
                case 'city':
                    this.city = bucketValue;
                    break;
                case 'neighbourhoodname':
                    this.neighbourhood = bucketValue;
                    break;
                case 'residencetype':
                    this.residenceType = bucketValue;
                    break;
                default:
                    // Do nothing here, just skip!
                    break;
            }
        },

        /**
         * set the images and load the carousel modal.
         */
        showSlides(images) {

            //console.log(images);
            this.slideImages = images;

            this.$refs.carouselModal.show();
        },

        /**
         * handle remove filter.
         */
        removeFilter(filter) {

            // remove the filter from the filterQuery.
            var fqs = this.filterQuery.split(",").filter(fq => fq != filter);
            // join will use , as the default separator
            // reset the filterQuery.
            this.filterQuery = fqs.join();
            // load the resule set.
            this.loadItems();

            // remove the fields from settings modal.
            let fieldName = filter.split(":")[0];
            switch(fieldName) {
                case 'city':
                    this.city = "";
                    break;
                case 'neighbourhoodname':
                    this.neighbourhood = "";
                    break;
                case 'residencetype':
                    this.residenceType = "";
                    break;
                case 'listvalue_i':
                    this.priceFrom = 0;
                    this.priceTo = 0;
                    break;
                default:
                    // Do nothing here, just skip!
                    break;
            }
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
        },

        /**
         * generate the neighborhood and agent report.
         */
        neighborhoodAgents() {

            var vm = this;
            if(! vm.page.hasOwnProperty("nrReport")) {
                // report config not exist, do nothing.
                return;
            }

            // get ready the end point. using the simple search api.
            var endPoint = vm.restBaseUrl + "searchApi/search";

            var allNeighborsQuery = vm.page.nrReport.selectQuery(vm.cities);

            axios.post(endPoint, allNeighborsQuery)
            .then(function(response) {
                // get facet bucket.
                var buckets = response.data.facets[0].buckets;
                var agents = {};
                // iterate over buckets.
                strategy.iterateOver(buckets,
                    /**
                     * process each bucket.
                     * the signature is defined in strategy.iterateOver.
                     */
                    function(bucket, report){
                        var allAgentsQuery = vm.page.nrReport.detailQuery(bucket.value);
                        //console.log(allAgentsQuery);
                        axios.post(endPoint, allAgentsQuery)
                        .then(function(response) {
                            //console.log("total hits: " + response.data.totalHits);
                            // set up the neighbourhood.
                            agents[bucket.value] = [];
                            var docs = response.data.documents;
                            docs.forEach(function(doc) {
                                var oneAgent = [];
                                doc.fields.hasOwnProperty('agentid') ?
                                    oneAgent.push(doc.fields['agentid'][0]):
                                    oneAgent.push("");
                                doc.fields.hasOwnProperty('agentname') ?
                                    oneAgent.push(doc.fields['agentname'][0]):
                                    oneAgent.push("");
                                doc.fields.hasOwnProperty('agentphone') ?
                                    oneAgent.push(doc.fields['agentphone'][0]):
                                    oneAgent.push("");
                                // store it.
                                vm.updateMessages(oneAgent);
                                // only keep unique Agent records.
                                if(! agents[bucket.value].includes(oneAgent)) {
                                    agents[bucket.value].push(oneAgent);
                                }
                            });

                            // report done.
                            report();
                        })
                        .catch(function(err) {
                            console.log("Erro for neighbourhood: " + bucket.value);
                            console.log(err);
                            report();
                        });
                    },
                    function() {
                        //console.log(agents);
                        // show up the download button.
                        vm.dataHref="data:'text/json;charset=utf-8," +
                            encodeURIComponent(JSON.stringify(agents, null, 2)) + "'";
                    }
                );
            })
            .catch(function(error) {
                // when error happens:
                console.log(error);
            });
        },

        updateMessages(oneItem) {

            if(this.messages.length > 1000) {
                // we only keep 1000 messages.
                this.messages = [];
            }

            this.messages.unshift(oneItem);
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

        this.baseUrlOptions =
          this.page.collections.map(obj =>{
            var rObj = {};
            rObj['value'] = obj.url;
            rObj['text'] = obj.name;
            return rObj;
        });

        // set the the default collection, the first colleciton in the list.
        this.restBaseUrl = this.baseUrlOptions[0].value;

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
<style>
  .tooltip .tooltip-inner {
    background-color: #d6d8db;
  }

  .bs-tooltip-bottom .arrow::before {
    border-bottom-color: #d6d8db;
  }
</style>
