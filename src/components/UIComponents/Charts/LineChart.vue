<template>
<div>
  <svg :width="width" :height="height">
    <g transform="translate(20, 0)">
      <path :d="line" />
    </g>
    <g v-axis:x="scale" :transform="`translate(20,${height})`"></g>
    <g v-axis:y="scale" transform="translate(20,0)"></g>
  </svg>
</div>
</template>

<script>
import * as d3 from 'd3';

// define he properties for this component here.

export default {

  name: 'line-chart',

  data() {
    return {
      width: 0,
      height: 0,
      data: [99, 71, 78, 25, 36, 92, 1, 34, 45]
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

  mounted() {

      window.addEventListener('resize', this.onResize);
      this.onResize();
  },

  computed: {

    scale() {
      const x = d3.scaleTime().range([0, this.width]);
      const y = d3.scaleLinear().range([this.height, 0]);

      x.domain(d3.extent(this.data, (d, i) => i));
      //x.domain(d3.extent(this.data));
      y.domain([0, d3.max(this.data, d => d)]);

      return { x, y };
    },

    line() {

      const path = d3.line()
        .x((d, i) => this.scale.x(i))
        .y(d => this.scale.y(d));

      return path(this.data);
    }
  },

  methods: {

      onResize() {

          this.width = this.$el.offsetWidth;
          //this.height = this.$el.offsetHeight;
          this.height = 300;
      }
  }
};
</script>

<style lang="sass" scoped>
svg
  margin: 0px;
  border: solid black 0px;

path
  fill: none
  stroke: #76BF8A
  stroke-width: 3px
</style>
