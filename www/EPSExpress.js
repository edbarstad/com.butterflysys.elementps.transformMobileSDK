
var EPSExpress = {
  initialize: function() {
    console.log('Initializing EPSExpress...');
  },

  onConnected: function() {
    console.log('EPSExpress.onConnected...');
  },

  onDisconnected: function() {
    console.log('EPSExpress.onDisconnected....')
  }
};

module.exports = EPSExpress;
