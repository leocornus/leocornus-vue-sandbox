<template>
<div class="content container">
  <div id="game-app">
    <b-input-group class="mb-2">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Teams: </span>
      </b-input-group-append>
      <b-button variant="outline-primary" v-for="(team, index) in teams"
                v-on:click="setTeam(team.name)" :key="'team-' + index">
        {{team.name}}
      </b-button>
    </b-input-group>
    <b-input-group class="mb-2">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Players: </span>
      </b-input-group-append>
      <b-button variant="outline-warning" v-for="(player, index) in players"
                v-on:click="setPlayer(player.number)" :key="'player-' + index">
        {{player.number}}
      </b-button>
    </b-input-group>
    <b-input-group class="mb-2">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Actions: </span>
      </b-input-group-append>
      <b-button variant="outline-primary" v-for="(action, index) in actions"
                v-on:click="setAction(action.name)" :key="'action-' + index">
        {{action.name}}
      </b-button>
    </b-input-group>
    <b-input-group class="mb-2">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Points: </span>
      </b-input-group-append>
      <b-button variant="outline-success" v-for="point in [0,1,2,3]"
                v-on:click="setPoint(point)" :key="'point-' + point">
        {{point}}
      </b-button>
    </b-input-group>
    <b-input-group class="mb-2">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Tracking: </span>
      </b-input-group-append>
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text strong text-warning">
          {{trackingMessage}}
        </span>
      </b-input-group-append>
      <b-button variant="outline-primary">Submit</b-button>
    </b-input-group>
  </div>
</div>
</template>

<script>

export default {

    components: {
    },

    data() {
        return {
            name: "gameboard",

            // TODO: we will collect teams's information from
            // modal.
            teams: [
                {name: "home team"},
                {name: "guest team"}
            ],

            // players.
            players: [
                {name: "name one", number: 7},
                {name: "name two", number: 12},
                {name: "name three", number: 23},
                {name: "name fore", number: 24},
                {name: "name five", number: 3},
                {name: "name six", number: 82},
                {name: "name seven", number: 15},
                {name: "name eight", number: 9}
            ],

            // palyer or team actions
            actions: [
                {name: "Shoot"},
                {name: "Free Shoot"},
                {name: "Defense Rebound"},
                {name: "Offense Rebound"},
                {name: "Assistance"},
                {name: "Foe"}
            ],

            // points will be just 0, 1, 2, 3

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

             return Object.values(this.tracking).join(", ");
        }
    },

    methods: {

        /**
         * set team.
         */
        setTeam(teamName) {

            this.tracking.team = teamName;
        },

        /**
         * set action.
         */
        setAction(actionName) {

            this.tracking.action = actionName;
        },

        /**
         * set action.
         */
        setPlayer(playerNumber) {

            this.tracking.player = playerNumber;
        },

        /**
         * set point.
         */
        setPoint(point) {

            if(this.tracking.action === "Free Shoot") {

                if(this.tracking.point.length > 0) {
                    this.tracking.point = this.tracking.point + ".." + point;
                } else {
                    this.tracking.point = point + "";
                }
            } else {
                this.tracking.point = point + "";
            }
        }
    }
}
</script>
