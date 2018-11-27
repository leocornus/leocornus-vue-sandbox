<template>
<div class="content container">
  <div id="game-app">
    <b-input-group class="mb-2">
      <b-button variait="warning"
                v-on:click="showGameSettings('new')">Create New Game</b-button>
      <b-form-input type="text" placeholder="Select a existing game..."
          class="search-input"
          v-on:focus.native="selectGame('focus')"
          v-on:blur.native="selectGame('blur')"
      />
    </b-input-group>

      <transition-group name="slide" tag="ul" class="results">
        <li v-for="item in filtered" :key="item.id">
          <span><a href="#" v-on:click="loadGame(item.id)">
            <strong>{{ item.title  }}</strong> - <small>{{ item.id  }}</small><br>
            <small>{{ item.body  }}</small>
          </a></span>
        </li>
      </transition-group>

    <!-- game summary and timer (TODO) -->
    <div v-if="!(gameId === null)" class="text-center">
      <span class="h3">{{teams[0].name}} Vs. {{teams[1].name}}</span>
      <b-button variait="primary" v-if="!(gameId === null)"
                v-on:click="showGameSettings('update')">Game Settings</b-button>
    </div>

    <b-input-group class="mb-2" v-if="teams.length > 0">
      <b-input-group-append>
        <span id="period-addon" class="input-group-text">Period: </span>
      </b-input-group-append>
      <b-form-select class="form-control"
          aria-describedby="period-addon"
          v-model="period" :options="['Period 1','Period 2','Period 3','Period 4']">
      </b-form-select>
    </b-input-group>
    <b-input-group class="mb-2" v-if="teams.length > 0">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Teams: </span>
      </b-input-group-append>
      <b-button variant="outline-primary" v-for="(team, index) in teams"
                v-on:click="setTeam(team.name, index)" :key="'team-' + index">
        {{team.name}}
      </b-button>
    </b-input-group>
    <b-input-group class="mb-2" v-if="tracking.team.length > 0">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Players: </span>
      </b-input-group-append>
      <b-button variant="outline-warning" v-for="(player, index) in players"
                v-on:click="setPlayer(player.number)" :key="'player-' + index">
        {{player.number}}
      </b-button>
    </b-input-group>
    <b-input-group class="mb-2" v-if="actions.length > 0">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Actions: </span>
      </b-input-group-append>
      <b-button variant="outline-primary" v-for="(action, index) in actions"
                v-on:click="setAction(action.name)" :key="'action-' + index">
        {{action.name}}
      </b-button>
    </b-input-group>
    <b-input-group class="mb-2"
                   v-if="['Shoot','Free Throw'].includes(this.tracking.action)">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Points: </span>
      </b-input-group-append>
      <b-button variant="outline-success" v-for="point in points"
                v-on:click="setPoint(point)" :key="'point-' + point">
        {{point}}
      </b-button>
    </b-input-group>
    <b-input-group class="mb-2" size="lg" v-if="tracking.team.length > 0">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Tracking: </span>
      </b-input-group-append>
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text text-danger">
          {{trackingMessage}}
        </span>
      </b-input-group-append>
      <b-button variant="outline-primary" v-on:click="send">Submit</b-button>
    </b-input-group>
  </div>

  <!-- Game report area -->
  <div v-if="!(gameId === null)">
    <b-tabs card>
      <b-tab name="Full">
        <template slot="title">
          <b-input-group>
            <b-input-group-append>
              <span id="loadreports-addon" class="input-group-text">Game Stats: </span>
            </b-input-group-append>
            <b-button variant="primary" v-for="(rp, index) in reportPeriods"
                v-on:click="loadReports(rp)" :key="'rp-' + index">
              {{rp}}
            </b-button>
          </b-input-group>
        </template>
        <h3 class="text-center mt-0 mb-2">Stats for ??? </h3>
        <b-tabs vertical small>
          <b-tab name="Chart">
            <template slot="title">
              <font-awesome-icon icon="chart-bar" size="lg"/>
            </template>
            <!-- side by side bar chart -->
            <div :id="chartId" class="no-d-none"></div>
          </b-tab>
          <b-tab name="Table">
            <template slot="title">
              <font-awesome-icon icon="list" size="lg"/>
            </template>
            <!-- stats in table format for each team. -->
            <b-table striped :items="teamActions.items" :fields="teamActions.fields"></b-table>
          </b-tab>
          <b-tab name="Players">
            <template slot="title">
              <font-awesome-icon icon="user" size="lg"/>
            </template>
            <!-- stats in table format for each player by team -->
            <b-container>
              <b-row>
                <b-col>
                  <b-table striped :items="playerStats[teams[0].name]"
                                   :fields="playerStatsFields" caption-top>
                    <template slot="table-caption">
                      <span class="h4">{{teams[0].name}}</span>
                    </template>
                  </b-table>
                </b-col>
                <b-col>
                  <b-table striped :items="playerStats[teams[1].name]"
                                   :fields="playerStatsFields" caption-top>
                    <template slot="table-caption">
                      <span class="h4">{{teams[1].name}}</span>
                    </template>
                  </b-table>
                </b-col>
              </b-row>
            </b-container>
          </b-tab>
        </b-tabs>
      </b-tab>
    </b-tabs>
  </div>

  <!-- Game Settings modal -->
  <b-modal ref="gameSettings" title="Game Settings"
           @ok="setGame">
    <p class="h4">Home Team</p>
    <b-input-group prepend="Team Name:">
      <b-form-input type="text" aria-label="Set name of home team" v-model="modalHomeTeam"/>
    </b-input-group>
    <b-input-group prepend="Players: ">
      <b-form-input type="text" aria-label="Set players for home team"
                    v-model="modalHomePlayers"/>
    </b-input-group>

    <p class="h4">Guest Team</p>
    <b-input-group prepend="Team Name:">
      <b-form-input type="text" aria-label="Set name of guest team" v-model="modalGuestTeam"/>
    </b-input-group>
    <b-input-group prepend="Players: ">
      <b-form-input type="text" aria-label="Set players for guest team"
                    v-model="modalGuestPlayers"/>
    </b-input-group>
  </b-modal>
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
            // track the game Id.
            gameId : null,

            filtered: [],

            name: "gameboard",

            // this default values shows the data structure.
            modalHomeTeam: "home",
            modalHomePlayers: "1,2,3,4,5",
            modalGuestTeam: "guest",
            modalGuestPlayers: "1,2,3,4,5",

            /**
             * period.
             */
            period: "Period 1",

            /**
             * we will collect teams's information from modal.
             * here is a sample of the teams data structure.
             *   teams: [
             *       {name: "home team",
             *        players: [
             *            {name: "name one", number: 7},
             *            {name: "name two", number: 12},
             *        ]
             *       },
             *       {name: "guest team",
             *        players: [
             *            {name: "name seven", number: 15},
             *            {name: "name eight", number: 9}
             *        ]
             *       }
             *   ],
             */
            teams: [],

            /**
             * players will be set from selected team.
             * the data structure will like following.
             *   players: [
             *       {name: "name three", number: 23},
             *       {name: "name fore", number: 24},
             *   ],
             */
            players: [],

            /**
             * palyer or team actions
             * actions: [
             *     // team action.
             *     {name: "Timeout"},
             *     // player actions
             *     {name: "Shoot"},
             *     {name: "Free Throw"},
             *     {name: "Defense Rebound"},
             *     {name: "Offense Rebound"},
             *     {name: "Assistance"},
             *     {name: "Foe"}
             * ]
             */
            actions: [],

            // points for shoot or free throw action.
            // points will be just 0, 1, 2, 3
            points: [],

            // value for tracking message.
            tracking: {
                team: '',
                player: '',
                action: '',
                point: ''
            },

            /**
             * team break down by actions
             * teamActions: [
             *     {Action:"Foe", "Team One":2, "Team Two":3},
             *     {Action:"Shoot", "Team One":9, "Team Two":15},
             *     {Action:"Score", "Team One":9, "Team Two":15},
             *     {Action:"Free Throw", "Team One":3, "Team Two":2}
             * ]
             */
            teamActions: {"items":[], "fields":[]},

            /**
             * player statistics.
             *
             * player stats will have the following data structure:
             *
             * {"team home": [
             *    {"player":2, "score":0, "shoot":3, "free throw":1, "foe":1},
             *    {"player":3, "score":1, "shoot":3, "free throw":2, "foe":0}
             *  ],
             *  "team guest": [
             *    {"player":12, "score":0, "shoot":3, "free throw":1, "foe":2},
             *    {"player":23, "score":1, "shoot":3, "free throw":2, "foe":1}
             *  ]
             * }
             */
            playerStats: {},

            /**
             * fields for player stats.
             */
            playerStatsFields: [
               {key:"Player"},
               {key:"Score"},
               {key:"Foe", variant: "danger"},
               {key:"Shoot"},
               {key:"Free Throw"}
            ],

            /**
             * bar actions for d3 bar chart.
             * [{Action:"Score", "teame one":25, "team two":32},
             *  {...}]
             *
             * NOTE: in D3, data is prefered to be in Array
             */
            barActions: [],

            /**
             * periods for report, some of them are not actual periods.
             */
            reportPeriods: ["Final", "1", "2",
                            "1st", "3", "4", "2nd"],

            /**
             */
            chartId: 'no-id'
        }
    },

    computed: {

        /**
         * tracking message
         */
        trackingMessage() {

             let messages = Object.values(this.tracking);
             return messages.filter(msg => msg.length > 0).join(", ");
        },

        /**
         * show or hide points gorup.
         */
        showPoints() {
            return ['Shoot','Free Throw'].includes(this.tracking.action);
        }
    },

    methods: {


        /**
         * show gameSetting modal.
         */
        showGameSettings(action) {

            var vm = this;

            // action could be new or udpate.
            if(action === "new") {
                vm.modalAction = "new";

                // reset the gameId! we will create a new game.
                vm.modalHomeTeam = '';
                vm.modalHomePlayers = "";
                vm.modalGuestTeam = "";
                vm.modalGuestPlayers = "";

                vm.$refs.gameSettings.show();
            }
            if(action === "update") {

                vm.modalAction = "update";

                // set game information based on gameId.
                vm.modalHomeTeam = vm.teams[0].name;
                // only pick the number to show and edit.
                vm.modalHomePlayers =
                    (vm.teams[0].players.map(player => player.number)).join(",");
                vm.modalGuestTeam = vm.teams[1].name;
                vm.modalGuestPlayers =
                    (vm.teams[1].players.map(player => player.number)).join(",");

                vm.$refs.gameSettings.show();
            }
        },

        /**
         * set Game.
         */
        setGame() {

            var vm = this;

            //console.log(this.modalHomeTeam);
            if(vm.teams.length <= 0) {
                // initialize the team.
                vm.teams = [];
            } else {
                // pop out existing teams.
                // Array pop and push will be detected by Vue.
                // https://vuejs.org/v2/guide/list.html#Array-Change-Detection
                vm.teams.pop();
                vm.teams.pop();
            }

            // update team information.
            vm.teams.push({
                name: vm.modalHomeTeam,
                players: vm.modalHomePlayers.split(",").map(player => {
                    return {number: player};
                })
            });
            vm.teams.push({
                name: vm.modalGuestTeam,
                players: vm.modalGuestPlayers.split(",").map(player => {
                    return {number: player};
                })
            });

            this.tracking.team = "";

            // TODO: we will need save the game informtion.
            //  * data structure for game information.
            //  * what is the unique identity for a game?
            //  * construct the game_id as 20181023-15-pratice-home-vs-guest
            this.solrPost(this.restBaseUrl, this.buildGameInfo());
            // TODO: store the game id on the page.
            //  * query to find the game id.
            //  * if we construct the game_id, we don't need query again!
            // the game id will be used to update game information and load
            // load the game afterward.
        },

        /**
         * show recent games.
         */
        selectGame(action) {

            let vm = this;

            switch(action) {
            case "focus":
                var query = {
                    query: "*:*",
                    params: {
                      sort: "created desc",
                      rows: 8,
                      start: 0,
                      fq: ["table:gameinfo"]
                    }
                };
                vm.solrQuery(vm.restBaseUrl, query, function(games) {
                  vm.filtered = games.map(game => {
                      return {
                        id: game.id,
                        title: game.home_team + " VS. " + game.guest_team,
                        body: game.created + " | " + game.game_league + " | " +
                              game.gender_group + " | " + game.age_group
                      };
                  });
                });
                /**
                 * data structure will like the following:
                 * [
                 *     {id:'abc', title:"Game One", body:"The first game"},
                 *     {id:'cde', title:"Game two", body:"The 2nd game"}
                 * ];
                 */
                break;
            default:
                this.filtered = [];
                break;
            }
        },

        /**
         * load game informtion for an existing game.
         */
        loadGame(gameId) {

            let vm = this;
            vm.gameId = gameId;

            var query = {query: "id:" + gameId};
            // search the game infomation
            vm.solrQuery(vm.restBaseUrl, query, function(docs) {

                var theGame = docs[0];

                // keep the created time.
                vm.gameCreated = theGame.created;

                if(vm.teams.length <= 0) {
                    vm.teams = [];
                } else {
                    vm.teams.pop();
                    vm.teams.pop();
                }
                // Home team.
                vm.teams.push({
                    name: theGame.home_team,
                    players: theGame["home_players.number"].map(player => {
                        return {"number": player};
                    })
                });
                // Guest team.
                vm.teams.push({
                    name: theGame.guest_team,
                    players: theGame["guest_players.number"].map(player => {
                        return {"number": player};
                    })
                });

                // reset tracking message.
                vm.tracking.team = "";

                // reload reports.
                vm.loadReports();
            });
        },

        /**
         * get the ready the payload for game information.
         */
        buildGameInfo() {

            var vm = this;

            // TODO: set game modal should have all these information
            var gameLeague = "pratice";
            var ageGroup = "u13";
            var genderGroup = "girls";
            var homeTeam = vm.teams[0].name;
            var guestTeam = vm.teams[1].name;

            // construct the game_id for new game only.
            // the existing game should already have the game id.
            if(vm.modalAction === "new") {
                // the ISO string will be like this: 2018-10-23T14:35:09.879Z
                var isoDate = (new Date()).toISOString();
                // we only using the year-month-dayThour:minutes.
                isoDate = isoDate.substring(0, isoDate.lastIndexOf(":"));
                // md5 only take strings.
                // we could use all string or using JSON.stringfy
                vm.gameId = md5(isoDate + gameLeague + ageGroup + genderGroup +
                                 homeTeam + guestTeam);
                // set the game created time to null.
                // so the default value will be used, which is NOW.
                vm.gameCreated = null;
            }

            return {
                id: vm.gameId,
                created: vm.gameCreated,
                table: "gameinfo",
                gender_group: genderGroup, // boys, men, women
                age_group: ageGroup,
                game_league: gameLeague,
                home_team: vm.teams[0].name,
                home_players: vm.teams[0].players,
                guest_team: vm.teams[1].name,
                guest_players: vm.teams[1].players,
            };
        },

        /**
         * set team.
         */
        setTeam(teamName, index) {

            this.tracking.team = teamName;
            this.players = this.teams[index].players;
            // there is only one team action for now.
            this.actions = [{name:"Timeout"}]
        },

        /**
         * set action.
         */
        setAction(actionName) {

            this.tracking.action = actionName;
            switch(actionName) {
            case 'Shoot':
                this.points = [0,2,3];
                break;
            case 'Free Throw':
                this.points = [0,1];
                break;
            default:
                this.points = [];
                break;
            }
        },

        /**
         * set action.
         */
        setPlayer(playerNumber) {

            this.tracking.player = playerNumber + "";
            // set palyer actions
            this.actions = [
                // player actions
                {name: "Shoot"},
                {name: "Free Throw"},
                {name: "Rebound"},
                //{name: "Defense Rebound"},
                //{name: "Offense Rebound"},
                //{name: "Assistance"},
                {name: "Foe"}
            ];
        },

        /**
         * set point.
         */
        setPoint(point) {

            if(this.tracking.action === "Free Throw") {

                if(this.tracking.point.length > 0) {
                    this.tracking.point = this.tracking.point + ".." + point;
                } else {
                    this.tracking.point = point + "";
                }
            } else {
                this.tracking.point = point + "";
            }
        },

        /**
         * get the ready the payload for game action.
         */
        buildGameAction() {

            var vm = this;

            // clone the tracking information.
            let action = Object.assign({}, vm.tracking);

            var thePoint = action.point;
            var score = 0;
            // calculate the score.
            if(thePoint.length < 1) {
                score = 0;
            } else if(thePoint.length == 1) {
                score = parseInt(thePoint);
            } else {
                // length > 1.
                const scores = thePoint.split("..").map(n => parseInt(n));
                const reducer = (accumulator, currentValue) => accumulator + currentValue;
                score = scores.reduce(reducer);
            }
            console.log("score=" + score);

            return Object.assign(action,
            {
                score: score,
                period: vm.period,
                game_id: vm.gameId,
                table: "gameaction"
            });

        },

        /**
         * send the tracking message and reset board.
         */
        send() {

            var vm = this;

            // TODO: send tracking message to server.
            //  * what is the data structure?
            //  * calculate the score before send the message.
            vm.solrPost(vm.restBaseUrl, vm.buildGameAction());

            // reset board.
            vm.actions = [];
            // seset the tracking message.
            Object.keys(vm.tracking).forEach(function(item) {
                vm.tracking[item] = "";
            });
        },

        /**
         * utility method to post payload to Solr server.
         */
        solrPost(baseUrl, payload, callback) {

            var vm = this;

            // get read the endpoint for update.
            var endPoint = baseUrl + "update/json/docs?commit=true";
            //var endPoint = baseUrl + "update/json/docs?softCommit=true&maxTime=1000";
            axios.post(endPoint, payload).then(function(response) {

                // success...
                console.log(response);
                // assume, we will reload the reports after each post.
                vm.loadReports();
                // call the callback function.
                callback();
            })
            .catch(function(error) {
                // error ...
            });
        },

        /**
         * load reports.
         */
        loadReports(timeRange) {

            // clean the page!
            this.teamActions = [];
            // execute pivot search only if we have game created or loaded.
            if(!(this.gameId === null)) {
                // construct the query string.
                var query = "";
                switch(timeRange) {
                    case 'Final':
                        // query everything for final.
                        query = "*:*";
                        break;
                    case '1':
                        query = 'period:"Period 1"';
                        break;
                    case '2':
                        query = 'period:"Period 2"';
                        break;
                    case '1st':
                        query = 'period:"Period 1" OR period:"Period 2"';
                        break;
                    case '3':
                        query = 'period:"Period 3"';
                        break;
                    case '4':
                        query = 'period:"Period 4"';
                        break;
                    case '2nd':
                        query = 'period:"Period 3" OR period:"Period 4"';
                        break;
                    default:
                        // query everything for final.
                        query = "*:*";
                        break;
                }

                this.solrPivotSearch(this.restBaseUrl, query);
            }
        },

        /**
         * load players stats for each team.
         * player stats will have the following data structure:
         *
         * {"team home": [
         *    {"player":2, "score":0, "shoot":3, "free throw":1, "foe":1},
         *    {"player":3, "score":1, "shoot":3, "free throw":2, "foe":0}
         *  ],
         *  "team guest": [
         *    {"player":12, "score":0, "shoot":3, "free throw":1, "foe":2},
         *    {"player":23, "score":1, "shoot":3, "free throw":2, "foe":1}
         *  ]
         * }
         */
        loadPlayerStats(teamPlayerActionScore) {

            var vm = this;
            // reset the play stats.
            vm.playerStats = {};

            // TODO: get teams from the vm.teams
            // teams should after game loaded or created.
            teamPlayerActionScore.forEach(function(teamPivot) {

                // initialize the team, create the empty array
                vm.playerStats[teamPivot.value] = [];
                // go through each player pivot.
                teamPivot.pivot.forEach(function(playerPivot) {

                    // one row for each player,
                    // which will have all actions.
                    var playerActions = {"Player": playerPivot.value};
                    // initialize the player score.
                    var playerScores = 0;
                    // now the action pivot, go through each action.
                    playerPivot.pivot.forEach(function(actionPivot) {

                        playerActions[actionPivot.value] = actionPivot.count;
                        // how to get the scores for action: Shoot and Free Throw
                        if(["Shoot", "Free Throw"].includes(actionPivot.value)) {
                            actionPivot.pivot.forEach(function(scorePivot) {

                                playerScores += scorePivot.value * scorePivot.count;
                            });
                        }
                    });

                    // add totoal scores.
                    playerActions["Score"] = playerScores;

                    // push to player stats.
                    vm.playerStats[teamPivot.value].push(playerActions);
                });
            });

            console.log(vm.playerStats);
        },

        //=========================================
        // D3 functions.
        // using this observable page as playground:
        //=========================================

        /**
         * draw side by side bars for the game statistics.
         */
        drawSideBySideBars() {

            var vm = this;

            //console.log("D3 Version Again: " + d3.version);
            // calculate the dimension for bar chart.
            // ${} only works indide ``
            var divId = `#${vm.chartId}`;
            //var divId = "#chartId";
            //console.log(d3.select(divId));
            var divWidth = parseInt(d3.select(divId).style("width"));
            var margin = {top: 1, right: 2, bottom: 20, left: 2}
            //var margin = {top: 20, right: 0, bottom: 30, left: 40}
            var width = divWidth - margin.left - margin.right;
            var height = 250 - margin.top - margin.bottom;
            console.log(`width = ${width}`);

            /**
             * the data will have format
             */

            var width = 400
            var height = 400
            var labelArea = 120
            var cols = Object.keys(vm.barActions[0])
            var labelCol = cols[0]
            //var lCol = "infant.mortality"
            var lCol = cols[1]
            //var rCol = "gdp"
            var rCol = cols[2]
            var rightOffset = width + labelArea
            var xDomain = vm.barActions.map(d => d.Action)
            var color = d3.scaleOrdinal(d3.schemePaired)
              .domain(xDomain)

            // get the max score to scale bar width.
            var maxX = Math.max(vm.barActions[0][vm.teams[0].name],
                                vm.barActions[0][vm.teams[1].name]);
            // left side
            var xFrom = d3.scaleLinear()
                .domain([1, maxX + 5])
                .range([0, width])
            // right side
            var xTo = d3.scaleLinear()
                .domain([1, maxX + 5])
                .range([0, width])

            // set y
            var y = d3.scaleBand()
                .domain(xDomain)
                .range([margin.top, height - margin.bottom])
                .padding(0.2)

            // pos.
            var yPosByIndex = d => {
                    return y(d.Action)
            }

            // remove the existing one first.
            d3.select(divId).html("");
            // append the svg to get started.
            var svg = d3.select(divId).append("svg")
                .attr("class", "card-img-top")
                .attr("width", labelArea + width + width)
                .attr("height", height)
            // TODO: add the responsive call.

            svg.selectAll("rect.left")
                .data(vm.barActions)
                .enter().append("rect")
                .attr("x", function (d) {
                    return width - xFrom(d[lCol]);
                })
                .attr("y", yPosByIndex)
                .attr("class", "left")
                .attr("width", function (d) {
                    return xFrom(d[lCol]);
                })
                .attr("height", y.bandwidth())
                .attr("fill", function(d) {return color(d[labelCol])})

            svg.selectAll("text.leftscore")
                .data(vm.barActions)
                .enter().append("text")
                .attr("x", function (d) {
                    return width - xFrom(d[lCol])-40;
                })
                .attr("y", function (d) {
                    return y(d[labelCol]) + y.bandwidth() / 2;
                })
                .attr("dx", "20")
                .attr("dy", ".36em")
                .attr("text-anchor", "end")
                .attr('class', 'leftscore')
                .text(function(d){return d[lCol];});

            svg.selectAll("text.name")
                .data(vm.barActions)
                .enter().append("text")
                .attr("x", (labelArea / 2) + width)
                .attr("y", function (d) {
                    return y(d[labelCol]) + y.bandwidth() / 2;
                })
                .attr("dy", ".20em")
                .attr("text-anchor", "middle")
                .attr('class', 'name')
                .text(function(d){return d[labelCol];});

            svg.selectAll("rect.right")
                .data(vm.barActions)
                .enter().append("rect")
                .attr("x", rightOffset)
                .attr("y", yPosByIndex)
                .attr("class", "right")
                .attr("width", function (d) {
                    return xTo(d[rCol]);
                })
                .attr("height", y.bandwidth())
                .attr("fill", function(d) {return color(d[labelCol])})

            svg.selectAll("text.score")
                .data(vm.barActions)
                .enter().append("text")
                .attr("x", function (d) {
                    return xTo(d[rCol]) + rightOffset+40;
                })
                .attr("y", function (d) {
                    return y(d[labelCol]) + y.bandwidth() / 2;
                })
                .attr("dx", -5)
                .attr("dy", ".36em")
                .attr("text-anchor", "end")
                .attr('class', 'score')
                .text(function(d){return d[rCol];});

            svg.append("text").attr("x",width/3).attr("y", 10).attr("class","title").text(lCol);
            svg.append("text").attr("x",width/3+rightOffset).attr("y", 10).attr("class","title").text(rCol);
            svg.append("text").attr("x",width+labelArea/3).attr("y", 10).attr("class","title").text(labelCol);

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
                  "team,score",
                  "action,team",
                  "team,player,action,score"
                ],
                "fq": [
                  //"table:gameaction",
                  "game_id:" + vm.gameId
                  //"game_id:430a92ae677ecb17469452aadfceaba8"
                ]
              }
            };

            var fields = [
              {key: "Action", variant: "success"},
              vm.teams[0].name,
              {key: vm.teams[1].name, variant: "info"}];

            // we have to use post for pivot faceting
            axios.post(endPoint, payload).then(function(response) {

                let pivot = response.data.facet_counts.facet_pivot;
                console.log(pivot);

                var actions = [];
                // TODO: update the team actions.
                pivot['action,team'].forEach(function(actionPivot) {
                    // get action name.
                    var actionName = actionPivot['value'];
                    // iterate action pivots.
                    var teams = [];
                    actionPivot.pivot.forEach(function(team) {
                        var oneItem = {};
                        oneItem[team.value] = team.count;
                        teams.push(oneItem);
                    });

                    actions.push(
                      Object.assign({Action: actionName}, teams[0], teams[1])
                    );
                });

                // sort by action name.
                actions.sort(function(a, b) {
                    var nameA = a.Action.toUpperCase(); // ignore upper and lowercase
                    var nameB = b.Action.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }

                    // names must be equal
                    return 0;
                });

                // calculate the score.
                var scoreAction = {"Action": "Score"};
                pivot['team,score'].forEach(function(scorePivot) {
                    var teamName = scorePivot['value'];
                    scoreAction[teamName] = 0;
                    scorePivot.pivot.forEach(function(score) {
                        scoreAction[teamName] += score.value * score.count;
                    });
                });
                actions.unshift(scoreAction);
                //console.log(actions);

                // teamActions will serve the table view for the team.
                // it will use the structure for Bootstrap-Vue table component.
                vm.teamActions = {"items": actions, "fields": fields};
                // the barActions will serve the side by side bar chart.
                vm.barActions = actions;
                // TODO: players break down table for each team.
                vm.loadPlayerStats(pivot['team,player,action,score']);

                // reload chart!
                vm.drawSideBySideBars();
            })
            .catch(function(error) {
            });
        },

        /**
         * generl search function.
         */
        solrQuery(baseUrl, query, callback) {

            let vm = this;

            var endPoint = baseUrl + "select";
            axios.post(endPoint, query).
            then(function(response) {
                // return an array of docs
                callback(response.data.response.docs);
            })
            .catch(function(error) {
                // TODO: error handling.
                callback([]);
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

        // reset gameId.
        this.gameId = null;

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
