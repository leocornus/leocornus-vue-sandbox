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
                v-on:click="executeIngest">Execute</button>
      </span>
    </div>
    <div class="input-group mb-2">
      <div class="input-group-prepend">
        <span id="payload-addon" class="input-group-text">Payload: </span>
      </div>
      <textarea class="form-control" aria-label="payload" rows="8"
                v-model="payload"
      ></textarea>
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
import solr from '@/libs/solr'
import axios from 'axios'

export default {
    // JavaScript goes here.
}
</script>
