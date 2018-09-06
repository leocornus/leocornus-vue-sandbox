<template>

<b-card class="mb-1">
<b-card-header :id="listingID">
  <h5 class="mb-0">
    <b-button class="btn-link" v-b-toggle="collapseID">
      {{caption}}
    </b-button>
  </h5>
</b-card-header>
<b-collapse :id="collapseID"> 
  <b-card-body>
<table class="table table-striped">
  <thead>
    <tr>
      <th scope="col" width="20px">#</th>
      <th scope="col" width="88px">Field</th>
      <th scope="col">Value</th>
    </tr>
  </thead>
  <tbody>
    <!-- tr v-for="(fieldName, index) in Object.keys(doc)"
        :index="index" :fieldName="fieldName" -->
    <tr v-for="(field, index) in fields"
        :index="index" :field="field">
      <!-- th scope="row">{{formatIndex(index)}}</th -->
      <th scope="row">{{index}}</th>
      <td><span v-html='field["fieldName"]'></span></td>
      <td>{{field["fieldValue"]}}</td>
    </tr>
  </tbody>
</table>
  </b-card-body>
</b-collapse>
</b-card>
</template>

<script>

// bootstrap-vue components.
import bCard from 'bootstrap-vue/es/components/card/card'
import bCardHeader from 'bootstrap-vue/es/components/card/card-header'
import bCardBody from 'bootstrap-vue/es/components/card/card-body'
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse'
import bButton from 'bootstrap-vue/es/components/button/button'
// bootstrap-vue directives
import vBToggle from 'bootstrap-vue/es/directives/toggle/toggle'

export default {

    components: {
      'b-button': bButton,
      'b-card': bCard,
      'b-card-header': bCardHeader,
      'b-card-body': bCardBody,
      'b-collapse': bCollapse
    },

    directives: {
      // Vue will automatically prefix the directive name with 'v-'
      // so we will use it like this: v-b-toggle.
      'b-toggle': vBToggle
    },

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
            return "'collapse" + this.doc['id'].replace(/[@\.\/]/g, '') + "'";
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
        },

        /**
         * preparing the fields and values for each doc.
         */
        fields() {

            var vm = this;

            // get the fields name for each doc.
            var docFields = [];
            Object.keys(vm.doc).forEach(function(fieldName) {

                var theName = fieldName;
                if(fieldName.length > 30) {
                    // NOTE: We will need v-html directive to load raw HTML.
                    theName = '<a href="#" data-toggle="tooltip" title="' +
                              fieldName + '">' +
                              fieldName.substring(0, 25) + '...</a>';
                }

                // if we not process the field value, set the value as it is.
                var theValue = vm.doc[fieldName];

                var docField = {
                    fieldName: theName,
                    fieldValue: theValue
                };
                docFields.push(docField);
            });

            // sort by field name.
            docFields.sort(function(a, b) {
                if(a.fieldName < b.fieldName) {
                    return -1;
                }

                if(a.fieldName > b.fieldName) {
                    return 1;
                }

                return 0;
            });

            return docFields;
        }
    },

    /**
     * methods.
     */
    methods: {

        /**
         * format the index.
         */
        formatIndex(index) {

            return index + ".)";
        }
    }
}
</script>
