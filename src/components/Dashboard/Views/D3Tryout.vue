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
                  style="height:auto"
                  rows="15"></textarea>
</div>
        </div>
      </div>
    </div>
    <div class="col-md-2">
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
              <a id="simpleCopy" class="btn btn-primary">Simple Copy Data</a>
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
                  style="height:auto"
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
    }
  }
</script>
