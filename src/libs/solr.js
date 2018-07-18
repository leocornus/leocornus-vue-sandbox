
import axios from 'axios'

/**
 * the solr lib, actually the solrclient lib.
 */
var solr = {
    /**
     * the configuration for the solr client.
     */
    config: {
        baseUrl: "https://solr.example.com/"
    },

    /**
     * the ping function will quickly verify the connection.
     */
    ping: function() {
        
        var endPoint = this.config.baseUrl + "admin/ping";
        axios.get(endPoint).then(function(response) {
            console.log(response);
        }).catch(function(error) {
            console.log(error);
        });
    }
}

export default solr;
