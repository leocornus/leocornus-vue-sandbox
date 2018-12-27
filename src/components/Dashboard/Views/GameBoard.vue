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

    <b-row class="mb-2" v-if="teams.length > 0">
      <b-col></b-col>
      <b-col>
        <b-form-select class="form-control"
            aria-describedby="period-addon"
            v-model="period" :options="['Period 1','Period 2','Period 3','Period 4']">
        </b-form-select>
      </b-col>
      <b-col></b-col>
    </b-row>

    <b-row class="mb-2" v-if="teams.length > 0">
      <b-col class="text-center">
        <b-button variant="primary"
                  v-on:click="setTeam(teams[0].name, 0)">
          {{teams[0].name}}
        </b-button>
      </b-col>
      <b-col class="text-center">
        <b-button variant="primary"
                  v-on:click="setTeam(teams[1].name, 1)">
          {{teams[1].name}}
        </b-button>
      </b-col>
    </b-row>

    <b-row class="mb-2" v-if="tracking.team.length > 0">
    <b-col :class="trackingButtonClass">
      <b-button v-for="(player, index) in players" :key="'player-' + index"
                class="btn btn-warning btn-lg btn-circle mr-2"
                v-on:click="setPlayer(player.number)" >
        <strong>{{player.number}}</strong>
      </b-button>
    </b-col></b-row>

    <b-row v-if="actions.length > 0" class="mb-2">
    <b-col :class="trackingButtonClass">
      <b-button variant="outline-primary" v-for="(action, index) in actions"
                class="mr-2"
                v-on:click="setAction(action.name)" :key="'action-' + index">
        {{action.name}}
      </b-button>
    </b-col></b-row>

    <b-row class="mb-2"
           v-if="this.isShootAction(this.tracking.action)">
    <b-col :class="trackingButtonClass">
      <b-button variant="outline-success" v-for="point in points"
                class="btn btn-info btn-circle mr-2"
                v-on:click="setPoint(point)" :key="'point-' + point">
        {{point}}
      </b-button>
    </b-col></b-row>

    <b-row class="mb-2" size="lg" v-if="tracking.team.length > 0">
      <b-col>
        <b-button class="btn btn-success btn-circle" size="lg" v-on:click="send">Go</b-button>
        <b-button class="btn btn-danger btn-circle" size="lg" v-on:click="reset">X</b-button>
      </b-col>
      <b-col cols="6" class="text-center">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text text-danger">
          {{trackingMessage}}
        </span>
      </b-input-group-append>
      </b-col>
      <b-col class="text-right">
        <b-button class="btn btn-danger btn-circle" size="lg" v-on:click="reset">X</b-button>
        <b-button class="btn btn-success btn-circle" size="lg" v-on:click="send">Go</b-button>
      </b-col>
    </b-row>
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
                class="mr-2"
                v-on:click="loadReports(rp)" :key="'rp-' + index">
              {{rp}}
            </b-button>
          </b-input-group>
        </template>
        <h3 class="text-center mt-0 mb-2">{{gameStatsTitle}}</h3>
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
          <b-tab name="tracking">
            <template slot="title">
              <font-awesome-icon icon="align-justify" size="lg"/>
            </template>
            <!-- stats in table format for each team. -->
            <b-table striped :items="messages" :fields="messageFields"></b-table>
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
             *     {name: "Foul"}
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
             *     {Action:"Foul", "Team One":2, "Team Two":3},
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
             *    {"player":2, "score":0, "shoot":3, "free throw":1, "foul":1},
             *    {"player":3, "score":1, "shoot":3, "free throw":2, "foul":0}
             *  ],
             *  "team guest": [
             *    {"player":12, "score":0, "shoot":3, "free throw":1, "foul":2},
             *    {"player":23, "score":1, "shoot":3, "free throw":2, "foul":1}
             *  ]
             * }
             */
            playerStats: {},

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
             * tracking messages are array of objects.
             * [
             *   {team: "team one", player: "23", action: "3Point Shoot", point:"3"},
             *   {team: "team one", player: "23", action: "Rebound", point:""}
             * ]
             */
            messages: [],

            /**
             * message fiels.
             */
            messageFields: [
                {key: "team"},
                {key: "player"},
                {key: "action"},
                {key: "point"}
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
            return this.isShootAction(this.tracking.action);
        },

        /**
         */
        trackingButtonClass() {

            var align = "text-left";

            if(this.tracking.team === this.teams[1].name) {
                align = "text-right";
            }

            var ret = {};
            ret[align] = true;

            return align;
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
            this.tracking.teamIndex = index;
            this.players = this.teams[index].players;
            // there is only one team action for now.
            this.actions = [{name:"Timeout"}];
        },

        /**
         * set action.
         */
        setAction(actionName) {

            this.tracking.action = actionName;

            switch(actionName) {
            case '2P Shoot':
                this.points = [0,2];
                // wait the input for points.
                break;
            case '3P Shoot':
                this.points = [0,3];
                // wait the input for points.
                break;
            case 'Free Throw':
                this.points = [0,1];
                // wait the input for points
                break;
            default:
                // send the tracking informaion.
                this.solrPost(this.restBaseUrl,
                              this.buildGameAction());
                // no need for points.
                this.points = [];
                // reset actions list.
                this.actions = [{name:"Timeout"}];
                break;
            }
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
         * set action.
         */
        setPlayer(playerNumber) {

            this.tracking.player = playerNumber + "";
            // set palyer actions
            this.actions = [
                // player actions
                {name: "2P Shoot"},
                {name: "3P Shoot"},
                {name: "Free Throw"},
                {name: "Rebound"},
                //{name: "Defense Rebound"},
                //{name: "Offense Rebound"},
                {name: "Assist"},
                {name: "Steal"},
                {name: "Foul"}
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

            // send the tracking informaion.
            this.solrPost(this.restBaseUrl,
                          this.buildGameAction());
            // no need for points.
            this.points = [];
            // reset actions list.
            this.actions = [{name:"Timeout"}];
        },

        /**
         * get the ready the payload for game action.
         */
        buildGameAction() {

            var vm = this;

            // clone the tracking information.
            let action = Object.assign({}, vm.tracking);
            // add to messages.
            // NOTE: we need clone the object first.
            vm.messages.unshift(Object.assign({}, vm.tracking));
            // reset the tracking message.
            Object.keys(vm.tracking).forEach(function(item) {
                vm.tracking[item] = "";
            });
            // set the current team for convenient!
            vm.tracking.team = action.team;

            // remove the team index.
            delete action.teamIndex;

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
         * reset board.
         */
        reset() {

            var vm = this;

            // reset board.
            vm.actions = [];
            // seset the tracking message.
            Object.keys(vm.tracking).forEach(function(item) {
                vm.tracking[item] = "";
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
        loadReports(timeRange='Final') {

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
                        this.gameStatsTitle = "Final Game";
                        break;
                    case '1':
                        query = 'period:"Period 1"';
                        this.gameStatsTitle = "Quarter 1";
                        break;
                    case '2':
                        query = 'period:"Period 2"';
                        this.gameStatsTitle = "Quarter 2";
                        break;
                    case '1st':
                        query = 'period:"Period 1" OR period:"Period 2"';
                        this.gameStatsTitle = "1st Half";
                        break;
                    case '3':
                        query = 'period:"Period 3"';
                        this.gameStatsTitle = "Quarter 3";
                        break;
                    case '4':
                        query = 'period:"Period 4"';
                        this.gameStatsTitle = "Quarter 4";
                        break;
                    case '2nd':
                        query = 'period:"Period 3" OR period:"Period 4"';
                        this.gameStatsTitle = "2nd Half";
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
         * load game stats for each team.
         * it will have the following statistics:
         *
         * [
         *   {"Action": "Score", "Team One": 23, "Team Two": 20},
         *   {"Action": "Shoot", "Team One": 20, "Team Two": 12},
         *   {"Action": "Foul", "Team One": 8, "Team Two": 9}
         * ]
         *
         */
        loadGameStats(actionTeamScore) {

            var vm = this;

            // the score action.
            var scoreAction = {"Action": "Score"};
            // set the initial value.
            scoreAction[vm.teams[0].name] = 0;
            scoreAction[vm.teams[1].name] = 0;

            // all other actions.
            var actions = [];
            // iterate through each action.
            actionTeamScore.forEach(function(actionPivot) {
                // get action name.
                var actionName = actionPivot['value'];
                // go through each team.
                var teams = [];
                actionPivot.pivot.forEach(function(team) {
                    var oneItem = {};
                    // team name and action count.
                    oneItem[team.value] = team.count;
                    if(vm.isShootAction(actionName)) {
                        // go through each score:0, 1, 2, 3
                        // calc made /total attempts
                        let made = 0;
                        team.pivot.forEach(function(score) {
                            // calc the total score.
                            scoreAction[team.value] += score.value * score.count;

                            // count the made ones.
                            if(score.value > 0) {
                                made += score.count;
                            }
                        });
                        oneItem[team.value] = `${made}/${team.count}`;
                    }
                    teams.push(oneItem);
                });

                actions.push(
                    // The first object (arg) will be returned,
                    Object.assign({"Action": actionName}, teams[0], teams[1])
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

            // unshift will add the new item at beginning of the array.
            actions.unshift(scoreAction);
            //console.log(actions);

            return actions;
        },

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
        loadPlayerStats(teamPlayerActionScore) {

            var vm = this;
            // reset the play stats.
            vm.playerStats = {};

            // get teams from the vm.teams
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
                  "action,team,score",
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
              {key: vm.teams[0].name},
              {key: vm.teams[1].name, variant: "info"}];

            // we have to use post for pivot faceting
            axios.post(endPoint, payload).then(function(response) {

                let pivot = response.data.facet_counts.facet_pivot;
                console.log(pivot);

                let actions = vm.loadGameStats(pivot['action,team,score']);
                // teamActions will serve the table view for the team.
                // it will use the structure for Bootstrap-Vue table component.
                vm.teamActions = {"items": actions, "fields": fields};
                // the barActions will serve the side by side bar chart.
                vm.barActions = actions;
                // players break down table for each team.
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
