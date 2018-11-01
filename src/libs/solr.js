
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
     * introduce new parameters comment and tags.
     * set the default value to empty string and empty array
     */
    track: function(payload, comment="", tags=[]) {

        // preparing the track payload.
        var tPayload = this.trackPayload(payload, comment, tags);

        // TODO: query the count first. if we could not find anything,
        // count will be 0
        // we will need the parameter commit = true.
        var endPoint = this.config.trackingBaseUrl + 
                       "update/json/docs?commit=true";
        // the endpoint for query.
        var searchApi = this.config.trackingBaseUrl + "select";

        // an solr qurery to get the count.
        axios.post(searchApi, {"query":"id:" + tPayload.id})
        .then(function(response) {
            // the default value is 0, no such tracking yet!
            var count = 0;
            // we will try to keep the history comment!
            var existingComment = "";
            var docs = response.data.response.docs;
            console.log(docs);
            // no docs, set count to 0
            if(docs.length > 0) {
                // One doc,
                if(docs[0].hasOwnProperty('count')) {
                    //  has count value. get the value
                    //  has NO count value, use 0
                    count = docs[0].count[0];
                }
                // work on the comment.
                if(docs[0].hasOwnProperty('comment')) {
                    existingComment = docs[0].comment;
                }
            }

            // update payload
            // -- increase count.
            tPayload["count"] = count + 1;
            // -- append comment,
            if (existingComment === comment) {
                // do nothing here!
            } else {
                // append the new comment.
                tPayload["comment"] = (existingComment + " " + comment).trim();
            }
            //console.log(tPayload);

            axios.post(endPoint, tPayload).then(function(response) {

                // what we do if success?
                console.log(response);
            })
            .catch(function(error) {

                // still need return normally even it's failed to track.
                console.log(error);
            });
        })
        .catch(function(error) {
            console.log(error);
        });

    },

    /**
     * preparing the tracking payload
     */
    trackPayload: function(input, comment, tags) {

        // store the input as string, using stringify function.
        var rawContent = JSON.stringify(input);
        // generate the MD5 has for the raw content.
        var md5Hash = md5(rawContent);

        // find the first slash (/) in the full URL.
        // the 10 comes from prototal and // for example https://some.com
        var firstSlash = input.end_point.indexOf("/", 10);

        // TODO: assume we are working on query payload.
        var thePayload = {
          // using the MD5 hash as the id
          id : md5Hash,
          table : "tracking",
          comment : comment,
          tags: tags,
          content : rawContent,
          rest_domain: input.end_point.substring(0,firstSlash),
          rest_path: input.end_point.substring(firstSlash),
          // load the original query string.
          query : input.query,
          params : input.params
        };

        return thePayload;
    }

}

export default solr;
