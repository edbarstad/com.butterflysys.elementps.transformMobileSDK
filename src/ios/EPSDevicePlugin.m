//
//  EPSDevicePlugin.m
//  TransForm® Mobile SDK PhoneGap
//

#import <EPSDevice/EPSDevice.h>

#import "EPSDevicePlugin.h"

#import "CDVPlugin+Extensions.h"

@interface EPSDevicePlugin() <EPSDeviceDelegate>
{
    EPSDevice *epsDevice;
    
    NSString *callbackId;
}

@end

@implementation EPSDevicePlugin

-(void)_init
{
    epsDevice = nil;
    
    callbackId = nil;
}

#if 0
-(id)init
{
    if ((self = [super init]) != nil)
    {
        [self _init];
    }
    
    return self;
}


-(CDVPlugin *)initWithWebView:(UIWebView*)theWebView settings:(NSDictionary*)classSettings
{
    if ((self = [super initWithWebView: theWebView settings: classSettings]) != nil)
    {
        [self _init];
    }
    
    return self;
}

-(CDVPlugin *)initWithWebView:(UIWebView*)theWebView
{
    if ((self = [super initWithWebView: theWebView]) != nil)
    {
        [self _init];
    }
    
    return self;
}
#else
- (void)pluginInitialize
{
    [super pluginInitialize];
    
    [self _init];
}
#endif

///
/// \brief The JavaScript side has started
///
/// This method serves no purpose other than passing a callback ID for passing events back to the JavaScript side.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
-(void)start:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    callbackId = [command.callbackId copy];
}

///
/// \brief The JavaScript side has stopped
///
/// This method indicates there are no more subscribers to any events on the JavaScript side.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
-(void)stop:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    callbackId = nil;
}

///
/// \brief EPSDevice deviceDidConnect delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceConnected' to the JavaScript side.
///
-(void)device:(EPSDevice *)device deviceDidConnect:(EPSDeviceType)type description:(NSString *)description capabilities:(EPSDeviceCapability)capabilities serialNumber:(NSString *)serialNumber error:(NSError *)error
{
#ifdef DEBUG
    NSLog(@"%s: desc=%@", __FUNCTION__, description);
#endif
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    if (error != nil)
    {
        NSMutableDictionary *eventError;
        
        eventError = [NSMutableDictionary dictionary];
        
        eventError[@"code"] = [NSNumber numberWithInt: error.code];
        
        if (error.localizedDescription != nil)
        {
            eventError[@"description"] = error.localizedDescription;
        }
        else
        {
            eventError[@"description"] = [NSString stringWithFormat: @"ERROR CODE %d", error.code];
        }
        
        event[@"error"] = eventError;
    }
    else
    {
        NSMutableDictionary *eventData;
        
        eventData = [NSMutableDictionary dictionary];
        
        eventData[@"type"] = [NSNumber numberWithInt: type];
        
        eventData[@"description"] = description;
        
        eventData[@"capabilities"] = [NSNumber numberWithInt: capabilities];
        
        if (serialNumber != nil)
        {
            eventData[@"serialNumber"] = serialNumber;
        }
        
        event[@"data"] = eventData;
    }
   
    [self fireEvent: @"onEPSDeviceConnected" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice deviceDidConnect delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceConnected' to the JavaScript side.
///
-(void)device:(EPSDevice *)device deviceDidDisconnect:(NSError *)error
{
#ifdef DEBUG
    NSLog(@"%s:", __FUNCTION__);
#endif
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    if (error != nil)
    {
        NSMutableDictionary *eventError;
        
        eventError = [NSMutableDictionary dictionary];
        
        eventError[@"code"] = [NSNumber numberWithInt: error.code];
        
        if (error.localizedDescription != nil)
        {
            eventError[@"description"] = error.localizedDescription;
        }
        else
        {
            eventError[@"description"] = [NSString stringWithFormat: @"ERROR CODE %d", error.code];
        }
        
        event[@"error"] = eventError;
    }
    
    [self fireEvent: @"onEPSDeviceDisconnected" callbackId: callbackId data: event];
}

///
/// \brief Start the device connection
///
/// This method is analogous to the startConnection method in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_OK.
///
-(void)startConnection:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    if (epsDevice == nil)
    {
        epsDevice = [EPSDevice sharedDevice];
        
        [epsDevice addDelegate: self];
    }
    
    BOOL doConnected;
    
    doConnected = NO;
    
    if (epsDevice.isConnected)
    {
        doConnected = YES;
    }
    else
    {
        [epsDevice startConnection];
    }
    
    CDVPluginResult* pluginResult;
    
    pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
    
    if (doConnected)
    {
        [self device: epsDevice deviceDidConnect: epsDevice.deviceType description: epsDevice.deviceDescription capabilities: epsDevice.deviceCapabilities serialNumber: epsDevice.deviceSerialNumber error: nil];
    }
}

///
/// \brief Stop the device connection
///
/// This method is analogous to the stopConnection method in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized. Otherwise, CDVCommandStatus_OK.
///
-(void)stopConnection:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief EPSDevice barcode reader didReceiveData delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceBarcodeReaderData' to the JavaScript side.
///
-(void)device:(EPSDevice *)device barcodeReader:(EPSDeviceBarcodeReader *)barcodeReader didReceiveData:(EPSDeviceBarcodeType)type data:(NSString *)data
{
#ifdef DEBUG
    NSLog(@"%s: data=%@", __FUNCTION__, data);
#endif
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"type"] = [NSNumber numberWithInt: type];
    
    eventData[@"data"] = data;
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDeviceBarcodeReaderData" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice barcode reader didReceiveButtonPress delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceBarcodeReaderButtonPress' to the JavaScript side.
///
-(void)device:(EPSDevice *)device barcodeReader:(EPSDeviceBarcodeReader *)barcodeReader didReceiveButtonPress:(EPSDeviceBarcodeReaderButtonType)button
{
#ifdef DEBUG
    NSLog(@"%s: but=%d", __FUNCTION__, button);
#endif
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"button"] = [NSNumber numberWithInt: button];
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDeviceBarcodeReaderButtonPress" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice barcode reader didReceiveButtonRelease delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceBarcodeReaderButtonRelease' to the JavaScript side.
///
-(void)device:(EPSDevice *)device barcodeReader:(EPSDeviceBarcodeReader *)barcodeReader didReceiveButtonRelease:(EPSDeviceBarcodeReaderButtonType)button
{
#ifdef DEBUG
    NSLog(@"%s: but=%d", __FUNCTION__, button);
#endif
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"button"] = [NSNumber numberWithInt: button];
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDeviceBarcodeReaderButtonRelease" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice barcode reader didReceiveError delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceBarcodeReaderError' to the JavaScript side.
///
-(void)device:(EPSDevice *)device barcodeReader:(EPSDeviceBarcodeReader *)barcodeReader didReceiveError:(NSError *)error
{
#ifdef DEBUG
    NSLog(@"%s: err=%d", __FUNCTION__, error.code);
#endif
    
    [barcodeReader disable: nil];
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    if (error != nil)
    {
        NSMutableDictionary *eventError;
        
        eventError = [NSMutableDictionary dictionary];
        
        eventError[@"code"] = [NSNumber numberWithInt: error.code];
        
        if (error.localizedDescription != nil)
        {
            eventError[@"description"] = error.localizedDescription;
        }
        else
        {
            eventError[@"description"] = [NSString stringWithFormat: @"ERROR CODE %d", error.code];
        }
        
        event[@"error"] = eventError;
    }
    
    [self fireEvent: @"onEPSDeviceBarcodeReaderError" callbackId: callbackId data: event];
}

///
/// \brief Enables the barcode reader
///
/// This method is analogous to the barcode reader enable method in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support barcode input, the barcode reader has not been initialized, or there is an error enabling the barcode reader. Otherwise, CDVCommandStatus_OK.
///
-(void)barcodeEnable:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilityBarcodeReader) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support barcode input"];
    }
    else if (epsDevice.barcodeReader == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device barcode reader not initialized"];
    }
    else
    {
        NSError *err;
        
        if ([epsDevice.barcodeReader enable: &err])
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
        }
        else if (err != nil && err.localizedDescription != nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: err.localizedDescription];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: [NSString stringWithFormat: @"ERROR CODE %d", err.code]];
        }
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief Disable the barcode reader
///
/// This method is analogous to the barcode reader disable method in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support barcode input, the barcode reader has not been initialized, or there is an error disabling the barcode reader. Otherwise, CDVCommandStatus_OK.
///
-(void)barcodeDisable:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilityBarcodeReader) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support barcode input"];
    }
    else if (epsDevice.cardReader == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device barcode reader not initialized"];
    }
    else
    {
        NSError *err;
        
        if ([epsDevice.barcodeReader disable: &err])
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
        }
        else if (err != nil && err.localizedDescription != nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: err.localizedDescription];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: [NSString stringWithFormat: @"ERROR CODE %d", err.code]];
        }
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief Start a barcode
///
/// This method is analogous to the barcode reader startScan method in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support barcode input, or the barcode reader has not been initialized,. Otherwise, CDVCommandStatus_OK.
///
-(void)barcodeStartScan:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilityBarcodeReader) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support barcode input"];
    }
    else if (epsDevice.barcodeReader == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device barcode reader not initialized"];
    }
    else
    {
        [epsDevice.barcodeReader startScan];
        
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief Stop the barcode scan
///
/// This method is analogous to the barcode reader stopScan method in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support barcode input, or the barcode reader has not been initialized. Otherwise, CDVCommandStatus_OK.
///
-(void)barcodeStopScan:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilityBarcodeReader) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support barcode input"];
    }
    else if (epsDevice.barcodeReader == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device barcode reader not initialized"];
    }
    else
    {
        [epsDevice.barcodeReader stopScan];
        
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief EPSDevice battery batteryChargeStateDidChange delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceBatteryChargeStateChanged' to the JavaScript side.
///
-(void)device:(EPSDevice *)device battery:(EPSDeviceBattery *)battery batteryChargeStateDidChange:(BOOL)charging chargingiOSDevice:(BOOL)chargingiOSDevice chargeLevel:(int)chargeLevel voltage:(float)voltage
{
#ifdef DEBUG
    NSLog(@"%s:", __FUNCTION__);
#endif
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"charging"] = [NSNumber numberWithBool: charging];
    
    eventData[@"chargingDevice"] = [NSNumber numberWithBool: chargingiOSDevice];
    
    eventData[@"chargeLevel"] = [NSNumber numberWithInt: chargeLevel];
    
    eventData[@"voltage"] = [NSNumber numberWithFloat: voltage];
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDeviceBatteryChargeStateChanged" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice battery batteryChargeLevelDidChange delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceBatteryChargeLevelChanged' to the JavaScript side.
///
-(void)device:(EPSDevice *)device battery:(EPSDeviceBattery *)battery batteryChargeLevelDidChange:(BOOL)charging chargingiOSDevice:(BOOL)chargingiOSDevice chargeLevel:(int)chargeLevel voltage:(float)voltage
{
#ifdef DEBUG
    NSLog(@"%s:", __FUNCTION__);
#endif
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"charging"] = [NSNumber numberWithBool: charging];
    
    eventData[@"chargingDevice"] = [NSNumber numberWithBool: chargingiOSDevice];
    
    eventData[@"chargeLevel"] = [NSNumber numberWithInt: chargeLevel];
    
    eventData[@"voltage"] = [NSNumber numberWithFloat: voltage];
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDeviceBatteryChargeLevelChanged" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice battery batteryVoltageLevelDidChange delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceBatteryVoltageLevelChanged' to the JavaScript side.
///
-(void)device:(EPSDevice *)device battery:(EPSDeviceBattery *)battery batteryVoltageLevelDidChange:(BOOL)charging chargingiOSDevice:(BOOL)chargingiOSDevice chargeLevel:(int)chargeLevel voltage:(float)voltage
{
#ifdef DEBUG
    NSLog(@"%s:", __FUNCTION__);
#endif
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"charging"] = [NSNumber numberWithBool: charging];
    
    eventData[@"chargingDevice"] = [NSNumber numberWithBool: chargingiOSDevice];
    
    eventData[@"chargeLevel"] = [NSNumber numberWithInt: chargeLevel];
    
    eventData[@"voltage"] = [NSNumber numberWithFloat: voltage];
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDeviceBatteryVoltageLevelChanged" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice battery batteryChargeLevelDidReachFull delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceBatteryChargeReachedFull' to the JavaScript side.
///
-(void)device:(EPSDevice *)device battery:(EPSDeviceBattery *)battery batteryChargeLevelDidReachFull:(BOOL)charging chargingiOSDevice:(BOOL)chargingiOSDevice chargeLevel:(int)chargeLevel voltage:(float)voltage
{
#ifdef DEBUG
    NSLog(@"%s:", __FUNCTION__);
#endif
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"charging"] = [NSNumber numberWithBool: charging];
    
    eventData[@"chargingDevice"] = [NSNumber numberWithBool: chargingiOSDevice];
    
    eventData[@"chargeLevel"] = [NSNumber numberWithInt: chargeLevel];
    
    eventData[@"voltage"] = [NSNumber numberWithFloat: voltage];
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDeviceBatteryChargeReachedFull" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice battery batteryChargeLevelDidReachCritical delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceBatteryChargeReachedCritical' to the JavaScript side.
///
-(void)device:(EPSDevice *)device battery:(EPSDeviceBattery *)battery batteryChargeLevelDidReachCritical:(BOOL)charging chargingiOSDevice:(BOOL)chargingiOSDevice chargeLevel:(int)chargeLevel voltage:(float)voltage
{
#ifdef DEBUG
    NSLog(@"%s:", __FUNCTION__);
#endif
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"charging"] = [NSNumber numberWithBool: charging];
    
    eventData[@"chargingDevice"] = [NSNumber numberWithBool: chargingiOSDevice];
    
    eventData[@"chargeLevel"] = [NSNumber numberWithInt: chargeLevel];
    
    eventData[@"voltage"] = [NSNumber numberWithFloat: voltage];
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDeviceBatteryChargeReachedCritical" callbackId: callbackId data: event];
}

///
/// \brief Enables the device battery functionality
///
/// This method is analogous to the battery enable method in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support battery, the battery has not been initialized, or there is an error enabling the battery. Otherwise, CDVCommandStatus_OK.
///
-(void)batteryEnable:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    BOOL doBattery;
    
    doBattery = NO;
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilityBatteryCanChargeiOSDevice) == 0 &&
             (epsDevice.deviceCapabilities & EPSDeviceCapabilityBatteryStatus) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support battery"];
    }
    else if (epsDevice.battery == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device battery not initialized"];
    }
    else if (epsDevice.battery.isEnabled)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
        
        doBattery = YES;
    }
    else
    {
        NSError *err;
        
        if ([epsDevice.battery enable: &err])
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
        }
        else if (err != nil && err.localizedDescription != nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: err.localizedDescription];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: [NSString stringWithFormat: @"ERROR CODE %d", err.code]];
        }
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
    
    if (doBattery)
    {
        [self device: epsDevice battery: epsDevice.battery batteryVoltageLevelDidChange: epsDevice.battery.isCharging chargingiOSDevice: epsDevice.battery.isChargingiOSDevice chargeLevel: epsDevice.battery.chargeLevel voltage: epsDevice.battery.voltage];
    }
}

///
/// \brief Disable the devices battery functionality
///
/// This method is analogous to the battery disable method in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support battery, the battery has not been initialized, or there is an error disabling the battery. Otherwise, CDVCommandStatus_OK.
///
-(void)batteryDisable:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilityBatteryCanChargeiOSDevice) == 0 &&
             (epsDevice.deviceCapabilities & EPSDeviceCapabilityBatteryStatus) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support battery"];
    }
    else if (epsDevice.battery == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device battery not initialized"];
    }
    else
    {
        NSError *err;
        
        if ([epsDevice.battery disable: &err])
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
        }
        else if (err != nil && err.localizedDescription != nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: err.localizedDescription];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: [NSString stringWithFormat: @"ERROR CODE %d", err.code]];
        }
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief Enables charging the device
///
/// This method is analogous to the battery enableChargeiOSDevice in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support charging the iOS device, the battery has not been initialized, or there is an error enabling charging the iOS device. Otherwise, CDVCommandStatus_OK.
///
-(void)batteryEnableChargeDevice:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilityBatteryCanChargeiOSDevice) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support battery charge iOS device"];
    }
    else if (epsDevice.battery == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device battery not initialized"];
    }
    else
    {
        NSError *err;
        
        if ([epsDevice.battery enableChargeiOSDevice: &err])
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
        }
        else if (err != nil && err.localizedDescription != nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: err.localizedDescription];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: [NSString stringWithFormat: @"ERROR CODE %d", err.code]];
        }
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief Disables charging the device
///
/// This method is analogous to the battery disableChargeiOSDevice in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support charging the iOS device, the battery has not been initialized, or there is an error disabling charging the iOS device. Otherwise, CDVCommandStatus_OK.
///
-(void)batteryDisableChargeDevice:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilityBatteryCanChargeiOSDevice) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support battery charge iOS device"];
    }
    else if (epsDevice.battery == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device battery not initialized"];
    }
    else
    {
        NSError *err;
        
        if ([epsDevice.battery disableChargeiOSDevice: &err])
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
        }
        else if (err != nil && err.localizedDescription != nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: err.localizedDescription];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: [NSString stringWithFormat: @"ERROR CODE %d", err.code]];
        }
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief EPSDevice card reader didReceiveSwipedInput delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceCardReaderSwipedInput' to the JavaScript side.
///
-(void)device:(EPSDevice *)device cardReader:(EPSDeviceCardReader *)cardReader didReceiveSwipedInput:(NSString *)raw uses:(EPSDeviceCardDataUse)uses track1:(EPSDeviceCardDataTrack *)track1 track2:(EPSDeviceCardDataTrack *)track2 track3:(EPSDeviceCardDataTrack *)track3
{
#ifdef DEBUG
    NSLog(@"%s:", __FUNCTION__);
#endif
    
    [cardReader disable: nil];
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"raw"] = raw;
    
    eventData[@"uses"] = [NSNumber numberWithInt: uses];
    
    NSMutableDictionary *eventTrack;
    
    if (track1 != nil)
    {
        eventTrack = [NSMutableDictionary dictionary];
        
        eventTrack[@"status"] = [NSNumber numberWithInt: track1.status];
        
        if (track1.data != nil)
        {
            eventTrack[@"data"] = track1.data;
            
            if (uses & EPSDeviceCardDataUseClearParts)
            {
                EPSDeviceCardDataFinancialTrack1 *t1;
            
                if ((t1 = [[EPSDeviceCardDataFinancialTrack1 alloc] initWithTrackData: track1]).dataNoSentinels != nil)
                {
                    eventTrack[@"dataNoSentinels"] = t1.dataNoSentinels;
                }
            }
        }
        
        if (track1.encryptedData != nil)
        {
            eventTrack[@"encryptedData"] = track1.encryptedData;
        }
        
        if (track1.keySerialNumber != nil)
        {
            eventTrack[@"keySerialNumber"] = track1.keySerialNumber;
        }
        
        eventTrack[@"encryptedFormat"] = [NSNumber numberWithInt: track1.encryptedFormat];
        
        eventData[@"track1"] = eventTrack;
    }
    
    if (track2 != nil)
    {
        eventTrack = [NSMutableDictionary dictionary];
        
        eventTrack[@"status"] = [NSNumber numberWithInt: track2.status];
        
        if (track2.data != nil)
        {
            eventTrack[@"data"] = track2.data;
            
            if (uses & EPSDeviceCardDataUseClearParts)
            {
                EPSDeviceCardDataFinancialTrack2 *t2;
                
                if ((t2 = [[EPSDeviceCardDataFinancialTrack2 alloc] initWithTrackData: track2]).dataNoSentinels != nil)
                {
                    eventTrack[@"dataNoSentinels"] = t2.dataNoSentinels;
                }
            }
        }
        
        if (track2.encryptedData != nil)
        {
            eventTrack[@"encryptedData"] = track2.encryptedData;
        }
        
        if (track2.keySerialNumber != nil)
        {
            eventTrack[@"keySerialNumber"] = track2.keySerialNumber;
        }
        
        eventTrack[@"encryptedFormat"] = [NSNumber numberWithInt: track2.encryptedFormat];
        
        eventData[@"track2"] = eventTrack;
    }
    
    if (track3 != nil)
    {
        eventTrack = [NSMutableDictionary dictionary];
        
        eventTrack[@"status"] = [NSNumber numberWithInt: track3.status];
        
        if (track3.data != nil)
        {
            eventTrack[@"data"] = track3.data;
        }
        
        if (track3.encryptedData != nil)
        {
            eventTrack[@"encryptedData"] = track3.encryptedData;
        }
        
        if (track3.keySerialNumber != nil)
        {
            eventTrack[@"keySerialNumber"] = track3.keySerialNumber;
        }
        
        eventTrack[@"encryptedFormat"] = [NSNumber numberWithInt: track3.encryptedFormat];
        
        eventData[@"track3"] = eventTrack;
    }
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDeviceCardReaderSwipedInput" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice card reader didReceiveManualInput delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceCardReaderManualInput' to the JavaScript side.
///
-(void)device:(EPSDevice *)device cardReader:(EPSDeviceCardReader *)cardReader didReceiveManualInput:(NSString *)raw uses:(EPSDeviceCardDataUse)uses manual:(EPSDeviceCardDataManual *)manual
{
#ifdef DEBUG
    NSLog(@"%s:", __FUNCTION__);
#endif
    
    [cardReader disable: nil];
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"raw"] = raw;
    
    eventData[@"uses"] = [NSNumber numberWithInt: uses];
    
    NSMutableDictionary *eventTrack;
    
    if (manual != nil)
    {
        eventTrack = [NSMutableDictionary dictionary];
        
        eventTrack[@"status"] = [NSNumber numberWithInt: manual.status];
        
        if (manual.accountNumber != nil)
        {
            eventTrack[@"accountNumber"] = manual.accountNumber;
        }
        
        if (manual.expirationDate != nil)
        {
            eventTrack[@"expirationDate"] = manual.expirationDate;
        }
        
        eventTrack[@"securityCodeStatus"] = [NSNumber numberWithInt: manual.securityCodeStatus];

        if (manual.securityCode != nil)
        {
        eventTrack[@"securityCode"] = manual.securityCode;
        }
        
        if (manual.encryptedData != nil)
        {
            eventTrack[@"encryptedData"] = manual.encryptedData;
        }
        
        if (manual.keySerialNumber != nil)
        {
            eventTrack[@"keySerialNumber"] = manual.keySerialNumber;
        }
        
        eventTrack[@"encryptedFormat"] = [NSNumber numberWithInt: manual.encryptedFormat];
        
        eventData[@"manual"] = eventTrack;
    }
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDeviceCardReaderManualInput" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice card reader didReceiveCancelEntry delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceCardReaderCancelEntry' to the JavaScript side.
///
-(void)device:(EPSDevice *)device cardReader:(EPSDeviceCardReader *)cardReader didReceiveCancelEntry:(NSError *)reason
{
#ifdef DEBUG
    NSLog(@"%s: reason=%d", __FUNCTION__, reason.code);
#endif
    
    [cardReader disable: nil];

    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"reason"] = [NSNumber numberWithInt: reason.code];
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDeviceCardReaderCancelEntry" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice card reader didReceiveError delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDeviceCardReaderError' to the JavaScript side.
///
-(void)device:(EPSDevice *)device cardReader:(EPSDeviceCardReader *)cardReader didReceiveError:(NSError *)error
{
#ifdef DEBUG
    NSLog(@"%s: err=%d", __FUNCTION__, error.code);
#endif
    
    [cardReader disable: nil];

    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    if (error != nil)
    {
        NSMutableDictionary *eventError;
        
        eventError = [NSMutableDictionary dictionary];
        
        eventError[@"code"] = [NSNumber numberWithInt: error.code];
        
        if (error.localizedDescription != nil)
        {
            eventError[@"description"] = error.localizedDescription;
        }
        else
        {
            eventError[@"description"] = [NSString stringWithFormat: @"ERROR CODE %d", error.code];
        }
        
        event[@"error"] = eventError;
    }
    
    [self fireEvent: @"onEPSDeviceCardReaderError" callbackId: callbackId data: event];
}

///
/// \brief Enables card reader
///
/// This method is analogous to the card reader enable in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support the card reader, the card reader has not been initialized, or there is an error enabling the card reader. Otherwise, CDVCommandStatus_OK.
///
-(void)cardReaderEnable:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilitySwipeCardReader) == 0 &&
             (epsDevice.deviceCapabilities & EPSDeviceCapabilityManualCardEntry) == 0 &&
             (epsDevice.deviceCapabilities & EPSDeviceCapabilityContactlessCardReader) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support card input"];
    }
    else if (epsDevice.cardReader == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device card reader not initialized"];
    }
    else
    {
        NSString *prompt;
        
        prompt = (epsDevice.deviceCapabilities & EPSDeviceCapabilityManualCardEntry) ? @"Swipe or key card" : @"Swipe card";
        
        BOOL allowManual;
        
        allowManual = NO;
        
        BOOL allowTrack1;
        
        allowTrack1 = YES;
        
        BOOL allowTrack2;
        
        allowTrack2 = YES;
        
        for (int i = 0; i < command.arguments.count; i++)
        {
            switch (i)
            {
                case 0:
                    if ([command.arguments[i] isKindOfClass: [NSString class]])
                    {
                        prompt = (NSString *)command.arguments[i];
                    }
                    break;
                    
                case 1:
                    if ([command.arguments[i] isKindOfClass: [NSNumber class]])
                    {
                        allowManual = ((NSNumber *)command.arguments[i]).boolValue;
                    }
                    break;
                    
                case 2:
                    if ([command.arguments[i] isKindOfClass: [NSNumber class]])
                    {
                        allowTrack1 = ((NSNumber *)command.arguments[i]).boolValue;
                    }
                    break;
                    
                case 3:
                    if ([command.arguments[i] isKindOfClass: [NSNumber class]])
                    {
                        allowTrack2 = ((NSNumber *)command.arguments[i]).boolValue;
                    }
                    break;
                    
                default:
                    break;
            }
        }
        
        NSError *err;
        
        if ([epsDevice.cardReader enableWithOptions: prompt allowManual: allowManual allowTrack1: allowTrack1 allowTrack2: allowTrack2 error: &err])
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
        }
        else if (err != nil && err.localizedDescription != nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: err.localizedDescription];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: [NSString stringWithFormat: @"ERROR CODE %d", err.code]];
        }
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief Disables card reader
///
/// This method is analogous to the card reader disable in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support the card reader, the card reader has not been initialized, or there is an error disabling the card reader. Otherwise, CDVCommandStatus_OK.
///
-(void)cardReaderDisable:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilitySwipeCardReader) == 0 &&
             (epsDevice.deviceCapabilities & EPSDeviceCapabilityManualCardEntry) == 0 &&
             (epsDevice.deviceCapabilities & EPSDeviceCapabilityContactlessCardReader) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support card input"];
    }
    else if (epsDevice.cardReader == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device card reader not initialized"];
    }
    else
    {
        NSError *err;
        
        if ([epsDevice.cardReader disable: &err])
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
        }
        else if (err != nil && err.localizedDescription != nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: err.localizedDescription];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: [NSString stringWithFormat: @"ERROR CODE %d", err.code]];
        }
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief EPSDevice PIN pad didReceiveInput delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDevicePinPadInput' to the JavaScript side.
///
-(void)device:(EPSDevice *)device pinPad:(EPSDevicePinPad *)pinPad didReceiveInput:(NSString *)pinBlock keySerialNumber:(NSString *)keySerialNumber
{
#ifdef DEBUG
    NSLog(@"%s:", __FUNCTION__);
#endif
    
    [pinPad disable: nil];
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"pinBlock"] = pinBlock;
    
    eventData[@"keySerialNumber"] = keySerialNumber;
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDevicePinPadInput" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice PIN pad didReceiveCancelEntry delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDevicePinPadCancelEntry' to the JavaScript side.
///
-(void)device:(EPSDevice *)device pinPad:(EPSDevicePinPad *)pinPad didReceiveCancelEntry:(NSError *)reason
{
#ifdef DEBUG
    NSLog(@"%s: reason=%d", __FUNCTION__, reason.code);
#endif
    
    [pinPad disable: nil];
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *eventData;
    
    eventData = [NSMutableDictionary dictionary];
    
    eventData[@"reason"] = [NSNumber numberWithInt: reason.code];
    
    event[@"data"] = eventData;
    
    [self fireEvent: @"onEPSDevicePinPadCancelEntry" callbackId: callbackId data: event];
}

///
/// \brief EPSDevice PIN pad didReceiveError delegate method
///
/// For more information, see the EPSDevice framework documentation.
///
/// This method send a 'onEPSDevicePinPadError' to the JavaScript side.
///
-(void)device:(EPSDevice *)device pinPad:(EPSDevicePinPad *)pinPad didReceiveError:(NSError *)error
{
#ifdef DEBUG
    NSLog(@"%s: err=%d", __FUNCTION__, error.code);
#endif
    
    [pinPad disable: nil];
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    if (error != nil)
    {
        NSMutableDictionary *eventError;
        
        eventError = [NSMutableDictionary dictionary];
        
        eventError[@"code"] = [NSNumber numberWithInt: error.code];
        
        if (error.localizedDescription != nil)
        {
            eventError[@"description"] = error.localizedDescription;
        }
        else
        {
            eventError[@"description"] = [NSString stringWithFormat: @"ERROR CODE %d", error.code];
        }
        
        event[@"error"] = eventError;
    }
    
    [self fireEvent: @"onEPSDevicePinPadError" callbackId: callbackId data: event];
}

///
/// \brief Enables PIN input
///
/// This method is analogous to the PIN pad enable in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support PIN input, the PIN pad has not been initialized, or there is an error enabling the PIN Pad. Otherwise, CDVCommandStatus_OK.
///
-(void)pinPadEnable:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilityPinPad) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support PIN input"];
    }
    else if (epsDevice.pinPad == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device PIN pad not initialized"];
    }
    else
    {
        NSString *prompt;
        
        prompt = @"Enter PIN";
        
        NSString *account;
        
        account = nil;
        
        for (int i = 0; i < command.arguments.count; i++)
        {
            switch (i)
            {
                case 0:
                    if ([command.arguments[i] isKindOfClass: [NSString class]])
                    {
                        prompt = (NSString *)command.arguments[i];
                    }
                    break;
                    
                case 1:
                    if ([command.arguments[i] isKindOfClass: [NSString class]])
                    {
                        account = (NSString *)command.arguments[i];
                    }
                    break;

                default:
                    break;
            }
        }
        
        NSError *err;
        
        if ([epsDevice.pinPad enableWithOptions: prompt accountNumber: account error: &err])
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
        }
        else if (err != nil && err.localizedDescription != nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: err.localizedDescription];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: [NSString stringWithFormat: @"ERROR CODE %d", err.code]];
        }
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief Disables PIN input
///
/// This method is analogous to the PIN pad disable in the EPSDevice framework. For more information, see the EPSDevice framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if the device has not been initialized, the device does not support PIN input, the PIN pad has not been initialized, or there is an error disabling the PIN Pad. Otherwise, CDVCommandStatus_OK.
///
-(void)pinPadDisable:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d cbid=%@", __FUNCTION__, command.arguments.count, command.callbackId);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (epsDevice == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device not initialized"];
    }
    else if ((epsDevice.deviceCapabilities & EPSDeviceCapabilityPinPad) == 0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device does not support card input"];
    }
    else if (epsDevice.pinPad == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"EPS device card reader not initialized"];
    }
    else
    {
        NSError *err;
        
        if ([epsDevice.pinPad disable: &err])
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
        }
        else if (err != nil && err.localizedDescription != nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: err.localizedDescription];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: [NSString stringWithFormat: @"ERROR CODE %d", err.code]];
        }
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}
@end
