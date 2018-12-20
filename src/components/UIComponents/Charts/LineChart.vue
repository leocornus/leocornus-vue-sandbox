<template>
<div>
  <svg :width="width" :height="height">
    <g :transform="`translate(${margin.left},${margin.top})`">
      <path :d="line" />
    </g>
    <g v-axis:x="scale"
       :transform="`translate(${margin.left},${height - margin.bottom})`"></g>
    <g v-axis:y="scale"
       :transform="`translate(${margin.left},${margin.top})`"></g>
    <g v-axis:yr="scale"
       :transform="`translate(${width - margin.right},${margin.top})`"></g>
  </svg>
</div>
</template>

<script>
// TODO: check this bl.ocks:
// - https://bl.ocks.org/mbostock/1166403
// TODO: this one with grids:
// - https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218

import * as d3 from 'd3';

// define he properties for this component here.

export default {

  name: 'line-chart',

  data() {
    return {
      width: 0,
      height: 0,
      // margin will be used to hold the axes
      margin: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 30
      },
      data: [190, 71, 78, 125, 36, 92, 20, 34, 45]
    };
  },

  // check the vue.js doc about custom directives:
  // - https://vuejs.org/v2/guide/custom-directive.html
  directives: {

      axis(el, binding) {

          const axis = binding.arg;
          const axisMethod = { x: "axisBottom", y: "axisLeft", yr: "axisRight"}[axis];
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

      // using scaleTime for a quick try.
      const x = d3.scaleTime()
          .range([0, this.width - this.margin.left - this.margin.right]);
      const y = d3.scaleLinear()
          .range([this.height - this.margin.bottom - this.margin.top, 0]);

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
          // TODO: calculate the height based on:
          // - width
          // - aspect ratio ??? where does this come from.
          // - domain, this will come from data.
          // scale range will calculated based on width and height
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
