
var EPSTransformMobile = {

  transactionType: 'Credit',
  transactionInput: 'Swiped',
  transactionAmount: 1234.75.toFixed(2),

  options: {},

  initialize: function(options) {
    try {
      console.log('Initializing EPSDevice...');
      device = new EPS.Device();
      document.addEventListener(EPS.Device.Event.onConnected, EPSTransformMobile.onConnected, false);
      document.addEventListener(EPS.Device.Event.onDisconnected, EPSTransformMobile.onDisconnected, false);
      document.addEventListener(EPS.Device.Event.onCardReaderSwipedInput, EPSTransformMobile.onCardReaderSwipedInput, false);
      document.addEventListener(EPS.Device.Event.onCardReaderError, EPSTransformMobile.onCardReaderError, false);
      document.addEventListener(EPS.Device.Event.onCardReaderCancelEntry, EPSTransformMobile.onCardReaderCancelEntry, false);
      document.addEventListener(EPS.Express.Event.onCompleted, EPSTransformMobile.onProcessComplete, false);
      
      EPSTransformMobile.options = options;
      console.log('Options = ' + JSON.stringify(EPSTransformMobile.options, null, '  '));

      EPS.Device.getInstance().startConnection(function(event)
                                               {
                                               console.log('startConnection->success: ' + event);
                                               },
                                               function(event)
                                               {
                                               console.log('startConnection->error: ' + event);
                                               
                                               alert('ERROR STARTING EPS DEVICE: ' + event);
                                               });
      console.log('Initializion complete.');
    }
    catch (ex)
    {
      console.log('EXCEPTION: ' + ex.message);
      alert('EXCEPTION: ' + ex.message);
    }
  },

  onConnected: function(event) {
    try {
      console.log('EPSDevice.onConnected...');
      console.log('Event =' + JSON.stringify(event, null, '  '));

      if (EPSTransformMobile.options.onConnect !== null)
      {
        console.log('Calling onConnect callback...');
        EPSTransformMobile.options.onConnect();
      }
      else
      {
        EPSTransformMobile.enableCardReader('Please swipe card...');
      }
    }
    catch (ex)
    {
      console.log('EXCEPTION: ' + ex.message);
      EPSTransformMobile.options.onConnect(null, ex.message);
      // alert('EXCEPTION: ' + ex.message);
    }
  },

  onDisconnected: function(event) {
    try 
    {
      console.log('EPSDevice.onDisconnected....')
      console.log('Event =' + JSON.stringify(event, null, '  '));
      if (EPSTransformMobile.options.onDisconnect !== null)
      {
        console.log('Calling onDisconnect callback...');
        EPSTransformMobile.options.onDisconnect();
      }
    }
    catch (ex)
    {
      console.log('EXCEPTION: ' + ex.message);
      // alert('EXCEPTION: ' + ex.message);
      EPSTransformMobile.options.onDisconnect(null, ex.message);
    }
  },

  enableCardReader: function (prompt)
  {
    try
    {
      console.log('enableCardReader: ');

      var enable;
      
      enable = false;
      
      if (!(EPS.Device.getInstance().deviceCapabilities & (EPS.Device.Capability.SwipeCardReader | EPS.Device.Capability.ManualCardEntry | EPS.Device.Capability.ContactlessCardReader)))
      {
        prompt = 'DEVICE DOES NOT SUPPORT CARD INPUT'
          
        console.log('enableCardReader: ' + prompt);
      }
      else if (typeof EPS.Device.getInstance().cardReader === 'undefined')
      {
        prompt = 'CARD READER UNDEFINED';
          
        console.log('enableCardReader: ' + prompt);
      }
      else if (EPS.Device.getInstance().cardReader.enable == undefined)
      {
        prompt = 'CARD READER ENABLE UNDEFINED';
          
        console.log('enableCardReader: ' + prompt);
      }
      else
      {
        enable = true;
      }

      if (enable)
      {
        EPS.Device.getInstance().cardReader.enable('Please swipe card',
                                                    true,
                                                    true,
                                                    true,
                                                    function(event)
                                                    {
                                                        console.log('cardReader.enable->success: ' + event);
                                                    },
                                                    function(event)
                                                    {
                                                        console.log('cardReader.enable->error: ' + event);
                                                    
                                                        elem.innerHTML = 'ERROR ENABLING CARD READER: ' + event;
                                                    
                                                        alert('ERROR ENABLING CARD READER: ' + event);
                                                    });
      }
      else
      {
        if (EPSTransformMobile.options.onCardReaderError !== null)
        {
          console.log('Calling onCardReaderError callback...');
          EPSTransformMobile.options.onCardReaderError(prompt);
        }
      }
    }
    catch (ex)
    {
      console.log('enableCardReader: ' + ex)
      EPSTransformMobile.options.onCardReaderError(ex.message);
    }
  },

  onCardReaderSwipedInput: function (event)
  {
    try
    {
      console.log('onCardReaderSwipedInput:');

      if (event.hasOwnProperty('data'))
      {
        localStorage.cardDataUse = event.data.uses;
        
        if (event.data.uses & EPS.Device.CardDataUse.Raw)
        {
          localStorage.magneprintData = event.data.raw;
        }
        else if (event.data.uses & EPS.Device.CardDataUse.EncryptedParts)
        {
          if (event.data.hasOwnProperty('track2') && event.data.track2.hasOwnProperty('encryptedData'))
          {
            localStorage.encryptedTrack2Data = event.data.track2.encryptedData;
            
            localStorage.cardDataKeySerialNumber = event.data.track2.keySerialNumber;
            
            localStorage.encryptedFormat = event.data.track2.encryptedFormat;
          }
          else if (event.data.hasOwnProperty('track1') && event.data.track1.hasOwnProperty('encryptedData'))
          {
            localStorage.encryptedTrack1Data = event.data.track1.encryptedData;
            
            localStorage.cardDataKeySerialNumber = event.data.track1.keySerialNumber;
            
            localStorage.encryptedFormat = event.data.track1.encryptedFormat;
          }
        }
        else if (event.data.uses & EPS.Device.CardDataUse.ClearParts)
        {
          if (event.data.hasOwnProperty('track2') && event.data.track2.hasOwnProperty('dataNoSentinels'))
          {
            localStorage.track2Data = event.data.track2.dataNoSentinels;
          }
          else if (event.data.hasOwnProperty('track1') && event.data.track1.hasOwnProperty('dataNoSentinels'))
          {
            localStorage.track1Data = event.data.track1.dataNoSentinels;
          }
        }
        
        if (typeof EPS.Device.getInstance().deviceSerialNumber != 'undefined')
        {
          localStorage.deviceSerialNumber = EPS.Device.getInstance().deviceSerialNumber;
        }
        
        if (EPSTransformMobile.options.onCardSwiped !== null)
        {
          console.log('Calling onCardSwiped callback...');
          EPSTransformMobile.options.onCardSwipe();
        }
        else
        {
          var amount = Number(EPSTransformMobile.transactionAmount);
          EPSTransformMobile.processCreditSale(amount);
        }
      }
      else
      {
        EPSTransformMobile.enableCardReader('Please reswipe card...');
      }
    }
    catch (ex)
    {
      console.log('onCardReaderSwipedInput: ' + ex);
      EPSTransformMobile.options.onCardReaderError(ex);
    }
  },

  makeEpsExpress: function()
  {
      try
      {
          var epsExpress;
          
          epsExpress = new EPS.Express();
          
          epsExpress.TestCertification = true;
          
          //
          // credentials and remainder of application are set from native settings
          // 
          epsExpress.Application = new EPS.Express.Application();
          epsExpress.Application.ApplicationID = EPSTransformMobile.options.applicationID;  // "2623";
          epsExpress.Application.ApplicationName = 'TransFormMobileSDK';
          epsExpress.Application.ApplicationVersion = '0.0.1';

          epsExpress.Credentials = new EPS.Express.Credentials();
          epsExpress.Credentials.AccountID = EPSTransformMobile.options.accountID;          // "1011143";
          epsExpress.Credentials.AccountToken = EPSTransformMobile.options.accountToken;    // "386C3C6288AA02A3ADB8E749ADAAE9EACA2B9FFB48445EC528A65E507475FE3E8E7DAB01";
          epsExpress.Credentials.AcceptorID = EPSTransformMobile.options.acceptorID;        // "3928907";
          
          return epsExpress;
      }   
      catch (ex)
      {
          console.log('process.js->makeEpsExpress: ' + ex);
      }
      
      return null;
  },
  
  makeCreditCardSale: function(amount)
  {
      try
      {
          var epsExpress;
          
          epsExpress = EPSTransformMobile.makeEpsExpress();
          
          epsExpress.Type = EPS.Express.Type.CreditCardSale;
  
          epsExpress.Transaction = new EPS.Express.Transaction();
          
          epsExpress.Transaction.TransactionAmount = amount;
          
          epsExpress.Transaction.MarketCode = EPS.Express.MarketCode.FoodRestaurant;
          
          var date = new Date();
          
          epsExpress.Transaction.ReferenceNumber = date.toISOString().replace(/[-T:.Z]/gi, '');
          
          epsExpress.Terminal = new EPS.Express.Terminal();
          
          epsExpress.Terminal.TerminalID = "EPS TransForm Mobile 1";
          
          epsExpress.Terminal.CardPresentCode = EPS.Express.CardPresentCode.Present;
          
          epsExpress.Terminal.CardholderPresentCode = EPS.Express.CardHolderPresentCode.Present;
          
          epsExpress.Terminal.CVVPresenceCode = EPS.Express.CVVPresenceCode.Default;
          
          epsExpress.Terminal.TerminalCapabilityCode = EPS.Express.TerminalCapabilityCode.Default;
          
          epsExpress.Terminal.TerminalEnvironmentCode = EPS.Express.TerminalEnvironmentCode.Default;
          
          epsExpress.Terminal.MotoECICode = EPS.Express.MotoECICode.NotUsed;
          
          if (localStorage.hasOwnProperty('deviceSerialNumber') && typeof localStorage.deviceSerialNumber != 'undefined')
          {
              epsExpress.Terminal.TerminalSerialNumber = localStorage.deviceSerialNumber;
          }
          
          epsExpress.Card = new EPS.Express.Card();
          
          epsExpress.Terminal.CardInputCode = EPS.Express.CardInputCode.MagstripeRead;
                  
          if (localStorage.cardDataUse & EPS.Device.CardDataUse.Raw)
          {
              epsExpress.Card.MagneprintData = localStorage.magneprintData;
          }
          else if (localStorage.cardDataUse & EPS.Device.CardDataUse.EncryptedParts)
          {
              if (localStorage.hasOwnProperty('encryptedTrack2Data'))
              {
                  epsExpress.Card.EncryptedTrack2Data = localStorage.encryptedTrack2Data;
              }
              else if (localStorage.hasOwnProperty('encryptedTrack1Data'))
              {
                  epsExpress.Card.EncryptedTrack1Data = localStorage.encryptedTrack1Data;
              }
                  
              epsExpress.Card.CardDataSerialNumber = localStorage.cardDataKeySerialNumber;
              
              epsExpress.Card.EncryptedFormat = localStorage.encryptedFormat;
          }
          else if (localStorage.cardDataUse & EPS.Device.CardDataUse.ClearParts)
          {
              if (localStorage.hasOwnProperty('track2Data'))
              {
                  epsExpress.Card.Track2Data = localStorage.track2Data;
              }
              else if (localStorage.hasOwnProperty('track1Data'))
              {
                  epsExpress.Card.Track1Data = localStorage.track1Data;
              }
          }
         
          return epsExpress;
      }   
      catch (ex)
      {
          console.log('makeCreditCardSale: ' + ex);
      }
      
      return null;
  },

  processCreditSale: function (amount)
  {
    console.log('onProcess:');

    var epsExpress;

    epsExpress = EPSTransformMobile.makeCreditCardSale(amount);
    
    if (epsExpress == null)
    {
      console.log('ERROR CREATING EXPRESS');
      alert('ERROR CREATING EXPRESS');
    }
    else
    {
      epsExpress.sendAsynchronousRequest(30,
                                         true,
                                         function(event)
                                         {
                                             console.log('sendAsynchronousRequest->success: ' + event);
                                         },
                                         function(event)
                                         {
                                             console.log('sendAsynchronousRequest->error: ' + event);
                                             alert('ERROR SENDING REQUEST TO EXPRESS: ' + event);
                                         });
    }

  },

  onCardCancelEntry: function (event)
  {
    try
    {
      console.log('onCardCancelEntry:' + event.reason);
      
      if (EPSTransformMobile.options.onCardReaderCancel !== null)
      {
        console.log('Calling onCardReaderCancel callback...');
        EPSTransformMobile.options.onCardReaderCancel();
      }
    }
    catch (ex)
    {
      console.log('onCardCancelEntry: ' + ex);
    }
  },
  
  onCardReaderError: function (event)
  {
    try
    {
      console.log('onCardReaderError:' + event.error.description);
      
      if (EPSTransformMobile.options.onCardReaderError !== null)
      {
        console.log('Calling onCardReaderError callback...');
        EPSTransformMobile.options.onCardReaderError();
      }
    }
    catch (ex)
    {
      console.log('onCardReaderError: ' + ex);
    }
  },

  onProcessComplete: function (event)
  {
    try
    {
      console.log('onProcessComplete:');
      console.log('Event =' + JSON.stringify(event, null, '  '));

      if (EPSTransformMobile.options.onPaymentComplete !== null)
      {
        var resp = event.data.response;
        console.log('Calling onPaymentComplete callback...');
        EPSTransformMobile.options.onPaymentComplete(resp);
      }
        
    }
    catch (ex)
    {
      console.log('onProcessComplete: ' + ex);
      EPSTransformMobile.options.onPaymentError(ex);
    }
  }

};

module.exports = EPSTransformMobile;
