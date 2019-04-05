<template>

  <b-table striped :items="docs">
    <!-- A virtual composite column -->
    <template slot="products" slot-scope="data">
     {{ data.item.products.join(", ") }}
    </template>
    <template slot="_created_" slot-scope="data">
     {{ new Date(data.item._created_).toLocaleString() }}
    </template>
    <template slot="_modified_" slot-scope="data">
     {{ new Date(data.item._modified_).toLocaleString() }}
    </template>
  </b-table>

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

    name: "listing-details-table",

    // the doc will have all details and a index field.
    props: {
        "docs": Object,
        // set the name for id field.
        "idFieldName": {
            type: String,
            default: "id"
        },
        "thePage": Object
    },

    computed: {

        // for all th IDs, we need replace the following special chars with
        // empty string:
        // @ . /
        docID() {
            let theId = this.doc[this.idFieldName];
            theId = (typeof theId === "object") ? theId[0] : theId;
            return theId.replace(/[@\.\/]/g, '');
        },

        listingID() {
            return this.DocID;
        },

        collapseID() {
            return "collapse" + this.docID;
        },

        targetCollapseID() {
            return "'collapse" + this.docID;
        },

        /**
         * title for each doc.
         * we will depends on the parent to customize the caption
         */
        caption() {

            // by default, we will using id as the caption.
            var caption = this.docID;

            // check the parent component:
            if(this.thePage.hasOwnProperty("customizeListingDetailsCaption")) {
                caption = this.thePage.customizeListingDetailsCaption(this.doc);
            }

            return caption;
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

            // using array map to customize field values:
            if(vm.thePage.hasOwnProperty("customizeListingDetailsField")) {
                //console.log(vm.$localSettings.customizeField);
                // the customizeField will follow the specification of
                // Array.map callback function.
                return docFields.map(vm.thePage.customizeListingDetailsField);
            } else {
                return docFields;
            }
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
