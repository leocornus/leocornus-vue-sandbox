<template>
<div class="card mb-1">
<div class="card-header" :id="listingID">
  <h5 class="mb-0">
    <button class="btn btn-link" data-toggle="collapse" :data-target="targetCollapseID" 
            aria-expanded="true" :aria-controls="collapseID">
      {{caption}}
    </button>
  </h5>
</div>
<div :id="collapseID" class="collapse" :aria-labelledby="listingID" 
     data-parent="#accordion">
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
    <tr v-for="(fieldName, index) in Object.keys(doc)" 
        :index="index" :fieldName="fieldName">
      <th scope="row">{{index}}</th>
      <td>{{fieldName}}</td>
      <td>{{doc[fieldName]}}</td>
    </tr>
  </tbody>
</table>
  </div>
</div>
</div>
</template>

<script>

export default {

    name: "listing-details",

    // the doc will have all details and a index field.
    props: ["doc", "index"],

    computed: {

        // for all th IDs, we need replace the following special chars with
        // empty string:
        // @ . /

        listingID() {
            return this.doc['id'].replace(/[@\.\/]/g, '');
        },

        collapseID() {
            return "collapse" + this.doc['id'].replace(/[@\.\/]/g, '');
        },

        targetCollapseID() {
            return "#collapse" + this.doc['id'].replace(/[@\.\/]/g, '');
        },

        /**
         * title for each doc.
         */
        caption() {
            // we will tweak the caption based on table.
            var table = this.doc['name'];
            // by default, we will using id as the caption.
            var caption = this.doc['id'];

            switch(table) {
              case 'xmldata':
                return caption + ' - ' +
                    this.doc.fields.title[0] + ', ' +
                    this.doc.fields.city[0] + ' -- ' +
                    this.doc.fields.avgScore[0];
              case 'offlisting':
                return caption + ' - ' +
                    this.doc.fields.title[0] + ', ' +
                    this.doc.fields.city[0];
              case 'userprefs':
                return caption + ' - ' +
                    this.doc.fields.useremail[0];
              default:
                return caption;
            }
        }
    }
}
</script>
