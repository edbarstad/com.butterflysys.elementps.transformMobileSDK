
var EPSDevice = {
  initialize: function() {
    console.log('Initializing EPSDevice...');
  },

  onConnected: function() {
    console.log('EPSDevice.onConnected...');
  },

  onDisconnected: function() {
    console.log('EPSDevice.onDisconnected....')
  }
};

mobile.exports = EPSDevice;
