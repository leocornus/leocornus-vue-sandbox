<template>
<div class="content container">
  <div id="game-app">
    <b-input-group class="mb-2">
      <b-button variait="primary" v-b-modal.game-settings>Game Settings</b-button>
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
    <b-input-group class="mb-2" v-if="tracking.player > 0">
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
      <b-button variant="outline-success" v-for="point in [0,1,2,3]"
                v-on:click="setPoint(point)" :key="'point-' + point">
        {{point}}
      </b-button>
    </b-input-group>
    <b-input-group class="mb-2" size="lg">
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text">Tracking: </span>
      </b-input-group-append>
      <b-input-group-append>
        <span id="restBaseUrl-addon" class="input-group-text text-danger">
          {{trackingMessage}}
        </span>
      </b-input-group-append>
      <b-button variant="outline-primary">Submit</b-button>
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

export default {

    components: {
    },

    data() {
        return {
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

            // palyer or team actions
            actions: [
                {name: "Shoot"},
                {name: "Free Throw"},
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

            //console.log(this.modalHomeTeam);
            if(this.teams.length <= 0) {
                // initialize the team.
                this.teams = [{}, {}];
            }

            // update team information.
            this.teams[0].name = this.modalHomeTeam;
            this.teams[0].players = this.modalHomePlayers.split(",").map(player => {
                return {number: player};
            });
            this.teams[1].name = this.modalGuestTeam;
            this.teams[1].players = this.modalGuestPlayers.split(",").map(player => {
                return {number: player};
            });

            this.tracking.team = "";

            // TODO: we will need save the game informtion.
            // TODO: store the game id on the page.
            // the game id will be used to update game information and load
            // load the game afterward.
        },

        /**
         * set team.
         */
        setTeam(teamName, index) {

            this.tracking.team = teamName;
            this.players = this.teams[index].players;
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

            if(this.tracking.action === "Free Throw") {

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
