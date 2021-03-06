<template>
<div class="content container">
  <div id="query-app">
    <div class="h3 mt-2">Attivio REST API Inspector</div>
    <div class="input-group mb-2">
      <div class="input-group-prepend">
        <span id="restBaseUrl-addon" class="input-group-text">REST API Base URL: </span>
      </div>
      <b-form-select class="form-control"
          aria-describedby="restBaseUrl-addon"
          v-model="baseUrl" :options="baseUrlOptions">
      </b-form-select>
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
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select';

// import 3rd libs.
import JSONEditor from 'jsoneditor/dist/jsoneditor.min.js'
import 'jsoneditor/dist/jsoneditor.min.css'

import solr from '@/libs/solr'
import axios from 'axios'

export default {
    // JavaScript goes here.
    components: {
      'b-form-select': bFormSelect
    },

    data() {
        return {
            baseUrl: 'https://base.restapi.com',
            actionName: 'search',
            actionOptions: [
                {value:"search", text:"Simple Search"},
                {value:"simplecgi", text:"Simple CGI Search"}
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
                case "search":
                    // simple search
                    vm.simpleSearch(payload);
                    break;
                case "simplecgi":
                    // simple search
                    vm.simpleCgi(payload);
                    break;
                // no update for now.
                //case "update":
                //    // simple update.
                //    vm.simpleUpdate(payload);
                //    break;
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
            solr.track(trackPayload);

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
         * simple searchApi/search for quick check.
         * This endpoint is a simplified JSON query request.
         * it required to use POST.
         */
        simpleSearch: function(payload) {

            var vm = this;

            // make sure we have valid end point.
            var endPoint = vm.baseUrl.endsWith("/") ?
                           vm.baseUrl + "searchApi/search" : 
                           vm.baseUrl + "/searchApi/search";

            // we will assume the payload are valid JSON.
            var trackPayload = Object.assign({"end_point" : endPoint},
                                             payload);
            let trackTags = vm.tags.split(",");
            trackTags.push("search");
            solr.track(trackPayload, vm.comment, trackTags);

            axios.post(endPoint, payload)
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
        },

        /**
         * this is for end point searchApi/simpleCgi.
         * it will tabl Get.
         *
         * The simplest payload will be:
         *  {
         *  "params": {
         *      "q":"*:*"
         *     }
         *  }
         * axios get will wrap up all values in params to build the
         * HTTP query param string.
         */
        simpleCgi: function(payload) {
            var vm = this;

            // make sure we have valid end point.
            var endPoint = vm.baseUrl.endsWith("/") ?
                           vm.baseUrl + "searchApi/simpleCgi" : 
                           vm.baseUrl + "/searchApi/simpleCgi";

            // we will assume the payload are valid JSON.
            var trackPayload = Object.assign({"end_point" : endPoint},
                                             payload);
            let trackTags = vm.tags.split(",");
            trackTags.push("simplecgi");
            solr.track(trackPayload, vm.comment,trackTags);

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

        this.baseUrlOptions =
          this.$localSettings.attivio.inspector.collections.map(obj =>{
            var rObj = {};
            rObj['value'] = obj.url;
            rObj['text'] = obj.name;
            return rObj;
        });
        this.baseUrl = this.baseUrlOptions[0].value;
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
            mode: 'code',
            // allowed modes.
            //modes: ['code', 'form', 'text', 'tree', 'view']
            modes: ['code', 'tree', 'view']
        }

        this.payloadEditor = new JSONEditor(reqEditor, options)
        //this.payloadEditor.setKeyboardHandler("ace/keyboard/vim")
        // set default to query everything.
        this.payloadEditor.set({query:"*:*"})

        this.outputEditor = new JSONEditor(resEditor, options)
        // set default to empty.
        this.outputEditor.set({})
    }
}
</script>
