<template>
  <svg width="500" height="270" :id="svgId">
    <g style="transform: translate(0, 10px)">
      <path :d="line" />
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'line-chart',
  data() {
    return {
      svgId: 'abc',
      data: [99, 71, 78, 25, 36, 92],
      line: '',
    };
  },
  mounted() {
    this.calculatePath();
  },
  methods: {

    getScales() {
      const x = d3.scaleTime().range([0, 430]);
      const y = d3.scaleLinear().range([210, 0]);

      d3.axisLeft().scale(x);
      d3.axisBottom().scale(y);

      x.domain(d3.extent(this.data, (d, i) => i));
      y.domain([0, d3.max(this.data, d => d)]);
      return { x, y };
    },

    calculatePath() {
      const scale = this.getScales();
      const path = d3.line()
        .x((d, i) => scale.x(i))
        .y(d => scale.y(d));
      this.line = path(this.data);

      d3.select('#' + this.svgId)
          .append("g")
          // the powerful transform, details from this page:
          // - https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
          .attr("transform", "translate(0, 250)")
          // call function will work with a D3 selection
          .call(d3.axisBottom(scale.x));
    },
  },
};
</script>

<style lang="sass" scoped>
svg
  margin: 25px;
  border: solid black 0px;

path
  fill: none
  stroke: #76BF8A
  stroke-width: 3px
</style>
