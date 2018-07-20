
import axios from 'axios'

/**
 * the solr lib, actually the solrclient lib.
 */
var solr = {

    /**
     * the configuration for the solr client.
     */
    config: {
        // the base url to the solr core or collection.
        // make sure we have the ending slash!
        baseUrl: "https://solr.example.com/solr/core_one/",
        // the base url for tracking service.
        trackingBaseUrl: "https://example.com/solr/core_t/"
    },

    /**
     * the ping function will quickly verify the connection.
     */
    ping: function() {
        
        var endPoint = this.config.baseUrl + "admin/ping";
        axios.get(endPoint).then(function(response) {
            // showing the whole reponse.
            console.log(response);

            // response status.
            var status = response.status;
        }).catch(function(error) {
            console.log(error);
        });
    },

    /**
     * track something.
     */
    track: function(payload) {

        // we will need the parameter commit = true.
        var endPoint = this.config.trackingBaseUrl + 
                       "update/json/docs?commit=true";

        // preparing the track payload.
        var tPayload = this.trackPayload(payload);
        axios.post(endPoint, tPayload).then(function(response) {

            // what we do if success?
            console.log(response);
        })
        .catch(function(error) {

            // still need return normally even it's failed to track.
            console.log(error);
        });
    },

    /**
     * preparing the tracking payload
     */
    trackPayload: function(input) {

        // TODO: assume we are working on query payload.
        var thePayload = {
          // using the MD5 hash as the id
          id : "quicktest",
          content: JSON.stringify(input)
        };

        return thePayload;
    }
}

export default solr;
