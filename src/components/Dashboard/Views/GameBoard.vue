<template>
<div class="content container">
  <div id="game-app">
    <b-input-group class="mb-2">
      <b-button variait="primary" v-b-modal.game-settings>Game Settings</b-button>
      <b-button>Load Game</b-button>
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

  <b-modal id="game-settings" title="Game Settings"
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

import axios from 'axios'
import md5 from 'md5'

export default {

    components: {
    },

    data() {
        return {
            // track the game Id.
            gameId : null,

            name: "gameboard",

            modalHomeTeam: "home",
            modalHomePlayers: "1,2,3,4,5",
            modalGuestTeam: "guest",
            modalGuestPlayers: "1,2,3,4,5",

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
            }
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
         * get the ready the payload for game information.
         */
        buildGameInfo() {

            var vm = this;

            // the ISO string will be like this: 2018-10-23T14:35:09.879Z
            var isoDate = (new Date()).toISOString();
            // we only using the year-month-dayThour.
            isoDate = isoDate.substring(0, isoDate.indexOf(":"));

            // TODO: set game modal should have all these information
            var gameLeague = "pratice";
            var ageGroup = "u13";
            var genderGroup = "girls";
            var homeTeam = vm.teams[0].name;
            var guestTeam = vm.teams[1].name;

            // construct the game_id
            if(vm.gameId === null) {
                // md5 only take strings.
                // we could use all string or using JSON.stringfy
                vm.gameId = md5(isoDate + gameLeague + ageGroup + genderGroup +
                                 homeTeam + guestTeam);
            }

            return {
                id: vm.gameId,
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

            this.tracking.player = playerNumber;
            // set palyer actions
            this.actions = [
                // player actions
                {name: "Shoot"},
                {name: "Free Throw"},
                {name: "Defense Rebound"},
                {name: "Offense Rebound"},
                {name: "Assistance"},
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

            // get read the endpoint for update.
            var endPoint = baseUrl + "update/json/docs?commit=true";
            axios.post(endPoint, payload).then(function(response) {
                // success...
                console.log(response);
                callback();
            })
            .catch(function(error) {
                // error ...
            });
        }
    },

    /**
     * created will be called after Vue mode is created.
     * Vue mode is avaiable now!
     */
    created() {

        // the page settings.
        //console.log(this.pageName);
        this.page = this.$localSettings.solr['gameboard'];

        // set the the default collection, the first colleciton in the list.
        this.restBaseUrl = this.page.restBaseUrl;

        // reset gameId.
        this.gameId = null;
    }
}
</script>
