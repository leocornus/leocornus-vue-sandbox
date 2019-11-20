<template>

  <b-table striped small :items="docs" :fields="fields">
    <template :slot="idFieldName" slot-scope="data">
      <b-link href="#" @click="$emit('show-details', data.item[idFieldName])">
        <i class="nc-icon nc-paper-2 text-primary"></i>
      </b-link>
    </template>
    <!-- A virtual composite column -->
    <template slot="products" slot-scope="data">
     {{ data.item.hasOwnProperty('products')?data.item.products.join(", "):"" }}
    </template>
    <template slot="_timestamp_" slot-scope="data">
     {{ new Date(data.item._timestamp_).toLocaleString() }}
    </template>
    <template slot="_created_" slot-scope="data">
     {{ new Date(data.item._created_).toLocaleString() }}
    </template>
    <template slot="_modified_" slot-scope="data">
     {{ new Date(data.item._modified_).toLocaleString() }}
    </template>
    <template slot="i_ModificationDate" slot-scope="data">
     {{ new Date(data.item.i_ModificationDate).toLocaleString() }}
    </template>
    <template slot="i_DateImported" slot-scope="data">
     {{ new Date(data.item.i_DateImported).toLocaleString() }}
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

        "docs": Array,
        // set the name for id field.
        "idFieldName": {
            type: String,
            default: "id"
        },
        // field List.
        "fieldList":{ 
            type: String,
            default: ""
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

            if(this.fieldList === "") {
                return [this.idFieldName];
            } else {
                let list = this.fieldList.split(",");
                if(!list.includes(this.idFieldName)) {
                    list.unshift(this.idFieldName);
                }
                return list;
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
