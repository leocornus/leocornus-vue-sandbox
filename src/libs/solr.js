
import axios from 'axios'
import md5 from 'md5'

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

        var rawContent = JSON.stringify(input);
        // generate the MD5 has for the raw content.
        var md5Hash = md5(rawContent);

        // TODO: query the count first. if we could not find anything,
        // count will be 0
        var theCount = this.getTrackingCount(md5Hash);
        console.log("count = " + theCount);

        // TODO: assume we are working on query payload.
        var thePayload = {
          // using the MD5 hash as the id
          id : md5Hash,
          count : theCount + 1,
          table : "tracking",
          content : rawContent,
          // load the original query string.
          query: input.query,
          params: input.params
        };

        return thePayload;
    },

    /**
     * return the count for this tracking..
     * which will tell how many times this behavior has been executed.
     */
    getTrackingCount: function(theHash) {

        var searchApi = this.config.trackingBaseUrl + "select";
        // the default value is 0, no such tracking yet!
        var count = 0;

        // an solr qurery to get the count.
        axios.post(searchApi, {"query":"id:" + theHash})
        .then(function(response) {
             var docs = response.data.response.docs;
             console.log("docs");
             console.log(docs);
             count = docs[0].count[0];
             return count;
        })
        .catch(function(error) {
            console.log(error);
            return count;
        });

    }
}

export default solr;
