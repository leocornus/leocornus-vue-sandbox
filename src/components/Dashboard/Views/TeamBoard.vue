<template>
<div class="content container">
<b-input-group class="mb-2 text-center">
  <b-dropdown right text="Choose a Team">
    <b-dropdown-item v-for="(team, index) in teams" :key="index"
                     v-on:click="switchTeam(team.name, index)"
    >{{team.name}}</b-dropdown-item>
  </b-dropdown>
  <b-input-group-append>
    <span id="restBaseUrl-addon" class="input-group-text">{{teamLabel}}</span>
  </b-input-group-append>
</b-input-group>

  <!-- Game report area -->
  <div v-if="!(gameId === null)">
    <b-tabs card>
      <b-tab name="Players">
        <template slot="title">
          <font-awesome-icon icon="user" size="lg"/>
        </template>
        <!-- stats in table format for each player by team -->
        <b-container>
          <b-row>
            <b-col>
              <b-table striped bordered small
                  :items="playerStats"
                  :fields="playerStatsFields" caption-top>
                <template slot="table-caption">
                  <span class="h4">{{teamLabel}}</span>
                </template>
              </b-table>
            </b-col>
          </b-row>
        </b-container>
      </b-tab>
    </b-tabs>
  </div>

</div>
</template>

<script>

import * as d3 from 'd3'
import axios from 'axios'
import md5 from 'md5'

export default {

    components: {
    },

    data() {
        return {
            name: "teamboard",

            /**
             * we will collect teams's information from modal.
             * here is a sample of the teams data structure.
             *   teams: [
             *       {name: "Team name",
             *        query: 'team:"Team One" OR team:"Team Two"'
             *       },
             *       {name: "Team Name 2",
             *        query: 'team: "team a"'
             *       }
             *   ],
             */
            teams: [],

            teamLabel: 'The Team',

            /**
             * player statistics.
             *
             * player stats will have the following data structure:
             *
             * [
             *    {"player":2, "score":0, "shoot":3, "free throw":1, "foul":1},
             *    {"player":3, "score":1, "shoot":3, "free throw":2, "foul":0}
             * ],
             */
            playerStats: [],

            /**
             * fields for player stats.
             */
            playerStatsFields: [
               {key:"Player", label: "#", variant: "info", sortable: true},
               {key:"Score", label: "P", sortable: true},
               {key:"Foul", label: "PF", variant: "danger", sortable: true},
               //{key:"Shoot"},
               {key:"2P Shoot", label: "2PS", variant: "success"},
               {key:"3P Shoot", label: "3PS"},
               {key:"Free Throw", label: "FT", variant: "success"},
               {key:"Rebound", label: "REB"},
               {key:"Assist", label: "AST"},
               {key:"Steal", label: "STL"}
            ],

            /**
             * periods for report, some of them are not actual periods.
             */
            reportPeriods: ["Final", "1", "2",
                            "1st", "3", "4", "2nd"]
        }
    },

    computed: {

    },

    methods: {

        /**
         * hook on the click event on queue selection dropdown.
         * we could use the inline JavaScript statement to pass the queue name.
         * here is a example:
         * <b-dropdown-item v-for="(collection, index) in collections"
         *        v-on:click="switchCollection(collection.name, index)">
         */
        switchTeam(teamName, index) {

            //console.log("["+ index + "] " + collectionName);

            this.teamLabel = this.teams[index].name;
            this.solrPivotSearch(this.restBaseUrl, this.teams[index].query);
        },

        /**
         * tells the action.
         */
        isShootAction(actionName) {

            // shoot actions:
            let shoots = ["Shoot", "2P Shoot", "3P Shoot", "Free Throw"];

            return shoots.includes(actionName);
        },

        /**

        /**
         * load players stats for each team.
         * player stats will have the following data structure:
         *
         * {"team home": [
         *    {"player":2, "score":0, "shoot":3, "free throw":1, "foul":1},
         *    {"player":3, "score":1, "shoot":3, "free throw":2, "foul":0}
         *  ],
         *  "team guest": [
         *    {"player":12, "score":0, "shoot":3, "free throw":1, "foul":2},
         *    {"player":23, "score":1, "shoot":3, "free throw":2, "foul":1}
         *  ]
         * }
         */
        loadPlayerStats(playerActionScore) {

            var vm = this;
            // reset the play stats.
            vm.playerStats = [];

            // go through each player pivot.
            playerActionScore.forEach(function(playerPivot) {

                // one row for each player,
                // which will have all actions.
                var playerActions = {"Player": playerPivot.value};
                // initialize the player score.
                var playerScores = 0;
                // now the action pivot, go through each action.
                playerPivot.pivot.forEach(function(actionPivot) {

                    playerActions[actionPivot.value] = actionPivot.count;
                    // how to get the scores for action: Shoot and Free Throw
                    if(vm.isShootAction(actionPivot.value)) {
                        // calculate made / total for all shoot action.
                        // we already have total count,
                        // only need find out how many made count.
                        let made = 0;
                        actionPivot.pivot.forEach(function(scorePivot) {
                            // calculate player score.
                            playerScores += scorePivot.value * scorePivot.count;

                            if(scorePivot.value > 0) {
                                made += scorePivot.count;
                            }
                        });
                        // reset the shoot action's count
                        // with made/total format.
                        playerActions[actionPivot.value] =
                            `${made}/${actionPivot.count}`;

                        // TODO: for some old game actions!
                        // before we split shoot action into 2 Point shoot and
                        // 3 point shoot.
                        if(actionPivot.value === "Shoot") {
                            playerActions["2P Shoot"] =
                                `${made}/${actionPivot.count}`;
                        }
                    }
                });

                // add totoal scores.
                playerActions["Score"] = playerScores;

                // push to player stats.
                vm.playerStats.push(playerActions);
            });

            console.log(vm.playerStats);
        },

        //=========================================
        // Solr functions
        //=========================================

        /**
         * utility method to get team by actions.
         */
        solrPivotSearch(baseUrl, queryString) {

            let vm = this;

            // using the simple select handler.
            var endPoint = baseUrl + "select";
            // get ready the search payload
            var payload = {
              "query": queryString,
              "params": {
                "rows": 0,
                "start": 0,
                "sort": "_timestamp_ asc",
                "facet": "on",
                "facet.pivot": [
                  "player,action,score"
                ],
                "fq": [
                  "table:gameaction"
                  //"game_id:" + vm.gameId
                  //"game_id:430a92ae677ecb17469452aadfceaba8"
                ]
              }
            };

            // we have to use post for pivot faceting
            axios.post(endPoint, payload).then(function(response) {

                let pivot = response.data.facet_counts.facet_pivot;
                console.log(pivot);

                // players break down table for each team.
                vm.loadPlayerStats(pivot['player,action,score']);
            })
            .catch(function(error) {
            });
        }
    },

    /**
     * created will be called after Vue mode is created.
     * Vue mode is avaiable now!
     */
    created() {

        let vm = this;

        // the page settings.
        //console.log(this.pageName);
        this.page = this.$localSettings.solr['gameboard'];

        // set the the default collection, the first colleciton in the list.
        this.restBaseUrl = this.page.restBaseUrl;
        this.teams = this.page.teams;

        // set refresh interval and keep the interval ID as refreshId.
        //vm.refreshId = setInterval(function() {
        //    if(vm.gameId != null) {
        //        vm.loadReports();
        //    }
        //}.bind(vm), 3000);
    },

    /**
     * destroy the refresh id.
     */
    destroyed() {
        //clearInterval(this.refreshId);
    }
}
</script>
<style>
    .btn-circle-sm {
        width: 30px;
        height: 30px;
        padding: 6px 0px;
        border-radius: 15px;
        text-align: center;
        font-size: 12px;
        line-height: 1.42857;
    }
    .btn-circle {
        width: 50px;
        height: 50px;
        padding: 6px 0px;
        border-radius: 25px;
        text-align: center;
        font-size: 18px;
        line-height: 1.42857;
    }

    .btn-circle.btn-xl {
        width: 70px;
        height: 70px;
        padding: 10px 16px;
        border-radius: 35px;
        font-size: 18px;
        line-height: 1.33;
    }

    .search-input {
        width: 100%;
        /**padding: 1.5em 1em;*/
        font-size: 1em;
        outline: 0;
        /**border: 5px solid #41B883;*/
    }
    .results {
        margin: 0;
        padding: 0;
        text-align: left;
        //position: absolute;
        position: relative;
        transform-origin: top;
    }
    .results li {
        background: rgba(53, 73, 94, 0.3);
        margin: 0;
        padding: 1em;
        list-style: none;
        width: 100%;
        border-bottom: 1px solid #394E62;
        transition: ease-in-out 0.5s;
    }
    .slide-enter-active, .slide-leave-active {
        transition: opacity 0.3s;
    }
    .slide-enter, .slide-leave-to {
        opacity: 0;
    }
</style>
