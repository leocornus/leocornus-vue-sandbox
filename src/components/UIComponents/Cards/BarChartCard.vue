<template>
  <div class="card">
    <div class="card-header" v-if="$slots.header"
         v-on:click="drawHorizontalBar"
    >
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <div :id="chartId" class="ict-chart">
      </div>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
<script>
import * as d3 from 'd3'

export default {
  name: 'bar-chart-card',

  components: {
  },

  props: {
    chartData: {
      type: Array,
      default: () => {
        return []
      } 
    }
  },

  data() {

    return {
      chartId: 'no-id'
    }
  },

  computed: {

    thechartId() {
      return "";
    }
  },

  methods: {

    /**
     * draw horizontal bars.
     */
    drawHorizontalBar() {
        var self = this;

        //console.log("D3 Version Again: " + d3.version);
        // calculate the dimension for bar chart.
        var divId = `#${self.chartId}`;
        //var divId = "#chartId";
        //console.log(d3.select(divId));
        var divWidth = parseInt(d3.select(divId).style("width"));
        var margin = {top: 1, right: 2, bottom: 20, left: 2};
        var width = divWidth - margin.left - margin.right;
        var height = 250 - margin.top - margin.bottom;

        /**
         * the data will have format
         * [{value:"label", count:"2"}, {}]
         */
        var data = self.chartData;

        // make sure the count is number type.
        //data.forEach(function(d) {
        //    d.count = +d.count;
        //});

        // set up x and y axis
        var y = d3.scaleBand().range([height, 0]).padding(0.1);
        var x = d3.scaleLinear().range([0, width]);
        // Scale the range of the data in the domains
        x.domain([0, d3.max(data, function(d){ return d.count; })])
        // map will create a new array with 
        // the results of the provided function.
        y.domain(data.map(function(d) { return d.value; }));

        // remove the existing content.
        d3.select(divId).html("");

        // draw the svg element.
        var svg = d3.select(divId).append("svg")
            .attr("class", "card-img-top")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(responsivefy)
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
            .attr("y", function(d) { return y(d.value); })
            .attr("height", y.bandwidth())
            .transition("width")
            .duration(1000)
            .delay(function(d, i) { return i * 100; })
            .attr("width", function(d) {return x(d.count); } );
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

        // add the x Axis
        bar.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        function responsivefy(svg) {
        
            // get container + svg aspect ratio
            var container = d3.select(svg.node().parentNode),
                width = parseInt(svg.style("width")),
                height = parseInt(svg.style("height")),
                aspect = width / height;
        
            // add viewBox and preserveAspectRatio properties,
            // and call resize so that svg resizes on inital page load
            svg.attr("viewBox", "0 0 " + width + " " + height)
                .attr("perserveAspectRatio", "xMinYMid")
                .call(resize);
        
            // to register multiple listeners for same event type, 
            // you need to add namespace, i.e., 'click.foo'
            // necessary if you call invoke this function for multiple svgs
            // api docs: https://github.com/mbostock/d3/wiki/Selections#on
            d3.select(window).on("resize." + container.attr("id"), resize);
        
            // get width of container and resize svg to fit it
            function resize() {
                var targetWidth = parseInt(container.style("width"));
                svg.attr("width", targetWidth);
                svg.attr("height", Math.round(targetWidth / aspect));
            }
        }
    },

    /***
     * Assigns a random id to the chart
     */
    updateChartId () {

      const currentTime = new Date().getTime().toString()
      const randomInt = this.getRandomInt(0, currentTime)

      this.chartId = `div_${randomInt}`
    },
    getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
  },

  /**
   * bind to the mounted hook
   */
  mounted () {
    this.updateChartId();
    //this.drawHorizontalBar();
    //d3.select(window).on('resize', this.drawHorizontalBar()); 
  }
}
</script>
<style>

</style>
