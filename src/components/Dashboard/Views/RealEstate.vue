<template>
  <div class="content">
    <div class="container-fluid">
      <h2 class="mt-0">Today's Insights</h2>
      <div class="row">
        <div class="col-xl-3 col-md-6">
          <stats-card>
            <div slot="header" class="icon-warning">
              <i class="nc-icon nc-chart text-warning"></i>
            </div>
            <div slot="content">
              <p class="card-category">Total Listings</p>
              <h4 class="card-title">{{strTotalListings}}</h4>
            </div>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card>
            <div slot="header" class="icon-success">
              <i class="nc-icon nc-light-3 text-success"></i>
            </div>
            <div slot="content">
              <p class="card-category">Total Listing Value</p>
              <h4 class="card-title">{{strTotalValue}}</h4>
            </div>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card>
            <div slot="header" class="icon-danger">
              <i class="nc-icon nc-vector text-danger"></i>
            </div>
            <div slot="content">
              <p class="card-category">Cities</p>
              <h4 class="card-title">{{strTotalCities}}</h4>
            </div>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card>
            <div slot="header" class="icon-info">
              <i class="nc-icon nc-single-02 text-primary"></i>
            </div>
            <div slot="content">
              <p class="card-category">Agents</p>
              <h4 class="card-title">{{strTotalAgents}}</h4>
            </div>
          </stats-card>
        </div>

      </div>
      <div class="row">
        <div class="col-md-8">
          <bar-chart-card :chart-data="cityBuckets">
            <template slot="header">
              <h4 class="card-title">Price trends</h4>
              <p class="card-category">10 years salary changes</p>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info"></i> Open
                <i class="fa fa-circle text-danger"></i> Click
                <i class="fa fa-circle text-warning"></i> Click Second Time
              </div>
              <hr>
              <div class="stats">
                <i class="fa fa-history"></i> Pick a sector 
              </div>
            </template>
          </bar-chart-card>
        </div>

        <div class="col-md-4">
          <card chart-type="Pie">
            <template slot="header">
              <h4 class="card-title">Listings by propery typies</h4>
              <p class="card-category">salary break down by sectors</p>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info"></i> Open
                <i class="fa fa-circle text-danger"></i> Bounce
                <i class="fa fa-circle text-warning"></i> Unsubscribe
              </div>
              <hr>
              <div class="stats">
                <i class="fa fa-clock-o"></i> Pick the Calendar Year 
              </div>
            </template>
          </card>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <card
            chart-type="Bar">
            <template slot="header">
              <h4 class="card-title">Top 10 cities (Houses)</h4>
              <p class="card-category">Top employees who got paied most</p>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info"></i> Tesla Model S
                <i class="fa fa-circle text-danger"></i> BMW 5 Series
              </div>
              <hr>
              <div class="stats">
                <i class="fa fa-check"></i> Data information certified
              </div>
            </template>
          </card>
        </div>

        <div class="col-md-6">
          <card>
            <template slot="header">
              <h4 class="card-title">Top 10 cities (Condo)</h4>
              <p class="category">News about sunshine list</p>
            </template>
            <l-table :data="tableData.data"
                     :columns="tableData.columns">
              <template slot="columns"></template>

              <template slot-scope="{row}">
                <td>
                  <Checkbox v-model="row.checked"></Checkbox>
                </td>
                <td>{{row.title}}</td>
                <td class="td-actions text-right">
                  <button type="button" class="btn-simple btn btn-xs btn-info" v-tooltip.top-center="editTooltip">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button type="button" class="btn-simple btn btn-xs btn-danger" v-tooltip.top-center="deleteTooltip">
                    <i class="fa fa-times"></i>
                  </button>
                </td>
              </template>
            </l-table>
            <div class="footer">
              <hr>
              <div class="stats">
                <i class="fa fa-history"></i> Updated 3 minutes ago
              </div>
            </div>
          </card>

        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import * as d3 from 'd3'
  import axios from 'axios'
  import BarChartCard from '@/components/UIComponents/Cards/BarChartCard.vue'
  import StatsCard from '@/components/UIComponents/Cards/StatsCard.vue'
  import Card from '@/components/UIComponents/Cards/Card.vue'
  import LTable from '@/components/UIComponents/Table.vue'
  import Checkbox from '@/components/UIComponents/Inputs/Checkbox.vue'

  // quick test to make sure d3 is available.
  console.log("d3 version: " + d3.version)

  export default {
    components: {
      Checkbox,
      Card,
      LTable,
      BarChartCard,
      StatsCard
    },
    computed: {
      strTotalValue() {
        var f = d3.format(",.2f");
        return "$" + f(this.totalValue);
      },
      strTotalListings() {
        var f = d3.format(",");
        return f(this.totalHits);
      },
      strTotalCities() {
        var f = d3.format(",");
        return f(this.cityBuckets.length);
      },
      strTotalAgents() {
        var f = d3.format(",");
        return f(this.totalAgents);
      }
    },
    data () {
      return {
        totalHits: 0,
        totalValue: 0,
        cityBuckets: [],
        totalAgents: 0,
        editTooltip: 'Edit Task',
        deleteTooltip: 'Remove',
        tableData: {
          data: [
            {title: 'Sign contract for "What are conference organizers afraid of?"', checked: false},
            {title: 'Lines From Great Russian Literature? Or E-mails From My Boss?', checked: true},
            {
              title: 'Flooded: One year later, assessing what was lost and what was found when a ravaging rain swept through metro Detroit',
              checked: true
            },
            {title: 'Create 4 Invisible User Experiences you Never Knew About', checked: false},
            {title: 'Read "Following makes Medium better"', checked: false},
            {title: 'Unfollow 5 enemies from twitter', checked: false}
          ]
        }
      }
    },

    /**
     */
    methods: {
      /**
       * search to collect some basic summary of listings.
       */
      summarySearch() {
        var self = this;

        //var searchUrl = 'https://example.com/search';
        var searchUrl = self.$localSettings.reSearchUrl;
        var payload = {
          workflow: "customsearch",
          query: "table:xmldata",
          facets: [
            "city(maxBuckets=15)",
            "agentname(maxBuckets=-1)",
            "listvalue_i(statistics=true)"
          ]
        };

        console.log(d3.version);
        axios.post(searchUrl, payload)
        .then(function(response) {
          console.log(response);
          self.totalHits = response.data.totalHits;
          self.cityBuckets = response.data.facets[0].buckets;
          self.totalAgents = response.data.facets[1].buckets.length;
          self.stats = response.data.facets[2].statistics;
          self.totalValue = self.stats['sum'];
        })
        .catch(function(error) {
          self.resultSummary = "Query Error!";
          console.log(error);
        });
      }
    },

    /**
     * list by cites.
     */

    /**
     * bind to the created hook.
     */
    created() {
      this.summarySearch();
    }
  }
</script>
<style>

</style>
