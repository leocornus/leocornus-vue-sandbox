<template>
<div class="content">

  <div class="text-center">
    <div class="container">
      <h3 class="mt-1 mb-1">D3 (Version {{d3Version}}) Tryout Page</h3>
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
             v-on:click="csvLoadMergeAdd">Load and Merge</a>
        </div>
        <div class="btn-group">
          <a class="btn btn-primary" 
             v-on:click="loadData">Load Sample Data</a>
        </div>
        <div class="btn-group">
          <a id="changeToPHPArray" class="btn btn-primary" 
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
  import axios from 'axios'

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
       * load csv data 
       */
      csvLoadMergeAdd() {

        var self = this;

        //d3.csv('/static/files/pd-20180716.csv',
        //d3.csv('/static/files/sfq-20180719.csv',
        d3.csv('/static/files/sfp-20180727.csv',
               // the first parameter is a row,
               // the second parameter is the index, starts from 0
               function(d, index) {
          // Here, we could tweak the data columns and values.
          //console.log(d["Account Name"]);
          // we will process row by row.
          //console.log("index = " + index);
          //return d;
          var newRow =  
          {
            id: "p|" + d["Service Tracking Number"],
            customer_id: +d["Customer: SAP ID"],
            project_id: +d["Service Tracking Number"],
            certificate_id: +d["Certificate Number"],
            master_contract_number: +d["Certificate Master Contract ID"],

            customer_name: d["Customer: Account Name"],
            customer_detail_id: d["Customer: Account ID"],
            project_detail_name: d["Project Detail: Project Detail Name"],
            project_detail_id: d["Project Detail: ID"],
            project_status: d["Project Status"],
            certificate_detail_id: d["Certificate Id"],
            primary_contact_name: d["Primary Contact"],
            primary_contact_email: d["Primary Contact Email"],
            po_number: d["PO Number"],
            planned_start_date: d["Planned Start Date"],
            planned_delivery_date: d["Planned Delivery Date"],
            service_delivery_person: d["Service Delivery Person"],
            service_delivery_person_email: d["Service Deliver Person Email"],
            service_delivery_person_phone: d["Service Deliver Person Phone"],
            customer_project_name: d["Customer Project Name"],
            customer_project_status: d["Customer Project Status"],
            customer_product_description: d["Customer Product Description"],
            standards: d["Standards"],
            project_scope: d["Scope"],
            c4c_type: "project"
          };

          // send payload to Solr for every row is very costy!
          // the better way is group a set of rows (for example 1000) to 
          // send at one time.
          //self.postPayload(newRow);
          return newRow;
        }).then(function(data) {
          console.log(data);
          //self.inputText = JSON.stringify(data[100],null, 2);
          //self.postPayload(data[100]);
          while(data.length > 0) {
            var rows = [];
            // the method splice will remove records and return them as 
            // a new array
            rows = data.splice(0, 500);
            //console.log(rows);
            self.postPayload(rows);
          }
        });
      },

      /**
       * quick try for the post payload.
       * 
       * single doc payload example:
       *  {
       *    id: "abcd",
       *    keyone: "value one",
       *    keytwo: "value two"
       *  }
       *
       * multiple docs payload exmaple:
       *  [
       *    {
       *      id: "abcd",
       *      keyone: "value one",
       *      keytwo: "value two"
       *    },
       *    {
       *      id: "abcd-1",
       *      keyone: "value one one",
       *      keytwo: "value two two"
       *    }
       *  ]
       * 
       */
      postPayload(payload) {

        var endPoint = 
            this.$localSettings.solrRestBaseUrl + "update/json/docs?commit=true";
        console.log(payload);
        axios.post(endPoint, payload
        ).then(function(response) {
          console.log(response);
        }).catch(function(error) {
          console.log(error);
        });
      },


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
      changeToPHPArray() {

        var self = this;

        self.outputText = '';

        self.inputText.split('\n').forEach(function(row, index) {
          self.outputText = self.outputText + index + '. ' + row + '\n';  
        });
      },

      simpleCopy() {

        var self = this;

        // d3.csvParseRows to load the data as an array of arraies.
        var neighbourhoods = d3.csvParseRows(this.inputText, function(d, i){
          // d will be current row,
          // i will be the index.
          // the first column is the region name.
          var region = d[0];
          // new row will be an object with
          var newRow = {};
          d.forEach(function(e, index) {
            // e as element.
            if(index == 0) {
              // this is the region name,
              // do nothing here.
            } else {
              newRow[e] = region;
              //console.log(e);
              self.outputText = self.outputText + e + ':' + region + '\n';
            }
          });

          return newRow;
        });
        //this.outputText = this.inputText.split('\n');
        //this.outputText = neighbourhoods;
      }
    }
  }
</script>
