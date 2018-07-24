<template>
<div class="content">

  <div class="text-center">
    <div class="container">
      <h3 class="mt-1 mb-1">Sharepoint Sandbox Page</h3>
      <p class="lead text-muted">A playground to try Sharepoint APIs.</p>
      <!-- p>
        <a href="#" class="btn btn-primary my-2">Main call to action</a>
        <a href="#" class="btn btn-secondary my-2">Secondary action</a>
      </p -->
    </div>
  </div>

<div class="container">
  <div id="search-app">
    <div class="input-group mb-2">
      <input type="text" class="form-control form-control-lg" id="apiUrl"
             v-model="apiUrl"
             v-on:keyup.enter="inspectCall"
             placeholder="Set the API call...">
      <span class="input-group-btn">
        <button class="btn btn-outline-primary" type="submit"
                v-on:click="inspectCall">Inspect!</button>
      </span>
    </div>
    <div class="input-group mb-2">
      <input type="text" class="form-control form-control-lg" id="startFolders"
             v-model="startFolders"
             v-on:keyup.enter="processFolderBtn"
             placeholder="Set the start fodlers.">
      <span class="input-group-btn">
        <button class="btn btn-outline-primary" type="submit"
                v-on:click="processFolderBtn">Process Folder!</button>
      </span>
    </div>
  </div>

  <div class="card mb-1" v-if="detailsData">
  <div class="card-header">
    <h4 class="mb-0">Data in Details {{dataType}}</h4>
  </div>
  <div class="card-body">
<table class="table table-striped">
  <thead>
    <tr>
      <th scope="col" width="20px">#</th>
      <th scope="col" width="88px">Field</th>
      <th scope="col">Value</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(fieldName, index) in Object.keys(detailsData)"
        :index="index" :fieldName="fieldName">
      <th scope="row">{{index}}</th>
      <td>{{fieldName}}</td>
      <td>{{detailsData[fieldName]}}</td>
    </tr>
  </tbody>
</table>
  </div>
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
        <div>
          <p>Folder Count: {{folderCount}}</p>
        </div>
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

  import solr from '@/libs/solr'

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
        outputText: '',
        // the SPO api call.
        apiUrl: '/_api/',
        // type of the data.
        dataType: '',
        startFolders: 'Customer Group A',
        // folder count.
        folderCount: 0,
        // the detailsData.
        detailsData: null
      }
    },

    methods: {

      /**
       * inspect the api call.
       */
      inspectCall() {

        var self = this;
        var authToken = "Bearer " + self.$localSettings.accessToken;
        var theUrl = self.$localSettings.targetSource + 
                     self.$localSettings.sharepointSite +
                     self.apiUrl;

        // track the API call.
        solr.track({"end_point": theUrl});

        axios.get(theUrl,
            {
              headers: {
                  "Authorization": authToken
              }
            }
        )
        .then(function(response) {
          // log the full data.
          //console.log(response);
          // display on the text area.
          self.inputText = JSON.stringify(response, null, 2);

          var odata = response.data;
          var type = odata["odata.type"];
          console.log("type=" + type);

          self.detailsData = odata;
          self.dataType = type;
        })
        .catch(function(error) {
          // 
          self.inputText = error;
        });
      },

      /**
       * process folder event.
       */
      processFolderBtn() {

          var vm = this;
          vm.processFolder(vm.startFolders);
      },

      /**
       * try to interate into a folder.
       */
      processFolder(folderName) {

        var vm = this;
        // count the folder.
        vm.folderCount ++;

        var theUrl = vm.$localSettings.targetSource + 
                     vm.$localSettings.sharepointSite +
                     "/_api/web/GetFolderByServerRelativeUrl('" +
                     encodeURIComponent(folderName) + "')";
        console.log(theUrl);
        var authHeaders = {
            headers: {
                "Authorization": "Bearer " + vm.$localSettings.accessToken
            }
        };

        // list files.

        // process sub folders.
        axios.get(theUrl + "/Folders", authHeaders).then(function(response) {
            console.log(response);
            response.data.value.forEach(function(folder) {
                console.log(folder);
                var subFolderName = folder.Name;
                vm.processFolder(folderName + "/" + subFolderName);
            });
        }).catch(function(error) {
            console.log(error);
        });
      },

      /**
       * load some sample data.
       */
      loadData() {

        var self = this;
        //console.log(self.$localSettings);
        var authToken = "Bearer " + self.$localSettings.accessToken;
        var baseUrl = self.$localSettings.targetSource + 
                      self.$localSettings.sharepointSite;
        axios.get(baseUrl + '/_api/',
            {
              headers: {
                  "Authorization": authToken
              }
            }
        )
        .then(function(data) {
          //console.log(data);
          self.inputText = data;
        })
        .catch(function(error) {
          // 
          self.inputText = error;
        });
      },

      /**
       *
       */
      changeToPHPArray() {

        var self = this;

        self.inputText.split('\n').forEach(function(row, index) {
          
        });
      },

      simpleCopy() {
        this.outputText = this.inputText.split('\n');
      }
    },

    /**
     * created will be called after Vue mode is created.
     * Vue mode is avaiable now!
     */
    created() {

      // set the tracking base url.
      solr.config.trackingBaseUrl = this.$localSettings.solrTrackingUrl;
    }
  }
</script>
