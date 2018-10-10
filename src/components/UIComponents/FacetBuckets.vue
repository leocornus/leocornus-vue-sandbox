<template>
<b-card no-body class="border-success mb-2">
  <b-card-header class="bg-success text-white" :id="facetID">
    <a v-b-toggle="facetCollapseID"
       href="#" class="card-link text-white">
    {{facetLabel}} - {{facetBuckets.length}}
    </a>
    <div class="d-none">{NO{facetBucketsCSV}NO}</div>
    <!-- span class="badge badge-light badge-not-pill float-right ml-1">
      <a v-on:click="showListGroup" href="#" class="card-link"
      ><i class="fas fa-list"></i></a>
    </span>
    <span class="badge badge-warning badge-not-pill float-right ml-1">
      <a v-on:click="showHorizontalBar" href="#" class="card-link"
      ><i class="fas fa-chart-bar"></i></a>
    </span -->
  </b-card-header>
  <b-collapse :id="facetCollapseID">
  <ul class="list-group list-group-flush">
    <li class="list-group-item list-group-item-success d-flex justify-content-between align-items-center"
        v-for="(bucket, index) in facetBuckets" 
        :bucket="bucket" :key="index">
      <a href="#" v-on:click="$emit('bucket-select', facetLabel, bucket.value)">
      {{bucket.value}}
      </a>
      <span class="badge badge-primary badge-pill">{{bucket.count}}</span>
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

    name: "facet-buckets",

    props: ["facet"],

    // using computed for dynamic data.
    computed: {
        // the facet label.
        facetLabel() {
            return this.facet.label;
        },

        // ids for collapse.
        facetID() {
            // replace the white space with -.
            return this.facet.label.replace(/ /g, '-');
        },

        // we could use the computed property as a normal property
        facetCollapseID() {
            return "collapse" + this.facetID;
        },
        facetTargetCollapseID() {
            return "#collapse" + this.facetID;
        },

        // facet buckets.
        facetBuckets() {
            return this.facet.buckets;
        }
    },

    // methods.
    methods: {

        /**
         * show the horizontal bar and hide the list group.
         * if the horizontal bar not exist, we will draw it.
         */
        showHorizontalBar() {

            // Try to find the corrent element..
            var divId = "#collapse" + this.facet.label.replace(/ /g, '-');

            // hide the list gourp..
            d3.select(divId + ">ul").classed("d-none", true);

            // check if the svg is exist
            // d3.select will return a selection object.
            var svgElement = d3.select(divId + ">svg");
            if(svgElement.empty()) {
                this.drawHorizontalBar();
            } else {
                // show up the svg by remove the d-none class.
                svgElement.classed("d-none", false);
            }
        },

        showListGroup() {
            // Try to find the corrent element..
            var divId = "#collapse" + this.facet.label.replace(/ /g, '-');

            // check if the svg is exist
            // d3.select will return a selection object.
            var svgElement = d3.select(divId + ">svg");
            if(svgElement.empty()) {
                // do nothing...
            } else {
                // show up the svg by remove the d-none class.
                svgElement.classed("d-none", true);
            }

            // hide the list gourp..
            d3.select(divId + ">ul").classed("d-none", false);
        },

        /**
         * draw horizontal bars.
         */
        drawHorizontalBar() {
            var self = this;

            // calculate the dimension for bar chart.
            var divId = "#collapse" + self.facet.label.replace(/ /g, '-');
            var divWidth = parseInt(d3.select(divId).style("width"));
            var margin = {top: 1, right: 2, bottom: 1, left: 2};
            var width = divWidth - margin.left - margin.right;
            var height = 250 - margin.top - margin.bottom;

            /**
             * the data will have format
             * [{value:"label", count:"2"}, {}]
             */
            var data = self.facet.buckets;

            // make sure the count is number type.
            data.forEach(function(d) {
                d.count = +d.count;
            });

            // set up x and y axis
            var y = d3.scaleBand().range([height, 0]).padding(0.1);
            var x = d3.scaleLinear().range([0, width]);
            // Scale the range of the data in the domains
            x.domain([0, d3.max(data, function(d){ return d.count; })])
            // map will create a new array with 
            // the results of the provided function.
            y.domain(data.map(function(d) { return d.value; }));

            // remove the existing content.
            //d3.select(divId).html("");

            // draw the svg element.
            var svg = d3.select(divId).append("svg")
                .attr("class", "card-img-top")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", 
                      "translate(" + margin.left + "," + margin.top + ")");

            // draw the group bar.
            var bar = svg.selectAll(".bar")
                .data(data)
                .enter().append("g")
                .attr("fill", "steelblue")
                .attr("class", "bar");

            // append the rectangles for the bar chart
            //var barRect = bar.selectAll(".bar-rect")
            //    .data(function(d) {return d;})
            //  .enter().append("rect")
            bar.append("rect")
                .attr("class", "bar-rect")
                //.attr("x", function(d) { return x(d.sales); })
                .attr("width", function(d) {return x(d.count); } )
                .attr("y", function(d) { return y(d.value); })
                .attr("height", y.bandwidth());
            // try to append text.
            //var barText = bar.selectAll(".bar-text")
            //    .data(function(d) {return d;})
            //  .enter().append("text")
            bar.append("text")
                .attr("fill", "white")
                .attr("x", "3")
                .attr("y", function(d) {return y(d.value) + y.bandwidth() - 5;})
                .attr("font-size", y.bandwidth() * 3 / 5)
                //.attr("font-size", "1.1em")
                //.attr("dy", "1.2em")
                .text(function(d) {return d.value+ ": " + d.count;});
        }
    }
}
</script>
