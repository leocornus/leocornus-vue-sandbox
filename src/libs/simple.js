var solrsearch = {

    options: {
        base: "testing"
    },

    /**
     * quick test fucntion.
     */
    getSolrVersion: function() {

        return "Solr Version: " + this.options.base;
    }
};

export default solrsearch;
