<template>
  <svg width="500" height="270">
    <g transform="translate(0, 10)">
      <path :d="line" />
    </g>
    <g v-axis:x="scale" transform="translate(0, 25)"></g>
  </svg>
</template>

<script>
import * as d3 from 'd3';

// define he properties for this component here.

export default {

  name: 'line-chart',

  data() {
    return {
      data: [99, 71, 78, 25, 36, 92]
    };
  },

  // check the vue.js doc about custom directives:
  // - https://vuejs.org/v2/guide/custom-directive.html
  directives: {

      axis(el, binding) {

          const axis = binding.arg;
          const axisMethod = { x: "axisBottom", y: "axisLeft" }[axis];
          const methodArg = binding.value[axis];

          d3.select(el).call(d3[axisMethod](methodArg));
      }
  },

  computed: {

    scale() {
      const x = d3.scaleTime().range([0, 430]);
      const y = d3.scaleLinear().range([210, 0]);

      x.domain(d3.extent(this.data, (d, i) => i));
      y.domain([0, d3.max(this.data, d => d)]);

      return { x, y };
    },

    line() {

      const path = d3.line()
        .x((d, i) => this.scale.x(i))
        .y(d => this.scale.y(d));

      return path(this.data);
    }
  }
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
