<template>
<div class="content">

  <div class="text-center">
    <div class="container">
      <h3 class="heading">D3 (Version {{d3Version}}) Tryout Page</h3>
      <p class="lead text-muted">A playground to try D3 functions.</p>
      <!-- p>
        <a href="#" class="btn btn-primary my-2">Main call to action</a>
        <a href="#" class="btn btn-secondary my-2">Secondary action</a>
      </p -->
    </div>
  </div>

  <div class="row">
    <div class="col-md-5">
      <div class="card mb-4">
        <div class="card-body">
<div class="form-group">
    <label for="exampleFormControlTextarea1">Input textarea</label>
        <textarea class="form-control" id="exampleInput" 
                  style="height:auto" v-model="inputText"
                  rows="15"></textarea>
</div>
        </div>
      </div>
    </div>
    <div class="col-md-2">
      <!-- d-flex will make the btn-group stay in one line -->
      <div class="justify-content-between align-items-center">
        <div class="btn-group">
          <a class="btn btn-primary" 
             v-on:click="loadData">Load Sample Data</a>
        </div>
        <div class="btn-group">
          <a id="simpleCopy" class="btn btn-primary" 
             v-on:click="simpleCopy">Simple Copy Data</a>
        </div>
        <!-- small class="text-muted">9 mins</small -->
      </div>
    </div>
    <div class="col-md-5">
      <div class="card mb-4">
        <div class="card-body">
<div class="form-group">
    <label for="exampleFormControlTextarea1">Output textarea</label>
        <textarea class="form-control" id="exampleOutput" 
                  style="height:auto" v-model="outputText"
                  rows="15"></textarea>
</div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
  import * as d3 from 'd3'

  export default {

    computed: {
      d3Version() {
        return d3.version;
      }
    },

    /**
     * we have to set this as a function
     */
    data() {
      return {
        inputText: '',
        outputText: ''
      }
    },

    methods: {

      /**
       * load some sample data.
       */
      loadData() {

        var self = this;
        d3.text('/static/files/list.txt').then(function(data) {
          self.inputText = data;
        });
      },

      /**
       *
       */

      simpleCopy() {
        this.outputText = this.inputText;
      }
    }
  }
</script>
