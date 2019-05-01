<template>
<div>
<b-card no-body class="mb-3 border border-info border-top-0 border-left-0 border-right-0"
    v-for="(doc, index) in docs" :doc="doc" :key="doc.id"
>
  <div class="small text-warning">
    {{doc['product_spec_sub_type']}} - {{doc['product_spec_type']}} - {{doc['product_type']}}
  </div>
  <div>
    <b-link href="#" @click="$emit('show-details', doc[idFieldName])"
            class="font-weight-bold">
      {{doc['designation']}} - {{doc['sku']}}
    </b-link>
  </div>
  <div>
    {{doc['product_title_en']}}<br/>
    {{doc['product_title_fr']}}
  </div>
  <div class="small">
    <span class="text-success">Score 
      <span class="font-weight-bold">{{doc['score']}}</span>
    </span>,
    Publication Year: {{doc['publication_year']}},
    {{doc['language']}},
    Published by <span class="font-weight-bold">{{doc['publisher']}}</span>
  </div>
</b-card>
</div>
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

    name: "product-preview",

    // the doc will have all details and a index field.
    props: {
        "docs": Array,
        // set the name for id field.
        "idFieldName": {
            type: String,
            default: "id"
        },
        "thePage": Object
    }
}
</script>
