
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
        baseUrl: "https://solr.example.com/solr/core_one/"
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
    }
}

export default solr;
