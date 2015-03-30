/*!
 @file EPS.Device.js

 The EPS.Device class is a definition for the data passed between the JavaScript and native code as well as helper functions used to access the EPS Device framework functionality.
 
 <h3>Requirements</h3>
 
 For a list of requirements, see the Requirements section in the native EPS Device SDK for respective platform.
 */

// EPS = EPS || {};

/*!
 @class EPS.Device
 
 @brief Provides access to the device functionality.

 This is the main interface to the device functionality. This interface provides access to underlying device capabilities.
 */
EPS.Device = function()
{
    EPS._Device = this;
    
    //
    // This is called each time one of the channel events is subscribed to or unsubscribed from.
    // On the first subscription, this calls the "start" method to notify the native side of the callback ID for unsolicited events.
    // On the last unsubscription, this calls the "stop" method to notify the native side no unsolicited events should be sent.
    //
    EPS.Device._onChannelSubscribersChange = function()
    {
        try
        {
            var handlers;
            
            handlers = 0;
            
            for (var key in EPS._Device._channels)
            {
                handlers += EPS._Device._channels[key].numHandlers;
            }

            if (handlers === 1)
            {
                EPS.Utils.exec(EPS._Device._event, EPS._Device._error, "EPS.Device", "start", []);
            }
            else if (handlers === 0)
            {
                EPS.Utils.exec(null, null, "EPS.Device", "stop", []);
            }
        }
        catch (ex)
        {
            console.log('EPS.Device.js->_onHasSubscribersChange: ' + ex);
        }
    };

    //
    // Channels are used internally to facilitate unsolicited events from the native side.
    // This creates one channel for each event type.
    //
    this._channels = [];
    
    for (key in EPS.Device.Event)
    {
        if (EPS.Device.Event.hasOwnProperty(key))
        {
            this._channels[EPS.Device.Event[key]] = cordova.addDocumentEventHandler('_' + EPS.Device.Event[key].toLowerCase());
            
            this._channels[EPS.Device.Event[key]].onHasSubscribersChange = EPS.Device._onChannelSubscribersChange;
        }
    }

    //
    // This is the unsolicited event callback. It forwards the event to any listeners.
    //
    EPS.Device.prototype._event = function(event)
    {
        try
        {
            if (event == undefined)
            {
                console.log('EPS.Device.js->_event: EVENT UNDEFINED');
            }
            else if (!event.hasOwnProperty('type'))
            {
                console.log('EPS.Device.js->_event: EVENT TYPE UNDEFINED');
            }
            else if (typeof event.type !== 'string')
            {
                console.log('EPS.Device.js->_event: EVENT TYPE IS NOT A STRING');
            }
            else
            {
                var type;
                
                type = event.type.substring(1);
                
                if (!EPS._Device._channels.hasOwnProperty(type))
                {
                    console.log('EPS.Device.js->_event: NO CHANNEL DEFINED FOR ' + type + '(' + event.type + ')');
                }
                else
                {
                    console.log('EPS.Device.js->_event: ' + type);
                
                    EPS._Device._channels[type].fire(event);
                
                    event.type = type;
                    
                    EPS.Utils.fireDocumentEvent(type, event);
                }
            }
        }
        catch (ex)
        {
            console.log('EPS.Device.js->_event: ' + ex);
        }
    };

    //
    // This method is not used.
    //
    EPS.Device.prototype._error = function(event)
    {
        console.log('EPS.Device.js->_error: ' + ex);
    };
    
    /*!
     @brief Is the device connected.
    
     Although the delegate may implement the epsDevConnected method to receive connection events, this property provides the connection state of the device.
     */
    this.isConnected = false;

    /*!
     @brief Type of device connected.
    
     Indicates the type of device connected. This property is not set if a device is not connected.
     */
    this.deviceType = EPS.Device.Type.Unknown;
    
    /*!
     @brief Description of device connected.
    
     A text description of the connected device. This property is not set if a device is not connected.
     */
    this.deviceDescription = undefined;
    
    /*!
     @brief Serial number of device connected.
     
     The serial number of the connected device. This property is not set if the device does not supply its serial number or a device is not connected.
     */
    this.deviceSerialNumber = undefined;
    
    /*!
     @brief Capabilities of device connected.
    
     The capabilities of the connected device.  This property may be more than one of the values defined by EPS.Device.Capability.
     This property is not set if a device is not connected.
     */
    this.deviceCapabilities = EPS.Device.Capability.None;
    
    /*!
     @brief Barcode device.
    
     Provides access to the barcode device. This property may be nil if the connected device does not support this functionality.
     */
    this.barcodeReader = undefined;
    
    /*!
     @brief Battery device.
    
     Provides access to the battery device. This property may be nil if the connected device does not support this functionality.
     */
    this.battery = undefined;
    
     /*!
     @brief Card reader device.
    
     Provides access to the card reader device. This property may be nil if the connected device does not support this functionality.
      */
    this.cardReader = undefined;
    
    /*!
     @brief PIN entry device.
    
     Provides access to the PIN entry device. This property may be nil if the connected device does not support this functionality.
     */
    this.pinPad = undefined;
    
    /*!
     @brief Start device connection.
     
     Starts the device connection process. This process automatically detects when devices are connected and disconnected.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.startConnection = function(successCallback, errorCallback)
    {
        try
        {
            document.addEventListener('_' + EPS.Device.Event.onConnected, this._onEPSDeviceConnected, false);

            document.addEventListener('_' + EPS.Device.Event.onDisconnected, this._onEPSDeviceDisconnected, false);
            
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'startConnection', []);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->startConnection: ' + ex);
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }
    };
    
    /*!
     @brief Stop device connection.
    
     Stops the device connection process and terminates all device activity.

     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
     
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
    */
    this.stopConnection = function(successCallback, errorCallback)
    {
        try
        {
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'stopConnection', []);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->stopConnection: ' + ex);
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }
    };
    
    //
    // Used internally to setup the class when a device is connected.
    //
    this._onEPSDeviceConnected = function(event)
    {
        try
        {
            console.log('EPS.Device.js->_onEPSDeviceConnected:');
                
            if (event.hasOwnProperty('error'))
            {
                console.log('EPS.Device.js->_onEPSDeviceConnected: ERROR - ' + event.error.description);
                
                EPS._Device._onEPSDeviceDisconnected(event);
            }
            else if (event.hasOwnProperty('data'))
            {
                console.log('EPS.Device.js->_onEPSDeviceConnected: d=' + event.data.description + ' c=0x' + event.data.capabilities.toString(16) + ' sn=' + event.data.serialNumber);
                
                EPS._Device.deviceType = event.data.type;
                
                EPS._Device.deviceDescription = event.data.description;
                
                EPS._Device.deviceSerialNumber = event.data.serialNumber;
                
                EPS._Device.deviceCapabilities = event.data.capabilities;
                
                if (EPS._Device.deviceCapabilities & (EPS.Device.Capability.SwipeCardReader | EPS.Device.Capability.ManualCardEntry | EPS.Device.Capability.ContactlessCardReader))
                {
                    EPS._Device.cardReader = new EPS.Device.CardReader();
                }
                    
                if (EPS._Device.deviceCapabilities & EPS.Device.Capability.BarcodeReader)
                {
                    EPS._Device.barcodeReader = new EPS.Device.BarcodeReader();
                }
                
                if (EPS._Device.deviceCapabilities & EPS.Device.Capability.PinPad)
                {
                    EPS._Device.pinPad = new EPS.Device.PinPad();
                }
                
                if (EPS._Device.deviceCapabilities & EPS.Device.Capability.Keyboard)
                {
                    
                }
                
                if (EPS._Device.deviceCapabilities & (EPS.Device.Capability.BatteryStatus | EPS.Device.Capability.BatteryCanChargeDevice))
                {
                    EPS._Device.battery = new EPS.Device.Battery();
                }
    
                EPS._Device.isConnected = true;
            }
        }
        catch (ex)
        {
            console.log('EPS.Device.js->_onEPSDeviceConnected: ' + ex);
        }
    };
    
    //
    // Used internally to tear down this class when a device is disconnected.
    //
    this._onEPSDeviceDisconnected = function(event)
    {
        try
        {
            console.log('EPS.Device.js->_onEPSDeviceDisconnected:');
            
            EPS._Device.isConnected = false;
            
            EPS._Device.deviceType = EPS.Device.Type.Unknown;
            
            EPS._Device.deviceDescription = undefined;
            
            EPS._Device.deviceSerialNumber = undefined;
            
            EPS._Device.deviceCapabilities = EPS.Device.Capability.None;
        
            EPS._Device.barcodeReader = undefined;
            
            EPS._Device.battery = undefined;
            
            EPS._Device.cardReader = undefined;
            
            EPS._Device.pinPad = undefined;
        }
        catch (ex)
        {
            console.log('EPS.Device.js->_onEPSDeviceDisconnected: ' + ex);
        }
    };
};

/*!
 @brief Returns the single instance of the device.

 Creates (if necessary) and returns the single instance of the device.

 @return The single instance of the device.
*/
EPS.Device.getInstance = function()
{
    if (EPS.Device._Device == undefined)
    {
        EPS.Device._Device = new EPS.Device();
    }
    
    return EPS.Device._Device;
};

/*!
 @class
 
 @brief Definitions of the event types to which an application may subscribe.

 @var onConnected Type for onConnected event.
 @var onDisconnected Type for onDisconnected event.
 @var onBarcodeReaderData Type for onBarcodeReaderData event.
 @var onBarcodeReaderButtonPress Type for onBarcodeReaderButtonPress event.
 @var onBarcodeReaderButtonRelease Type for onBarcodeReaderButtonRelease event.
 @var onBarcodeReaderError Type for onBarcodeReaderError event.
 @var onBatteryChargeStateChanged Type for onBatteryChargeStateChanged event.
 @var onBatteryChargeLevelChanged Type for onBatteryChargeLevelChanged event.
 @var onBatteryChargeReachedCritical Type for onBatteryVoltageLevelChanged event.
 @var onBatteryChargeReachedFull Type for onBatteryChargeReachedFull event.
 @var onBatteryChargeReachedCritical Type for onBatteryChargeReachedCritical event.
 @var onCardReaderSwipedInput Type for onCardReaderSwipedInput event.
 @var onCardReaderManualInput Type for onCardReaderManualInput event.
 @var onCardReaderCancelEntry Type for onCardReaderCancelEntry event.
 @var onCardReaderError Type for onCardReaderError event.
 @var onPinPadInput Type for onPinPadInput event.
 @var onPinPadCancelEntry Type for onPinPadCancelEntry event.
 @var onPinPadError Type for onPinPadError event.
 */
EPS.Device.Event =
{
    //
    // Type for onConnected event
    //
    onConnected                                 : 'onEPSDeviceConnected',
    //
    // Type for onDisconnected event
    //
    onDisconnected                              : 'onEPSDeviceDisconnected',
    //
    // Type for onBarcodeReaderData event
    //
    onBarcodeReaderData                         : 'onEPSDeviceBarcodeReaderData',
    //
    // Type for onBarcodeReaderButtonPress event
    //
    onBarcodeReaderButtonPress                  : 'onEPSDeviceBarcodeReaderButtonPress',
    //
    // Type for onBarcodeReaderButtonRelease event
    //
    onBarcodeReaderButtonRelease                : 'onEPSDeviceBarcodeReaderButtonRelease',
    //
    // Type for onBarcodeReaderError event
    //
    onBarcodeReaderError                        : 'onEPSDeviceBarcodeReaderError',
    //
    // Type for onBatteryChargeStateChanged event
    //
    onBatteryChargeStateChanged                 : 'onEPSDeviceBatteryChargeStateChanged',
    //
    // Type for onBatteryChargeLevelChanged event
    //
    onBatteryChargeLevelChanged                 : 'onEPSDeviceBatteryChargeLevelChanged',
    //
    // Type for onBatteryVoltageLevelChanged event
    //
    onBatteryVoltageLevelChanged                : 'onEPSDeviceBatteryVoltageLevelChanged',
    //
    // Type for onBatteryChargeReachedFull event
    //
    onBatteryChargeReachedFull                  : 'onEPSDeviceBatteryChargeReachedFull',
    //
    // Type for onBatteryChargeReachedCritical event
    //
    onBatteryChargeReachedCritical              : 'onEPSDeviceBatteryChargeReachedCritical',
    //
    // Type for onCardReaderSwipedInput event
    //
    onCardReaderSwipedInput                     : 'onEPSDeviceCardReaderSwipedInput',
    //
    // Type for onCardReaderManualInput event
    //
    onCardReaderManualInput                     : 'onEPSDeviceCardReaderManualInput',
    //
    // Type for onCardReaderCancelEntry event
    //
    onCardReaderCancelEntry                     : 'onEPSDeviceCardReaderCancelEntry',
    //
    // Type for onCardReaderError event
    //
    onCardReaderError                           : 'onEPSDeviceCardReaderError',
    //
    // Type for onPinPadInput event
    //
    onPinPadInput                               : 'onEPSDevicePinPadInput',
    //
    // Type for onPinPadCancelEntry event
    //
    onPinPadCancelEntry                         : 'onEPSDevicePinPadCancelEntry',
    //
    // Type for onPinPadError event
    //
    onPinPadError                               : 'onEPSDevicePinPadError'
};

/*!
 @class
 
 @brief Device types.
 
 @var Unknown Unknown.
 @var IPCLineaPro IPC Linea Pro.
 @var IPCInfineaPad IPC Linea Pad.
 @var MagTekiDynamo MagTek iDynamo.
 @var IDTECHUniMag IDTECH UniMag/Shuttle.
 @var IDTECHiMag IDTECH iMag.
 @var Lilitab Lilitab.
 @var GTMagBarGriffin Technology MagBar.
 */
EPS.Device.Type =
{
    //
    // Unknown
    //
    Unknown                                     : 0,
    //
    // IPC Linea Pro
    //
    IPCLineaPro                                 : 2,
    //
    // IPC Linea Pad
    //
    IPCInfineaPad                               : 3,
    //
    // MagTek iDynamo
    //
    MagTekiDynamo                               : 4,
    //
    // IDTECH UniMag/Shuttle
    //
    IDTECHUniMag                                : 5,
    //
    // IDTECH iMag
    //
    IDTECHiMag                                  : 6,
    //
    // Lilitab
    //
    Lilitab                                     : 7,
    //
    // Griffin Technology MagBar
    //
    GTMagBar                                    : 8
};

/*!
 @class
 
 @brief Flags indicating the device capabilities.
 
 @var None None.
 @var SwipeCardReader Magnetic stripe reader.
 @var ManualCardEntry Manual card entry.
 @var ContactlessCardReaderContactless card reader.
 @var BarcodeReader Barcode reader.
 @var PinPad PIN entry.
 @var Keyboard Keyboard input.
 @var BatteryStatus Battery status.
 @var BatteryCanChargeDevice Battery can charge device.
 */
EPS.Device.Capability =
{
    //
    // None
    //
    None                                        : 0x0000,
    //
    // Magnetic stripe reader
    //
    SwipeCardReader                             : 0x0001,
    //
    // Manual card entry
    //
    ManualCardEntry                             : 0x0002,
    //
    // Contactless card reader
    //
    ContactlessCardReader                       : 0x0004,
    //
    // Barcode reader
    //
    BarcodeReader                               : 0x0008,
    //
    // PIN entry
    //
    PinPad                                      : 0x0010,
    //
    // Keyboard input
    //
    Keyboard                                    : 0x0020,
    //
    // Battery status
    //
    BatteryStatus                               : 0x0040,
    //
    // Battery can charge device
    //
    BatteryCanChargeDevice                      : 0x0080
};

/*!
 @class
 
 @brief Device errors.
 
 @var Unknown Unknown.
 @var InsufficientPower Insufficient power. For a headphone device, ensure the headphone volume is max.
 */
EPS.Device.Error =
{
    //
    // Unknown
    //
    Unknown                                     : 0,
    //
    // Insufficient power. For a headphone device, ensure the headphone volume is max.
    //
    InsufficientPower                           : 1
};

/*!
 @class
 
 @brief Definition of an onConnected event.
 
 @var error Optional property indicating an error occurred, present only if an error occurred.
 @var data Optional property containing data for this event, present only if no error occurred.
 */
EPS.Device.OnConnected =
{
    //
    // Optional property indicating an error occurred, present only if an error occurred
    //
    error:
    {
        //
        // Code for the error that occurred
        //
        code: EPS.Device.Error.Unknown,
        
        //
        // Description for the error that occurred
        //
        description: null
    },
    
    //
    // Optional property containing data for this event, present only if no error occurred
    //
    data:
    {
        //
        // Type of device connected
        //
        type: EPS.Device.Type.Unknown,
        
        //
        // Description of device connected
        //
        description: null,

        //
        // The capabilities of the connected device, may be more than one of the values defined by EPS.Device.Capability
        //
        capabilities: EPS.Device.Capability.None,
        
        //
        // Serial number of device connected
        //
        serialNumber: null
    }
};

/*!
 @class
 
 @brief Definition of an onDisconnected event.
 
 @var error Optional property indicating an error occurred, present only if an error occurred.
 */
EPS.Device.OnDisconnected =
{
    //
    // Optional property indicating an error occurred, present only if an error occurred
    //
    error:
    {
        //
        // Code for the error that occurred.
        //
        code: EPS.Device.Error.Unknown,
        
        //
        // Description for the error that occurred.
        //
        description: null
    }    
};

/*!
 @class
 
 @brief Types of barcode data.
 
 @var None None.
 @var Unknown Unknown.
 @var UpcA UPC-A.
 @var UpcA_2 UPC-A 2.
 @var UpcA_5 UPC-A 5.
 @var UpcE UPC-E.
 @var UpcE_2 UPC-E 2.
 @var UpcE_5 UPC-E 5.
 @var Codabar Codabar.
 @var Codabar_Abc Codabar ABC.
 @var Codabar_Cx Codabar CX.
 @var Code25Interleaved2Of5 Code 25 interleaved 2 of 5.
 @var Code25NonInterleaved2Of5 Code 25 non-interleaved 2 of 5.
 @var Code39 Code 39.
 @var Code39_ItalianCpi Code 39 Italian CPI.
 @var Code39_Full Code 39 full.
 @var Code93 Code 93.
 @var Code128 Code 128.
 @var Code128_A Code 128A.
 @var Code128_B Code 128B.
 @var Code128_C Code 128C.
 @var Code11 Code 11.
 @var CpcBinary CPC binary.
 @var Dun14 DUN 14.
 @var Ean2 EAN 2.
 @var Ean5 EAN 5.
 @var Ean8 EAN 8.
 @var Ean8_2 EAN 8 2.
 @var Ean8_5 EAN 8 5.
 @var Ean13 EAN 13.
 @var Ean13_2 EAN 13 2.
 @var Ean13_5 EAN 13 5.
 @var Ean128 EAN 128.
 @var Gs1_128 GS1 128.
 @var Gs1_DataBar GS1 DataBar.
 @var Gs1_DataBarOmni GS1 DataBar omni.
 @var Gs1_DataBarLimited GS1 DataBar limited.
 @var Gs1_DataBarExpanded GS1 DataBar expanded.
 @var Itf14 ITF 14.
 @var LatentImage Latent image.
 @var PharmaCode Pharmacode.
 @var PharmaCode_Ita Pharmacode Italian.
 @var Plessy Plessy.
 @var Plessy_Uk Plessy UK.
 @var Planet PLANET.
 @var PostNet POSTNET.
 @var IntelligentMail Intelligent Mail.
 @var Msi MSI.
 @var PostBar PostBar.
 @var Rm4scc RM4SCC.
 @var Jan JAN.
 @var Telepen Telepen.
 @var Interleaved2Of5 Interleaved 2 of 5.
 @var Standard2Of5 Standard 2 of 5.
 @var Matrix2Of5 Matrix 2 of 5.
 @var AmesCode Ames Code.
 @var Code16K Code 16K.
 @var Code49 Code 49.
 @var CodaBlockA CodaBlock A.
 @var CodaBlockF CodaBlock F.
 @var Pdf417 PDF417.
 @var Isbt128 ISBT 128.
 @var MicroPdf Micro PDF.
 @var DataMatrix Data Matrix.
 @var QrCode QR Code.
 @var Maxicode Maxicode.
 @var Aztec Aztec.
 @var Scode S Code.
 @var Iata IATA.
 @var KoreanPostal Korean Postal.
 @var CcA CC-A.
 @var CcB CC-B.
 @var CcC CC-C.
 @var UpcE_1 UPC-E1.
 @var EanIssn ISSN EAN.
 @var Code39_Trioptic Trioptic Code 39.
 @var Code32 Code 32.
 @var Discrete2Of5 Discrete 2 of 5.
 @var Chinese2Of5 Chinese 2 of 5.
 @var Korean3Of5 Korean 3 of 5.
 @var Inverse1D Inverse 1D.
 @var CcAB Composite CC-A/B.
 @var Tlc39 Composite TLC-39.
 @var MatrixInverse Data Matrix Inverse.
 @var MicroQrCode MicroQR.
 @var QrInverse QR Inverse.
 @var AztecInverse Aztec Inverse.
 @var UkPostal UK Postal.
 @var JapanPostal Japan Postal.
 @var AustralianPostal Australian Postal.
 @var NetherlandsKixCode Netherlands KIX Code.
 @var UpuFicsPostal UPU FICS Postal.
 */
EPS.Device.BarcodeType =
{
    //
    // None
    //
    None                                        : -1,
    //
    // Unknown
    //
    Unknown                                     : 0,
    //
    // UPC-A
    //
    UpcA                                        : 1,
    //
    // UPC-A 2
    //
    UpcA_2                                      : 2,
    //
    // UPC-A 5
    //
    UpcA_5                                      : 3,
    //
    // UPC-E
    //
    UpcE                                        : 4,
    //
    // UPC-E 2
    //
    UpcE_2                                      : 5,
    //
    // UPC-E 5
    //
    UpcE_5                                      : 6,
    //
    // Codabar
    //
    Codabar                                     : 7,
    //
    // Codabar ABC
    //
    Codabar_Abc                                 : 8,
    //
    // Codabar CX
    //
    Codabar_Cx                                  : 9,
    //
    // Code 25 interleaved 2 of 5
    //
    Code25Interleaved2Of5                       : 10,
    //
    // Code 25 non-interleaved 2 of 5
    //
    Code25NonInterleaved2Of5                    : 11,
    //
    // Code 39
    //
    Code39                                      : 12,
    //
    // Code 39 Italian CPI
    //
    Code39_ItalianCpi                           : 13,
    //
    // Code 39 full
    //
    Code39_Full                                 : 14,
    //
    // Code 93
    //
    Code93                                      : 15,
    //
    // Code 128
    //
    Code128                                     : 16,
    //
    // Code 128A
    //
    Code128_A                                   : 17,
    //
    // Code 128B
    //
    Code128_B                                   : 18,
    //
    // Code 128C
    //
    Code128_C                                   : 19,
    //
    // Code 11
    //
    Code11                                      : 20,
    //
    // CPC binary
    //
    CpcBinary                                   : 21,
    //
    // DUN 14
    //
    Dun14                                       : 22,
    //
    // EAN 2
    //
    Ean2                                        : 23,
    //
    // EAN 5
    //
    Ean5                                        : 24,
    //
    // EAN 8
    //
    Ean8                                        : 25,
    //
    // EAN 8 2
    //
    Ean8_2                                      : 26,
    //
    // EAN 8 5
    //
    Ean8_5                                      : 27,
    //
    // EAN 13
    //
    Ean13                                       : 28,
    //
    // EAN 13 2
    //
    Ean13_2                                     : 29,
    //
    // EAN 13 5
    //
    Ean13_5                                     : 30,
    //
    // EAN 128
    //
    Ean128                                      : 31,
    //
    // GS1 128
    //
    Gs1_128                                     : 32,
    //
    // GS1 DataBar
    //
    Gs1_DataBar                                 : 33,
    //
    // GS1 DataBar omni
    //
    Gs1_DataBarOmni                             : 34,
    //
    // GS1 DataBar limited
    //
    Gs1_DataBarLimited                          : 35,
    //
    // GS1 DataBar expanded
    //
    Gs1_DataBarExpanded                         : 36,
    //
    // ITF 14
    //
    Itf14                                       : 37,
    //
    // Latent image
    //
    LatentImage                                 : 38,
    //
    // Pharmacode
    //
    PharmaCode                                  : 39,
    //
    // Pharmacode Italian
    //
    PharmaCode_Ita                              : 40,
    //
    // Plessy
    //
    Plessy                                      : 41,
    //
    // Plessy UK
    //
    Plessy_Uk                                   : 42,
    //
    // PLANET
    //
    Planet                                      : 43,
    //
    // POSTNET
    //
    PostNet                                     : 44,
    //
    // Intelligent Mail
    //
    IntelligentMail                             : 45,
    //
    // MSI
    //
    Msi                                         : 46,
    //
    // PostBar
    //
    PostBar                                     : 47,
    //
    // RM4SCC
    //
    Rm4scc                                      : 48,
    //
    // JAN
    //
    Jan                                         : 49,
    //
    // Telepen
    //
    Telepen                                     : 50,
    //
    // Interleaved 2 of 5
    //
    Interleaved2Of5                             : 51,
    //
    // Standard 2 of 5
    //
    Standard2Of5                                : 52,
    //
    // Matrix 2 of 5
    //
    Matrix2Of5                                  : 53,
    //
    // Ames Code
    //
    AmesCode                                    : 54,
    //
    // Code 16K
    //
    Code16K                                     : 55,
    //
    // Code 49
    //
    Code49                                      : 56,
    //
    // CodaBlock A
    //
    CodaBlockA                                  : 57,
    //
    // CodaBlock F
    //
    CodaBlockF                                  : 58,
    //
    // PDF417
    //
    Pdf417                                      : 59,
    //
    // ISBT 128
    //
    Isbt128                                     : 60,
    //
    // Micro PDF
    //
    MicroPdf                                    : 61,
    //
    // Data Matrix
    //
    DataMatrix                                  : 62,
    //
    // QR Code
    //
    QrCode                                      : 63,
    //
    // Maxicode
    //
    Maxicode                                    : 64,
    //
    // Aztec
    //
    Aztec                                       : 65,
    //
    // S Code
    //
    Scode                                       : 66,
    //
    // IATA
    //
    Iata                                        : 67,
    //
    // Korean Postal
    //
    KoreanPostal                                : 68,
    //
    // CC-A
    //
    CcA                                         : 69,
    //
    // CC-B
    //
    CcB                                         : 70,
    //
    // CC-C
    //
    CcC                                         : 71,
    //
    // UPC-E1
    //
    UpcE_1                                      : 72,
    //
    // ISSN EAN
    //
    EanIssn                                     : 73,
    //
    // Trioptic Code 39
    //
    Code39_Trioptic                             : 74,
    //
    // Code 32
    //
    Code32                                      : 75,
    //
    // Discrete 2 of 5
    //
    Discrete2Of5                                : 76,
    //
    // Chinese 2 of 5
    //
    Chinese2Of5                                 : 77,
    //
    // Korean 3 of 5
    //
    Korean3Of5                                  : 78,
    //
    // Inverse 1D
    //
    Inverse1D                                   : 79,
    //
    // Composite CC-A/B
    //
    CcAB                                        : 80,
    //
    // Composite TLC-39
    //
    Tlc39                                       : 81,
    //
    // Data Matrix Inverse
    //
    MatrixInverse                               : 82,
    //
    // MicroQR
    //
    MicroQrCode                                 : 83,
    //
    // QR Inverse
    //
    QrInverse                                   : 84,
    //
    // Aztec Inverse
    //
    AztecInverse                                : 85,
    //
    // UK Postal
    //
    UkPostal                                    : 86,
    //
    // Japan Postal
    //
    JapanPostal                                 : 87,
    //
    // Australian Postal
    //
    AustralianPostal                            : 88,
    //
    // Netherlands KIX Code
    //
    NetherlandsKixCode                          : 89,
    //
    // UPU FICS Postal
    //
    UpuFicsPostal                               : 90
};

/*!
 @class
 
 @brief Provides access to the device's barcode functionality.

 This interface provides access to the devices barcode capabilities.
 */
EPS.Device.BarcodeReader = function ()
{
    EPS._Device._BarCodeReader = this;
    
    /*!
     @brief Enable the device.
    
     This method enables the device.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.enable = function(successCallback, errorCallback)
    {
        try
        {
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'barcodeEnable', []);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->Barcode.enable: ' + ex)
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }
    };  
    
    /*!
     @brief Disable the device.
    
     This method disables the device.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.disable = function(successCallback, errorCallback)
    {
        try
        {
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'barcodeDisable', []);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->Barcode.disable: ' + ex)
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }        
    };  
};

/*!
 @class
 
 @brief Types of bardcode buttons.
 
 @var None None.
 @var LeftButton Left button.
 @var RightButton Right button.
 */
EPS.Device.BarcodeReader.ButtonType =
{
    //
    // None
    //
    None                                        : -1,
    //
    // Left button
    //
    LeftButton                                  : 0,
    //
    // Right button
    //
    RightButton                                 : 1
};

/*!
 @class
 
 @brief Barcode reader errors.
 
 @var Unknown Unknown.
 @var UnsuccessfulBarcodeDecode Unsuccessful barcode decode.
 */
EPS.Device.BarcodeReader.Error =
{
    //
    // Unknown
    //
    Unknown                                     : 0,
    //
    // Unsuccessful barcode decode
    //
    UnsuccessfulBarcodeDecode                   : 1
};

/*!
 @class
 
 @brief Definition of an onBarcodeReaderData event.
 
 @var data Property containing data for this event.
 */
EPS.Device.OnBarcodeReaderData =
{
    //
    // Property containing data for this event
    //
    data:
    {
        //
        // Type of barcode read
        //
        type: EPS.Device.BarcodeType.Unknown,
        
        //
        // Read barcode data
        //
        data: null
    }    
};

/*!
 @class
 
 @brief Definition of an onBarcodeReaderButtonPress event.
 
 @var data Property containing data for this event.
 */
EPS.Device.OnBarcodeReaderButtonPress =
{
    //
    // Property containing data for this event
    //
    data:
    {
        //
        // Button pressed
        //
        button: EPS.Device.BarcodeReader.ButtonType.None
    }    
};
    
/*!
 @class
 
 @brief Definition of an onBarcodeReaderButtonRelease event.
 
 @var data Property containing data for this event.
 */
EPS.Device.OnBarcodeReaderButtonRelease =
{
    //
    // Property containing data for this event
    //
    data:
    {
        //
        // Button released
        //
        button: EPS.Device.BarcodeReader.ButtonType.None
    }    
};
    
/*!
 @class
 
 @brief Definition of an onBarcodeReaderError event.
 
 @var error Property indicating an error occurred.
 */
EPS.Device.OnBarcodeReaderError =
{
    //
    // Property indicating an error occurred
    //
    error:
    {
        //
        // Code for the error that occurred.
        //
        code: EPS.Device.BarcodeReader.Error.Unknown,
        
        //
        // Description for the error that occurred.
        //
        description: null
    }
};

/*!
 @class
 
 @brief Provides access to the device's battery functionality.

 This interface provides access to the devices battery capabilities.
 */
EPS.Device.Battery = function ()
{
    EPS._Device._Battery = this;
    
    /*!
     @const ChargeLevelNotSupported
     
     @brief Battery charge level not supported.
    
     This value indicates the device does not support battery charge level.
     */
    this.ChargeLevelNotSupported = -1000;
    
    /*!
     @const ChargeLevelError
     
     @brief Battery charge level error.
    
     This value indicates there was an error retrieving the battery charge level.
     */
    this.ChargeLevelError = -1001;
    
    /*!
     @const VoltageNotSupported
     
     @brief Battery voltage not supported.
    
     This value indicates the device does not support battery voltage.
     */
    this.VoltageNotSupported = -1000.0;
    
    /*!
     @const VoltageError
     
     @brief Battery voltage error.
    
     This value indicates there was an error retrieving the battery voltage.
     */
    this.VoltageError = -1001.0;

    /*!
     @brief Charging.
    
     Indicates whether the battery is charging or not.
     */
    this.isCharging = false;
    
    /*!
     @brief Charging device.
    
     Indicates whether the battery is charging the device or not.
     */
    this.isChargingDevice = false;
    
    /*!
     @brief Charge level.
    
     The current charge level of the battery. This value may range from 0% to 100%.
     */
    this.chargeLevel = this.ChargeLevelError;
    
    /*!
     @brief Voltage.
    
     The current voltage of the battery.
     */
    this.voltage = this.VoltageError;
    
    /*!
     @brief Enable the device
    
     This method enables the device.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.enable = function(successCallback, errorCallback)
    {
        try
        {
            document.addEventListener('_' + EPS.Device.Event.onBatteryChargeStateChanged, this._onEPSDeviceBattery, false);

            document.addEventListener('_' + EPS.Device.Event.onBatteryChargeLevelChanged, this._onEPSDeviceBattery, false);

            document.addEventListener('_' + EPS.Device.Event.onBatteryVoltageLevelChanged, this._onEPSDeviceBattery, false);

            document.addEventListener('_' + EPS.Device.Event.onBatteryChargeReachedFull, this._onEPSDeviceBattery, false);

            document.addEventListener('_' + EPS.Device.Event.onBatteryChargeReachedCritical, this._onEPSDeviceBattery, false);

            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'batteryEnable', []);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->Battery.enable: ' + ex)
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }
    };  
     
    //
    // Used internally to store battery information from the event.
    //
    this._onEPSDeviceBattery = function(event)
    {
        try
        {
            console.log('EPS.Device.js->Battery._onEPSDeviceBattery: ' + event.type);
                
            if (event.hasOwnProperty('data'))
            {
                EPS._Device._Battery.isCharging = event.data.charging;
    
                EPS._Device._Battery.isChargingDevice = event.data.chargingDevice;
    
                EPS._Device._Battery.chargeLevel = event.data.chargeLevel;
    
                EPS._Device._Battery.voltage = event.data.voltage;
            }
        }
        catch (ex)
        {
            console.log('EPS.Device.js->Battery._onEPSDeviceBattery: ' + ex);
        }
    };
    
    /*!
     @brief Disable the device
    
     This method disables the device.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.disable = function(successCallback, errorCallback)
    {
        try
        {
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'batteryDisable', []);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->Battery.disable: ' + ex)
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }        
    };
      
    /*!
     @brief Enable charging device
    
     This method enables charging the device using the attached devices battery.
     <br /><br /><strong style="color: #FF0000">WARNING: Enabling the attached device to charge the device will drain the attached devices battery at a higher rate.
     Completely discharging the attached devices battery may result in data loss and/or the device becoming inoperable even after the battery is recharged.
     CONSULT THE ATTACHED DEVICES MANUAL(S) AND UNDERSTAND THIS FUNCTIONALITY FULLY BEFORE ATTEMPTING TO USE.</strong>
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.enableChargeDevice = function(successCallback, errorCallback)
    {
        try
        {
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'batteryEnableChargeDevice', []);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->Battery.enableChargeDevice: ' + ex)
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }
    };
    
    /*!
     @brief Disable charging device
    
     This method disables charging the device using the attached devices battery.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.disableChargeDevice = function(successCallback, errorCallback)
    {
        try
        {
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'batteryDisableChargeDevice', []);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->Battery.disableChargeDevice: ' + ex)
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }
    }; 
};

/*!
 @class
 
 @brief Battery errors.
 
 @var Unknown Unknown.
 */
EPS.Device.Battery.Error =
{
    //
    // Unknown
    //
    Unknown                                     : 0
};

/*!
 @class
 
 @brief Definition of an onBatteryChargeStateChanged, onBatteryChargeLevelChanged, onBatteryVoltageLevelChanged, onBatteryChargeReachedFull, or onBatteryChargeReachedCritical event.
 
 @var data Property containing data for this event.
 */
EPS.Device.OnBattery =
{
    //
    // Property containing data for this event
    //
    data:
    {
        //
        // Indicates whether the battery is charging or not
        //
        charging: false,
        
        //
        // Indicates whether the battery is charging the device or not
        //
        chargingDevice: false,
        
        //
        // The current charge level of the battery, value may range from 0% to 100%
        //
        chargeLevel: EPS.Device.Battery.ChargeLevelError,
        
        //
        // The current voltage of the battery
        //
        voltage: EPS.Device.Battery.VoltageError
    }    
};

/*!
 @class
 
 @brief Provides access to the device's card input functionality.

 This interface provides access to the devices card input capabilities.
 */
EPS.Device.CardReader = function ()
{
    EPS._Device._CardReader = this;
    
    /*!
     @brief Enable the device.
    
     This method enables the device.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.enable = function(successCallback, errorCallback)
    {
        try
        {
            this.enable("Please Slide Card", false, true, true, successCallback, errorCallback);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->CardReader.enable: ' + ex)
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }
    };  
     
    /*!
     @brief Enable the card reader with options.
    
     This method enables the card reader with the specified options.
    
     @param prompt The prompt displayed on the device for card input.<br /><br /><strong>NOTE:</strong> Not all readers support displaying a prompt.<br /><br />
    
     @param allowManual Manual input allowed.<br /><br /><strong>NOTE:</strong> Not all readers support manually keyed card input.<br /><br />
    
     @param allowTrack1 Track 1 input allowed.
    
     @param allowTrack2 Track 2 input allowed.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.enable = function(prompt, allowManual, allowTrack1, allowTrack2, successCallback, errorCallback)
    {
        try
        {
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'cardReaderEnable', [ prompt, allowManual, allowTrack1, allowTrack2 ]);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->CardReader.enable: ' + ex)
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }        
    };  
    
    /*!
     @brief Disable the device.
    
     This method disables the device.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.disable = function(successCallback, errorCallback)
    {
        try
        {
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'cardReaderDisable', []);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->CardReader.disable: ' + ex)
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }        
    };  
};

/*!
 @class
 
 @brief Uses of the card data.

 @var None None.
 @var ClearParts The clear data parts may be used as input for Express. Clear data cannot be used with Hosted Payments.
 @var EncryptedParts Encrypted parts.
 @var Raw Raw output.
 @var HostedPayments Raw output for Hosted Payments.
 */
EPS.Device.CardDataUse =
{
    //
    // None
    //
    None                                        : 0x00,
    //
    // The clear data parts may be used as input for Express. Clear data cannot be used with Hosted Payments.
    //
    ClearParts                                  : 0x01,
    //
    // Encrypted parts
    //
    EncryptedParts                              : 0x02,
    //
    // Raw output
    //
    Raw                                         : 0x04,
    //
    // Raw output for Hosted Payments
    //
    HostedPayments                              : 0x08,
};

/*!
 @class
 
 @brief Card reader errors.
 
 @var Unknown Unknown.
 @var EnableFailed Enable failed.
 @var DisableFailed Disable failed.
 @var PowerOnDenied Power on denied.
 @var PowerOnFailed Power on failed.
 @var NoTrackData No track data.
 @var InvalidSwipe Invalid swipe.
 @var SwipeTimeout Swipe timeout.
 @var KeysExhausted Keys exhausted.
 @var Tampered Tampered.
 */
EPS.Device.CardReader.Error =
{
    //
    // Unknown
    //
    Unknown                                     : 0,
    //
    // Enable failed
    //
    EnableFailed                                : 1,
    //
    // Disable failed
    //
    DisableFailed                               : 2,
    //
    // Power on denied
    //
    PowerOnDenied                               : 3,
    //
    // Power on failed
    //
    PowerOnFailed                               : 4,
    //
    // No track data
    //
    NoTrackData                                 : 5,
    //
    // Invalid swipe
    //
    InvalidSwipe                                : 6,
    //
    // Swipe timeout
    //
    SwipeTimeout                                : 7,
    //
    // Keys exhausted
    //
    KeysExhausted                               : 8,
    //
    // Tampered
    //
    Tampered                                    : 9
};

/*!
 @class
 
 @brief Cancel reader reasons errors.
 
 @var Unknown Uknown.
 @var User User cancelled.
 */
EPS.Device.CardReader.CancelReason =
{
    //
    // Unknown
    //
    Unknown                                     : 0,
    //
    // User cancelled
    //
    User                                        : 1,
};

/*!
 @class
 
 @brief Card data statuses.
 
 @var Success Success.
 @var SuccessNoMasked No masked data.
 @var SuccessNoEncrypted No encrypted data.
 @var UnknownError Unknown error.
 @var TrackEmpty Track empty.
 */
EPS.Device.CardDataStatus =
{
    //
    // Success
    //
    Success                                     : 0,
    //
    // No masked data
    //
    SuccessNoMasked                             : 1,
    //
    // No encrypted data
    //
    SuccessNoEncrypted                          : 2,
    //
    // Unknown error
    //
    UnknownError                                : 3,
    //
    // Track empty
    //
    TrackEmpty                                  : 4
};

/*!
 @class
 
 @brief Encrypted format that should be used if/when sent to Express.
 
 @var Default Default, used for standard EPS encryption devices.
 @var Format1 Format 1, used for MagTek devices.
 @var Format2 Format 2, used for Ingenico DPP device.
 @var Format3 Format 3 used for Ingenico On-Guard devices.
 @var Format4 Format 4 used for IDTECH devices.
 */
EPS.Device.ExpressCardEncryptedFormat =
{
    //
    // Default, used for standard EPS encryption devices
    //
    Default                                     : 0,
    //
    // Format 1, used for MagTek devices
    //
    Format1                                     : 1,
    //
    // Format 2, used for Ingenico DPP device
    //
    Format2                                     : 2,
    //
    // Format 3 used for Ingenico On-Guard devices
    //
    Format3                                     : 3,
    //
    // Format 4 used for IDTECH devices
    //
    Format4                                     : 4
};

/*!
 @class
 
 @brief Security code statuses.
 
 @var NotProvided Not provided.
 @var Provided Provided.
 @var Illegible Illegible.
 */
EPS.Device.SecurityCodeStatus =
{
    //
    // Not provided
    //
    NotProvided                                 : 0,
    //
    // Provided
    //
    Provided                                    : 1,
    //
    // Illegible
    //
    Illegible                                   : 2
};

/*!
 @class
 
 @brief Definition of an onCardReaderSwipedInput event.
 
 @var data Property containing data for this event.
 */
EPS.Device.OnCardReaderSwipedInput =
{
    //
    // Property containing data for this event
    //
    data:
    {
        //
        // The raw output of the card reader. In some cases, this data may be sent directly to Express. <br /><br /><strong>NOTE:</strong> This may be null as raw data may not be available from all readers.
        //
        raw: null,
        
        //
        // Indicates how the card data may be used. This property may be more than one of the values defined by EPS.Device.CardDataUse.
        //
        uses: EPS.Device.CardDataUse.None,
    
        //
        // Track 1
        //
        track1:
        {
            //
            // Status for this track
            //
            status: EPS.Device.CardDataStatus.UnknownError,
            
            //
            // Track data including sentinels and checksum. Depending on whether the output is encrypted, this may be clear or masked data.
            //
            data: null,
               
            //
            // Track data excluding sentinels and checksum. Depending on whether the output is encrypted, this may be clear or masked data.
            //
            dataNoSentinels: null,

            //
            // Encrypted data block for this card data. This property is nil if the card data is not encrypted.
            //
            encryptedData: null,
        
            //
            // Key serial number for the encrypted data block for this card data. This property is nil if the card data is not encrypted.
            //
            keySerialNumber: null,
        
            //
            // The format of of the encrypted card data. If the encrypted parts are available and sent to Express, this is the value that should be used for the EncryptedFormat property in the Card class for Express messages.
            //
            encryptedFormat: EPS.Device.ExpressCardEncryptedFormat.Default
        },
        
        //
        // Track 2
        //
        track2:
        {
            //
            // Status for this track
            //
            status: EPS.Device.CardDataStatus.UnknownError,
            
            //
            // Track data including sentinels and checksum. Depending on whether the output is encrypted, this may be clear or masked data.
            //
            data: null,
               
            //
            // Track data excluding sentinels and checksum. Depending on whether the output is encrypted, this may be clear or masked data.
            //
            dataNoSentinels: null,

            //
            // Encrypted data block for this card data. This property is nil if the card data is not encrypted.
            //
            encryptedData: null,
        
            //
            // Key serial number for the encrypted data block for this card data. This property is nil if the card data is not encrypted.
            //
            keySerialNumber: null,
        
            //
            // The format of of the encrypted card data. If the encrypted parts are available and sent to Express, this is the value that should be used for the EncryptedFormat property in the Card class for Express messages.
            //
            encryptedFormat: EPS.Device.ExpressCardEncryptedFormat.Default
        },
        
        //
        // track 3
        //
        track3:
        {
            //
            // Status for this track
            //
            status: EPS.Device.CardDataStatus.UnknownError,
            
            //
            // Track data including sentinels and checksum. Depending on whether the output is encrypted, this may be clear or masked data.
            //
            data: null,
               
            //
            // Track data excluding sentinels and checksum. Depending on whether the output is encrypted, this may be clear or masked data.
            //
            dataNoSentinels: null,

            //
            // Encrypted data block for this card data. This property is nil if the card data is not encrypted.
            //
            encryptedData: null,
        
            //
            // Key serial number for the encrypted data block for this card data. This property is nil if the card data is not encrypted.
            //
            keySerialNumber: null,
        
            //
            // The format of of the encrypted card data. If the encrypted parts are available and sent to Express, this is the value that should be used for the EncryptedFormat property in the Card class for Express messages.
            //
            encryptedFormat: EPS.Device.ExpressCardEncryptedFormat.Default
        }
    }    
};

/*!
 @class
 
 @brief Definition of an onCardReaderManualInput event.
 
 @var data Property containing data for this event.
 */
EPS.Device.OnCardReaderManualInput =
{
    //
    // Property containing data for this event
    //
    data:
    {
        //
        // The raw output of the card reader. In some cases, this data may be sent directly to Express. <br /><br /><strong>NOTE:</strong> This may be null as raw data may not be available from all readers.
        //
        raw: null,
        
        //
        // Indicates how the card data may be used. This property may be more than one of the values defined by EPS.Device.CardDataUse.
        //
        uses: EPS.Device.CardDataUse.None,
    
        //
        // Manual
        //
        manual:
        {
            //
            // Account number for this card data. This property is masked if the card data is encrypted.
            //
            accountNumber: null,
            
            //
            // Expiration date for this card data. This property may be masked if the card data is encrypted.
            //
            expirationDate: null,
            
            //
            // The status of the security code.
            //
            securityCodeStatus: EPS.Device.SecurityCodeStatus.NotProvided,
            
            //
            // The manually keyed security code. This property is nil or masked if the card data is encrypted.
            //
            securityCode: null,
            
            //
            // Encrypted data block for this card data. This property is nil if the card data is not encrypted.
            //
            encryptedData: null,
        
            //
            // Key serial number for the encrypted data block for this card data. This property is nil if the card data is not encrypted.
            //
            keySerialNumber: null,
        
            //
            // The format of of the encrypted card data. If the encrypted parts are available and sent to Express, this is the value that should be used for the EncryptedFormat property in the Card class for Express messages.
            //
            encryptedFormat: EPS.Device.ExpressCardEncryptedFormat.Default
        }
    }
};
    
/*!
 @class
 
 @brief Definition of an onCardReaderCancelEntry event.
 
 @var error Property indicating an error occurred.
 */
EPS.Device.OnCardReaderCancelEntry =
{
    //
    // Property indicating an error occurred
    //
    error:
    {
        //
        // The reason the card reader input was cancelled.
        //
        reason: EPS.Device.CardReader.CancelReason.Unknown
    }
};

/*!
 @class
 
 @brief Definition of an onCardReaderError event.
 
 @var error Property indicating an error occurred.
 */
EPS.Device.OnCardReaderError =
{
    //
    // Property indicating an error occurred
    //
    error:
    {
        //
        // Code for the error that occurred.
        //
        code: EPS.Device.CardReader.Error.Unknown,
        
        //
        // Description for the error that occurred.
        //
        description: null
    }
};
    
/*!
 @class
 
 @brief Provides access to the device's PIN input functionality.

 This interface provides access to the devices PIN input capabilities.
 */
EPS.Device.PinPad = function ()
{
    EPS._Device._PinPad = this;
    
    /*!
     @brief Enable PIN entry with options.
    
     This method enables PIN entry with the specified options.
    
     @param prompt The prompt displayed on the device for card input.
    
     @param accountNumber The account used for PIN entry. This should be the account previously returned from the card reader.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.enable = function(prompt, accountNumber, successCallback, errorCallback)
    {
        try
        {
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'pinPadEnable', [ prompt, accountNumber ]);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->PinPad.enable: ' + ex)
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }        
    };  
    
    /*!
     @brief Disable the device.
    
     This method disables the device.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data) with the data parameter being optional.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data) with the data parameter being optional.
     */
    this.disable = function(successCallback, errorCallback)
    {
        try
        {
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Device', 'pinPadDisable', []);
        }
        catch (ex)
        {
            console.log('EPS.Device.js->PinPad.disable: ' + ex)
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }        
    };  
};

/*!
 @class
 
 @brief PIN pad errors.
 
 @var Unknown Unknown.
 @var InvalidParameter Invalid parameter.
 @var Tampered Tampered.
 */
EPS.Device.PinPad.Error =
{
    //
    // Unknown
    //
    Unknown                                     : 0,
    //
    // Invalid parameter
    //
    InvalidParameter                            : 1,
    //
    // Tampered
    //
    Tampered                                    : 2
};

/*!
 @class
 
 @brief PIN pad cancel reasons errors.
 
 @var Unknown Unknown.
 @var User User cancelled.
 */
EPS.Device.PinPad.CancelReason =
{
    //
    // Unknown
    //
    Unknown                                     : 0,
    //
    // User cancelled
    //
    User                                        : 1
};

/*!
 @class
 
 @brief Definition of an onPinPadInput event.
 
 @var data Property containing data for this event.
 */
EPS.Device.OnPinPadInput =
{
    //
    // Property containing data for this event.
    //
    data:
    {
        //
        // The encrypted PIN block.
        //
        pinBlock: null,
        
        //
        // The key serial number.
        //
        keySerialNumber: null
    }    
};

/*!
 @class
 
 @brief Definition of an onPinPadCancelEntry event.
 
 @var error Property indicating an error occurred.
 */
EPS.Device.OnPinPadCancelEntry =
{
    //
    // Property indicating an error occurred
    //
    error:
    {
        //
        // The reason the PIN input was cancelled.
        //
        reason: EPS.Device.PinPad.CancelReason.Unknown
    }
};

/*!
 @class
 
 @brief Definition of an onPinPadError event.

 @var error Property indicating an error occurred.
 */
EPS.Device.OnPinPadError =
{
    //
    // Property indicating an error occurred
    //
    error:
    {
        //
        // Code for the error that occurred.
        //
        code: EPS.Device.PinPad.Error.Unknown,
        
        //
        // Description for the error that occurred.
        //
        description: null
    }
};
