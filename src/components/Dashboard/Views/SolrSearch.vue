<template>
<div class="container">
  <div id="search-app">
    <div class="input-group mb-2">
      <input type="text" class="form-control form-control-lg" id="inputQuery"
             v-model="query"
             v-on:keyup.enter="simpleSearch"
             placeholder="Search for...">
      <span class="input-group-btn">
        <button class="btn btn-outline-primary btn-lg" type="submit"
                v-on:click="simpleSearch">Search!</button>
      </span>
    </div>
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
          <statistics :stats="stats"></statistics>
          <facet-buckets v-for="(facet, index) in facets" :facet="facet" :key="index">
          </facet-buckets>
        </div>
        <div class="col-9 accordion">
          <results-list :docs="results" v-if="results">
          </results-list>
          <listing-details v-for="(doc, index) in results" :doc="doc" :key="index" :index="index">
          </listing-details>
        </div>
      </div>
    </p>
  </div>
</div>
</template>

<script>
</script>
