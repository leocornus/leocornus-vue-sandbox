<template>
<div class="content container">
  <div id="query-app">
    <div class="h3 mt-2">Solr REST API Inspector</div>
    <div class="input-group mb-2">
      <div class="input-group-prepend">
        <span id="restBaseUrl-addon" class="input-group-text">REST API Base URL: </span>
      </div>
      <input type="text" class="form-control" id="restBaseUrl"
             aria-describedby="restBaseUrl-addon"
             v-model="baseUrl"
             placeholder="RESTful API base URL https://www.rest.com">
      <div class="input-group-prepend">
        <span id="action-addon" class="input-group-text">Action: </span>
      </div>
      <b-form-select class="form-control"
          v-model="actionName" :options="actionOptions">
      </b-form-select>
      <span class="input-group-btn">
        <button class="btn btn-outline-primary" type="submit"
                v-on:click="executeAction">Execute</button>
      </span>
    </div>
    <b-input-group class="mb-2" size="sm">
      <b-input-group-append>
        <span id="comment-addon" class="input-group-text">Comment</span>
      </b-input-group-append>
      <b-form-input type="text" class="form-control" id="comment"
             aria-describedby="comment-addon"
             v-model="comment"
             placeholder="comment for this query"/>
      <b-input-group-append>
        <span id="tags-addon" class="input-group-text">Tags</span>
      </b-input-group-append>
      <b-form-input type="text" class="form-control" id="tags"
             aria-describedby="tags-addon"
             v-model="tags"
             placeholder="Tags, separate with ,"/>
    </b-input-group>
    <div class="row mb-2">
<div class="col">
  <div class="card">
    <div class="card-header">
      Payload
    </div>
    <div class="card-body">
      <div ref="payloadEditor" style="height: 400px;"></div>
    </div>
  </div>
</div>
<div class="col">
  <div class="card">
    <div class="card-header">
      Response
    </div>
    <div class="card-body">
      <div ref="outputEditor" style="height: 400px;"></div>
    </div>
  </div>
</div>
    </div>
    <div>
      <h3 class="mt-2">Status:</h3>
      <ul class="list-group">
        <li class="list-group-item" v-for="(msg, index) in messages" :key="index">
          {{index + 1}} : {{msg}}
        </li>
      </ul>
    </div>
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
            actionName: 'select',
            actionOptions: [
                {value:"select", text:"Select API"},
                {value:"update", text:"Update API"}
            ],
            comment: "",
            tags: "",
            // the JSONEditors object.
            payloadEditor: null,
            outputEditor: null,
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
            var payload = vm.payloadEditor.get();
            switch(vm.actionName) {
                case "select":
                    // simple search
                    vm.simpleSelect(payload);
                    break;
                case "update":
                    // simple update.
                    vm.simpleUpdate(payload);
                    break;
                default:
                    vm.messages.push("Not supported Action: " + vm.actionName);
                    // do nothing for now.
            }
        },

        /**
         * simple update action.
         */
        simpleUpdate: function(payload) {

            var vm = this;
            const endPoint = vm.baseUrl.endsWith("/") ?
                             vm.baseUrl + "update/json/docs?commit=true" :
                             vm.baseUrl + "/update/json/docs?commit=true";
            var trackPayload = Object.assign({"end_point" : endPoint},
                                             payload);
            let trackTags = vm.tags.split(",");
            solr.track(trackPayload, vm.comment, trackTags);

            axios.post(endPoint, payload)
            .then(function(response) {
                vm.messages.push("Update Success!");
                vm.outputEditor.set(response);
            })
            .catch(function(error) {
                vm.messages.push("Update Failed!");
                vm.outputEditor.set(error);
            });
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
            let trackTags = vm.tags.split(",");
            solr.track(trackPayload, vm.comment, trackTags);

            // using get, so all parameters will show up on the solr
            // log file.
            axios.get(endPoint, payload)
            .then(function(response) {
                vm.messages.push("Got Response:");
                vm.outputEditor.set(response);
                //vm.messages.push(JSON.stringify(response, null, 2));
                //vm.payload = JSON.stringify(response, null, 2);
            })
            .catch(function(error) {
                vm.messages.push("ERROR!");
                vm.outputEditor.set(error);
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
        const reqEditor = this.$refs.payloadEditor
        const resEditor = this.$refs.outputEditor
        const options = {
            // default mode.
            mode: 'view',
            // allowed modes.
            //modes: ['code', 'form', 'text', 'tree', 'view']
            modes: ['code', 'tree', 'view']
        }

        this.payloadEditor = new JSONEditor(reqEditor, options)
        // set default to query everything.
        this.payloadEditor.set({query:"*:*"})

        this.outputEditor = new JSONEditor(resEditor, options)
        this.outputEditor.set({})
    }
}
</script>
