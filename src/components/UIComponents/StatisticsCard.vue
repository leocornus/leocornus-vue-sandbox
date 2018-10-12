<template>
<b-card no-body class="bg-primary mb-2" v-if="theStats">
  <b-card-header class="bg-primary text-white">
    <a v-b-toggle="statsCollapseID"
       href="#" class="card-link text-white">
      Stats - {{statsLabel}}
    </a>
  </b-card-header>
  <b-collapse :id="statsCollapseID">
  <ul class="list-group list-group-flush">
    <li class="list-group-item list-group-item-info d-flex justify-content-between align-items-center"
        v-for="(item, index) in theStats" :key="index">
      {{item.key}} : {{item.value}}
    </li>
  </ul>
  </b-collapse>
</b-card>
</template>

<script>
// bootstrap-vue components.
import bCard from 'bootstrap-vue/es/components/card/card'
import bCardHeader from 'bootstrap-vue/es/components/card/card-header'
import bCollapse from 'bootstrap-vue/es/components/collapse/collapse'
import vBToggle from 'bootstrap-vue/es/directives/toggle/toggle'

import * as d3 from 'd3'

export default {

    components: {
      'b-card': bCard,
      'b-card-header': bCardHeader,
      'b-collapse': bCollapse
    },

    directives: {
      // Vue will automatically prefix the directive name with 'v-'
      // so we will use it like this: v-b-toggle.
      'b-toggle': vBToggle
    },

    name: "stats-card",

    props: ["stats"],

    // using computed for dynamic data.
    computed: {

        /**
         * stats card label.
         */
        statsLabel() {
            return this.stats.label;
        },

        /**
         * stats id
         */
        statsID() {
            return this.statsLabel.replace(/ /g, '-');
        },

        /**
         * compute the collapse id.
         */
        statsCollapseID() {
            return "stats-" + this.statsID;
        },

        /**
         * compute the statistics data.
         * It will be an array of Objects with the follwing structure:
         * { "key": "key-one",
         *   "value": "value-one"}
         */
        theStats() {

            var stats = this.stats.statistics;
            if(stats) {
                // using d3-format to format numbers.
                var format = d3.format(",.2f");
                var items = [];
                Object.keys(stats).forEach(function(theKey) {
                    var item = {
                      "key": theKey,
                      "value": format(stats[theKey])
                    }
                    items.push(item);
                });

                return items;
            } else {
                return [];
            }
        }
    },

    // methods.
    methods: {

    }
}
</script>
