<template>
<div class="content container">
  <div id="game-app">
    <b-input-group class="mb-2">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Teams: </span>
      </b-input-group-append>
      <b-button variant="outline-primary" v-for="(team, index) in teams"
                v-on:click="setTeam(team.name)">
        {{team.name}}
      </b-button>
    </b-input-group>
    <b-input-group class="mb-2">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Players: </span>
      </b-input-group-append>
      <b-button variant="outline-primary">7</b-button>
      <b-button variant="outline-warning">8</b-button>
      <b-button variant="outline-warning">23</b-button>
      <b-button variant="outline-warning">82</b-button>
      <b-button variant="outline-warning">19</b-button>
      <b-button variant="outline-warning">34</b-button>
      <b-button variant="outline-warning">9</b-button>
      <b-button variant="outline-warning">24</b-button>
    </b-input-group>
    <b-input-group class="mb-2">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Actions: </span>
      </b-input-group-append>
      <b-button variant="outline-primary">Shoot</b-button>
      <b-button variant="outline-primary">Free Shoot</b-button>
      <b-button variant="outline-success">Defense Rebound</b-button>
      <b-button variant="outline-success">Offense Rebound</b-button>
      <b-button variant="outline-success">Assistance</b-button>
      <b-button variant="outline-danger">Foe</b-button>
    </b-input-group>
    <b-input-group class="mb-2">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Points: </span>
      </b-input-group-append>
      <b-button variant="outline-primary">0</b-button>
      <b-button variant="outline-success">1</b-button>
      <b-button variant="outline-success">2</b-button>
      <b-button variant="outline-warning">3</b-button>
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

            teams: [
                {name: "home team"},
                {name: "guest team"}
            ],

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
        }
    }
}
</script>
