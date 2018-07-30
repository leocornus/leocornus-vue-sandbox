<template>
<div class="content container">
  <div id="query-app">
    <div class="input-group mb-2">
      <div class="input-group-prepend">
        <span id="action-addon" class="input-group-text">Action: </span>
      </div>
      <input type="text" class="form-control form-control-lg" id="action" 
             v-model="actionName"
             aria-describedby="action-addon"
             placeholder="search all">
      <span class="input-group-btn">
        <button class="btn btn-outline-primary btn-lg" type="submit" 
                v-on:click="executeAction">Execute</button>
      </span>
    </div>
    <div class="input-group mb-2">
      <div class="input-group-prepend">
        <span id="payload-addon" class="input-group-text">Payload: </span>
      </div>
      <div ref="jsoneditor" style="width: 800px; height: 300px;"></div>
      <!-- textarea class="form-control" aria-label="payload" rows="8"
                v-model="payload"
      ></textarea -->
    </div>
    <div class="input-group mb-2">
      <div class="input-group-prepend">
        <span id="restBaseUrl-addon" class="input-group-text">REST API Base URL: </span>
      </div>
      <input type="text" class="form-control" id="restBaseUrl"
             aria-describedby="restBaseUrl-addon"
             v-model="baseUrl"
             placeholder="RESTful API base URL https://www.rest.com">
    </div>
    <p>
      <h3>Status:</h3>
      <ul class="list-group">
        <li class="list-group-item" v-for="(msg, index) in messages" :key="index">
          {{index + 1}} : {{msg}}
        </li>
      </ul>
    </p>
  </div>
</div>
</template>

<script>

// import 3rd libs.
import JSONEditor from 'jsoneditor/dist/jsoneditor.min.js'
import 'jsoneditor/dist/jsoneditor.min.css'

import solr from '@/libs/solr'
import axios from 'axios'

export default {
    // JavaScript goes here.

    data() {
        return {
            baseUrl: 'https://base.restapi.com',
            // empty payload as default.
            payload: '{}',
            actionName: 'Name of Action',
            // the JSONEditor object.
            editor: null,
            /**
             * logging messages.
             */
            messages: null
        }
    },

    // define the methods.
    methods: {

        /**
         * execute ingest
         */
        executeAction: function() {

            var vm = this;

            // get ready the messages area. reset!
            vm.messages=[];

            // TODO: check action and payload.
            //var payload = JSON.parse(vm.payload);
            var payload = vm.editor.get();
            switch(vm.actionName) {
                case "select":
                    // simple search
                    vm.simpleSelect(payload);
                    break;
                default:
                    vm.messages.push("Not supported Action: " + vm.actionName);
                    // do nothing for now.
            }
        },

        /**
         * simple select for quick check.
         */
        simpleSelect: function(payload) {

            var vm = this;

            // make sure we have valid end point.
            var endPoint = vm.baseUrl.endsWith("/") ?
                           vm.baseUrl + "select" : vm.baseUrl + "/select";

            // we will assume the payload are valid JSON.
            var trackPayload = Object.assign({"end_point" : endPoint},
                                             payload);
            solr.track(trackPayload);
            axios.post(endPoint, payload)
            .then(function(response) {
                vm.messages.push("Got Response:");
                vm.messages.push(response);
            })
            .catch(function(error) {
                vm.messages.push("ERROR!");
                vm.messages.push(error);
            });
        }
    },

    /**
     * created will be called after Vue mode is created.
     * Vue mode is avaiable now!
     */
    created() {

        this.baseUrl = this.$localSettings.solrRestBaseUrl;
        // set the tracking base url.
        solr.config.trackingBaseUrl = this.$localSettings.solrTrackingUrl;
    },

    /**
     * mounted
     */
    mounted() {
        const container = this.$refs.jsoneditor
        const options = {}

        this.editor = new JSONEditor(container, options)
        this.editor.set({})
    }
}
</script>
