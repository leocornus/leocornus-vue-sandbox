<template>
<div class="content container">
<!-- pickup collections -->
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

  <div id="search-app">
    <b-input-group class="mb-2" size="sm">
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
        <b-button variant="info" v-b-modal.boost-settings>
          <font-awesome-icon icon="list"/> Boostings
        </b-button>
      </b-input-group-append>
    </b-input-group>

    <!-- result list -->
    <p>
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

          <!-- Action icons -->
          <b-row class="border border-info border-0">
            <b-col class="text-left text-info">
              <span class="h4">{{resultSummary}}</span>
            </b-col>
            <b-col>
              <b-pagination :total-rows="totalHits" :per-page="perPage"
                            v-if="results" size="sm" class="mb-1"
                            v-model="currentPage" align="right"></b-pagination>
            </b-col>
          </b-row>
          <!-- results-list :docs="results" v-if="results">
          </results-list -->
          <product-preview v-for="(doc, index) in results"
              :doc="doc" :key="doc.id"
              :index="index" :idFieldName="idField" :thePage="page"
              v-on:show-details="showItemDetails">
          </product-preview>
          <!-- listing-details-table :docs="results" v-if="results" :fieldList="fieldList"
                                 :idFieldName="idField" :thePage="page"
                                 v-on:show-details="showItemDetails">
          </listing-details-table -->

          <b-row class="border border-info border-0" v-if="results">
            <b-col class="text-left text-info">
              <span class="h4">{{resultSummary}}</span>
            </b-col>
            <b-col>
              <b-pagination :total-rows="totalHits" :per-page="perPage"
                            size="sm" class="mb-1"
                            v-model="currentPage" align="right"></b-pagination>
            </b-col>
          </b-row>
        </div>
      </div>
    </p>
  </div>

<b-modal id="query-params" title="Query Parameters" ok-only>
  <pre style="height: 220px">{{JSON.stringify(this.buildQuery(),null,2)}}</pre>
</b-modal>

<b-modal id="search-settings" title="Search Settings"
         button-size="sm" size="lg"
         @ok="simpleSearch">

  <span class="d-none">ID, Per Page and Sort</span>
  <b-row>
    <b-col sm="5">
  <b-input-group class="mb-2" size="sm">
    <b-input-group-append>
      <span id="idField-addon" class="input-group-text">Id Field: </span>
    </b-input-group-append>
    <b-form-input type="text" class="form-control" id="idField"
           aria-describedby="idField-addon"
           v-model="idField"
           placeholder=""/>
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

  <span class="d-none">Set the filter query</span>
  <b-input-group class="mb-2" size="sm">
    <div class="input-group-prepend">
      <span id="filterQuery-addon" class="input-group-text">Filter Query: </span>
    </div>
    <input type="text" class="form-control" id="filterQuery"
           aria-describedby="filterQuery-addon"
           v-model="filterQuery"
           placeholder="set filter query here: c4c_type:certificate,project_id:2453450">
  </b-input-group>

  <span class="d-none">Set the field list to return</span>
  <b-input-group class="mb-2" size="sm">
    <div class="input-group-prepend">
      <span id="fieldList-addon" class="input-group-text">Field List: </span>
    </div>
    <input type="text" class="form-control" id="fieldList"
           aria-describedby="fieldList-addon"
           v-model="fieldList"
           placeholder="set a list of fields to return: id,project_id,customer_id">
  </b-input-group>

  <span class="d-none">Set facet fields</span>
  <b-input-group class="mb-2" size="sm">
    <div class="input-group-prepend">
      <span id="facetFields-addon" class="input-group-text">Facets: </span>
    </div>
    <input type="text" class="form-control" id="facetFields"
           aria-describedby="facetFields-addon"
           v-model="facetFields"
           placeholder="for example: id,category">
  </b-input-group>

  <span class="d-none">Set Query Fields</span>
  <b-input-group class="mb-2" size="sm">
    <div class="input-group-prepend">
      <span id="qf-addon" class="input-group-text">QF: </span>
    </div>
    <b-form-input type="text" class="form-control" id="queryFields"
           aria-describedby="qf-addon"
           v-model="queryFields"
           placeholder="for example: category tag">
    </b-form-input>
  </b-input-group>

  <span class="d-none">Set Boost Query</span>
  <b-input-group class="mb-2" size="sm">
    <div class="input-group-prepend">
      <span id="bq-addon" class="input-group-text">BQ: </span>
    </div>
    <b-form-input type="text" class="form-control" id="boostQuery"
           aria-describedby="bq-addon"
           v-model="boostQuery" readonly
           placeholder="for example: category:abc OR tag:cde">
    </b-form-input>
  </b-input-group>
</b-modal>

<b-modal id="boost-settings" title="Boost Settings"
         @ok="simpleSearch"
         size="lg" button-size="sm">
  <b-row>
    <b-col cols="7" style="max-height: 220px; overflow-y: auto">
      <b-table small striped :items="boostParams" :fields="boostParamFields">
        <template slot="actions" scope="row">
          <b-button size="sm" variant="danger" @click="deleteBoost(row.item)" class="mr-1">
            Delete
          </b-button>
        </template>
      </b-table>
    </b-col>
    <b-col>
      <span class="font-weight-bold text-info">Add new boost parameter:</span>

      <b-input-group class="mb-2" size="sm">
        <div class="input-group-prepend">
          <span id="boostField-addon" class="input-group-text">Field: </span>
        </div>
        <input type="text" class="form-control" id="boostField"
               aria-describedby="boostField-addon"
               v-model="boostField"
               placeholder="for example: category">
      </b-input-group>

      <b-input-group class="mb-2" size="sm">
        <div class="input-group-prepend">
          <span id="boostValue-addon" class="input-group-text">Value: </span>
        </div>
        <input type="text" class="form-control" id="boostValue"
               aria-describedby="boostValue-addon"
               v-model="boostValue"
               placeholder="for example: news">
      </b-input-group>

      <b-input-group class="mb-2" size="sm">
        <div class="input-group-prepend">
          <span id="boostWeight-addon" class="input-group-text">Weight: </span>
        </div>
        <input type="number" class="form-control" id="boostWeight"
               aria-describedby="boostWeight-addon"
               v-model="boostWeight">
      </b-input-group>

      <b-button variant="success" block size="sm"
                v-on:click="addBoost">Add Boost Parameter</b-button>
    </b-col>
  </b-row>
</b-modal>

<b-modal id="item-details" title="Item Details" ok-only
         ref="itemDetailsModal" button-size="sm" size="lg">
  <pre style="height: 220px">{{JSON.stringify(this.selectedItem, null,2)}}</pre>
</b-modal>

</div>
</template>

<style>
.table-sm td,.table-sm th {
  padding: .1rem !important;
}
</style>

<!-- JavaScript -->
<script>
// TODO: need merge this into SolrPage ocmponent

// components from bootstrap-vue.
import bButton from 'bootstrap-vue/es/components/button/button'
import bInputGroup from 'bootstrap-vue/es/components/input-group/input-group'
import bInputGroupAppend from 'bootstrap-vue/es/components/input-group/input-group-append'
import bFormInput from 'bootstrap-vue/es/components/form-input/form-input'

import axios from 'axios'
//import ListingDetailsTable from '@/components/UIComponents/ListingDetailsTable.vue'
import ProductPreview from '@/components/UIComponents/ProductPreview.vue'
import FacetBuckets from '@/components/UIComponents/FacetBuckets.vue'

import solr from '@/libs/solr'

export default {
    components: {
      //'listing-details-table': ListingDetailsTable,
      'product-preview': ProductPreview,
      'facet-buckets': FacetBuckets,
      'b-input-group': bInputGroup,
      'b-input-group-append': bInputGroupAppend,
      'b-form-input': bFormInput,
      'b-button': bButton
    },

    data() {
      return {
        pageName: 'productSearch',
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
        // the boostQuery field.
        boostQuery: "",
        // the query fields.
        queryFields: "",

        totalHits: 0,
        facets: null,
        stats: null,
        results: null,

        // pagination properties.
        currentPage: 1,
        perPage: 15,

        resultSummary: "Click search to start..",

        // selectedItem will show in the details modal.
        selectedItem: {},

        // boosting parameters.
        boostParams: [
          {field:"category", value:"abc", weight:2},
          {field:"keywords", value:"def", weight:3}
        ],

        // define the fields for the boost parameters.
        boostParamFields: [
          'field',
          'value',
          {key: 'weight', label: 'Weight', sortable: true},
          'actions'
        ],
        boostField: "",
        boostValue: "",
        boostWeight: 0.1,

        // luke in the structure of b-table.
        luke: {"items":[], "fields":[]},

        // solr schema.
        schema: {"items":[], "fields":[]}
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
            this.loadCollection(this.collections[index]);

            this.currentPage = 1;
            this.simpleSearch();
            this.adminLuke();
            this.adminSchema();
        },

        /**
         * utility method to load collections.
         * mostly some the default values for some fields.
         * @param newColl the collection object set on local-settings.js
         */
        loadCollection(newColl) {

            this.collectionLabel = newColl.name;
            this.restBaseUrl = newColl.url;

            // get the default field list.
            this.fieldList = newColl.hasOwnProperty('fieldList') ? 
                             newColl.fieldList : "";
            this.boostParams = newColl.hasOwnProperty('boostQuery') ? 
                              newColl.boostParams : [];
            this.queryFields = newColl.hasOwnProperty('queryFields') ? 
                              newColl.queryFields : [];
            this.facetFields = newColl.hasOwnProperty('facetFields') ? 
                             newColl.facetFields : "";
            this.sort = newColl.hasOwnProperty('sort') ? 
                             newColl.sort : "";
            // TODO: get default values for other fields
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
              defType: "edismax",
              start: startRow,
              sort: thisVm.sort
            }, thisVm.getFacetFields(), thisVm.getFieldList(),
               thisVm.getFilterQuery(), thisVm.getBoostQuery(),
               thisVm.getQueryFields());

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
         * the return value will be the object like this:
         * - fl: ["id","project_id"],
         */
        getFieldList() {

            if(this.fieldList === "") {
                // not fieldList specified, return an enpty object.
                return {};
            } else {
                // always add the id field to the field list..
                let fields = this.fieldList.split(",");
                if(!fields.includes(this.idField)) {
                    fields.push(this.idField);
                }
                return {
                  // field list, control what fields to return in response.
                  fl: fields
                };
            }
        },

        /**
         * return the boost query field.
         */
        getBoostQuery() {

            // check the settings.
            if(this.page.hasOwnProperty('buildBoostQuery')) {
                this.boostQuery = this.page.buildBoostQuery(this.query,
                                                            this.boostParams);
            } else {
                this.boostQuery = "";
            }

            if (this.boostQuery === "") {
                return {};
            } else {
                return {
                    "bq": this.boostQuery
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
         * prepare the query fields for search.
         */
        getQueryFields() {

            if(this.queryFields === "") {
                return {};
            } else {
                return {
                  qf: this.queryFields
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
                  name: fieldName,
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

            var fq = fieldName + ":\"" + bucketValue + "\"";
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
        },

        /**
         * show details for the selected item.
         * @param: itemId the unique id for the item.
         */
        showItemDetails(itemId) {

            var vm = this;

            var endPoint = vm.restBaseUrl + "select";
            // query to load the full item, set to selectedItem
            axios.get(endPoint, {
              "params": {
                "q": vm.idField + ":" + itemId
              }
            })
            .then(function(response) {

                vm.selectedItem = response.data.response.docs[0];
                vm.$refs.itemDetailsModal.show();
            });
        },

        //=====================================================================
        // functions related to boost settings.
        //
        /**
         * add the boost parameters.
         */
        addBoost() {

            let vm = this;

            // TODO: data verification

            // push to the boostParams
            vm.boostParams.push(
                {field: vm.boostField, value: vm.boostValue, weight: vm.boostWeight}
            );
            
            // reset the new boost parameter area.
            vm.boostField = "";
            vm.boostValue = "";
            vm.boostWeight = 0.1;
        },

        /**
         * delete a boost parameter
         */
        deleteBoost(item) {

            // here are how we delete a element in an array by value

            console.log(item);
            let i = this.boostParams.indexOf(item);
            if (i > -1) {
                this.boostParams.splice(i, 1);
            }
        },
        //=====================================================================

        /**
         * generate a list of fields.
         */
        adminLuke() {

            var vm = this;
            // reset the fields list object.
            vm.luke = {"items": [], "fields": []};

            var endPoint = vm.restBaseUrl + "admin/luke";
            axios.get(endPoint, null)
            .then(function(response) {
                var fields = response.data.fields;
                var rows = [];
                Object.keys(fields).forEach(function(fieldName) {
                    var aRow = fields[fieldName];
                    // add the name property.
                    aRow.name = fieldName;
                    //// add the index property if it is missing.
                    //if(!aRow.hasOwnProperty('index')) {
                    //    aRow.index = '';
                    //}
                    //// add the docs propery if it is missing.
                    //if(!aRow.hasOwnProperty('docs')) {
                    //    aRow.docs = 0;
                    //}

                    // add to result.
                    rows.push(aRow);
                });
                vm.luke = {"items": rows,
                           "fields": [
                             {key:"name", sortable:true},
                             {key:"type", sortable:true},
                             {key:"docs", sortable:true},
                             "schema", "index"]};
            })
            .catch(function(error) {
                vm.luke = error;
            });
        },

        /**
         * generate a list of fields.
         */
        adminSchema() {

            var vm = this;
            // reset the fields list object.
            vm.schema = {"items": [], "fields": []};

            var endPoint = vm.restBaseUrl + "schema";
            axios.get(endPoint, null)
            .then(function(response) {
                var rows = response.data.schema.fields;
                vm.schema= {"items": rows,
                           "fields": [
                             {key:"name", sortable:true},"type","indexed","stored",
                             "required", "multiValued","docValues"]};
            })
            .catch(function(error) {
                vm.schema= error;
            });
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
      this.loadCollection(this.collections[0]);

      // set the tracking base url.
      solr.config.trackingBaseUrl = this.$localSettings.solrTrackingUrl;

      // execute search.
      this.simpleSearch();
      this.adminLuke();
      this.adminSchema();
    }
}
</script>
