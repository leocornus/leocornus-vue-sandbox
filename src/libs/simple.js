/**
 * this is a simple java script lib for testing
 *
 * the name here is completly private
 */
var simple = {

    options: {
        base: "testing"
    },

    /**
     * quick test fucntion.
     */
    getSimpleVersion: function() {

        return "Simple Version: " + this.options.base;
    }
};

export default simple;
