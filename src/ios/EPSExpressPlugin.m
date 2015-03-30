//
//  EPSExpressPlugin.m
//  TransForm® Mobile SDK PhoneGap
//

#import <EPSExpress/EPSExpress.h>

#include <objc/runtime.h>

#import "EPSExpressPlugin.h"

#import "AppDelegate.h"

#import "CDVPlugin+Extensions.h"

@interface EPSExpressPlugin()
{
    NSURL *hostedPaymentsResponseUrl;
    
    NSDate *hostedPaymentsResponseDate;

    NSString *callbackId;
}

@end

@implementation EPSExpressPlugin

-(void)_init
{
    hostedPaymentsResponseUrl = nil;
    
    hostedPaymentsResponseDate = nil;
    
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

typedef enum _EPSPropertyTypes
{
    propTypeUnknown,
    propTypeString,
    propTypeBool,
    propTypeNumber,
    propTypeAmount,
    propTypeInt,
    propTypeDateTime,
    propTypeUrl,
    propTypeArray,
    propTypeClass,
}   EPSPropertyTypes;

///
/// \brief Converts an EPSExpress object to a dictionary
///
/// Converts an EPSExpress object to a dictionary suitable for passing to the JavaScript side.
///
/// \param object The object to convert. This method is used recursively so this may be an EPSExpres object or another object defined in the EPSExpress framework.
///
/// \return An NSDictionary representing the EPSExpress object.
///
-(NSDictionary *)expressToDict:(NSObject *)object
{
    NSMutableDictionary *ret;
    
    ret = [NSMutableDictionary dictionary];
    
    if (object != nil)
    {
        unsigned int propCount;
        
        objc_property_t *props;
        
        if ((props = class_copyPropertyList([object class], &propCount)) != nil)
        {
            NSMutableArray *newItems;
            
            newItems = [NSMutableArray array];
            
            for (unsigned int p = 0; p < propCount; p++)
            {
#ifdef DEBUG
                NSLog(@"p=%s", property_getName(props[p]));
#endif
                
                EPSPropertyTypes propType;
                
                propType = propTypeUnknown;
                
                NSString *propTypeName;
                
                propTypeName = nil;
                
                unsigned int attrCount;
                
                objc_property_attribute_t *attrs;
                
                if ((attrs = property_copyAttributeList(props[p], &attrCount)) != nil)
                {
                    for (unsigned int a = 0; a < attrCount; a++)
                    {
#ifdef DEBUG
                        NSLog(@"  n=%s v=%s", attrs[a].name, attrs[a].value);
#endif
                        
                        if (attrs[a].name[0] == 'T')
                        {
                            propTypeName = [[NSString alloc] initWithCString: attrs[a].value encoding: NSASCIIStringEncoding];
                            
                            if (strcmp(attrs[a].value, "@\"NSString\"") == 0)
                            {
                                propType = propTypeString;
                            }
                            else if (strcmp(attrs[a].value, @encode(BOOL)) == 0)
                            {
                                propType = propTypeBool;
                            }
                            else if (strcmp(attrs[a].value, "@\"NSNumber\"") == 0)
                            {
                                propType = propTypeNumber;
                            }
                            else if (strcmp(attrs[a].value, "@\"NSDecimalNumber\"") == 0)
                            {
                                propType = propTypeAmount;
                            }
                            else if (strcmp(attrs[a].value, @encode(int)) == 0)
                            {
                                propType = propTypeInt;
                            }
                            else if (strcmp(attrs[a].value, "@\"NSDate\"") == 0)
                            {
                                propType = propTypeDateTime;
                            }
                            else if (strcmp(attrs[a].value, "@\"NSURL\"") == 0)
                            {
                                propType = propTypeUrl;
                            }
                            else if (strcmp(attrs[a].value, "@\"NSArray\"") == 0)
                            {
                                propType = propTypeArray;
                            }
                            else if (attrs[a].value[0] == '@')
                            {
                                propType = propTypeClass;
                            }
                            
                            break;
                        }
                    }
                    
                    free(attrs);
                }
                
                NSString *propName;
                
                propName = [[NSString alloc] initWithCString: property_getName(props[p]) encoding: NSASCIIStringEncoding];
                
                NSObject *val;
                
                val = [object valueForKey: propName];
                
                switch (propType)
                {
                    case propTypeString:
                        if (val != EPSExpressStringNotSet)
                        {
                            ret[propName] = val;
                        }
                        break;
                        
                    case propTypeBool:
                        ret[propName] = val;
                        break;
                        
                    case propTypeNumber:
                        if ((NSNumber *)val != EPSExpressIntegerNotSet)
                        {
                            ret[propName] = val;
                        }
                        break;
                        
                    case propTypeAmount:
                        if ((NSDecimalNumber *)val != EPSExpressAmountNotSet)
                        {
                            ret[propName] = val;
                        }
                        break;
                        
                    case propTypeInt:
                        if ([(NSNumber *)val intValue] != EPSExpressEnumNotSet)
                        {
                            ret[propName] = val;
                        }
                        break;
                        
                    case propTypeDateTime:
                        /*
                         * any of these should be a convenience properties
                         */
                        break;
                        
                    case propTypeUrl:
                        if (val != EPSExpressClassNotSet)
                        {
                            ret[propName] = [(NSURL *)val absoluteString];
                        }
                        break;
                        
                    case propTypeClass:
                        if (class_getSuperclass(NSClassFromString([[propTypeName stringByReplacingOccurrencesOfString: @"@" withString: @""] stringByReplacingOccurrencesOfString: @"\"" withString: @""])) == [EPSExpressBase class])
                        {
                            ret[propName] = [self expressToDict: (EPSExpressBase *)val];
                        }
                        break;

                    case propTypeArray:
                        if (val != nil && ((NSArray *)val).count > 0 && [((NSArray *)val)[0] isKindOfClass: [EPSExpressBase class]])
                        {
                            NSMutableArray *items;
                            
                            items = [NSMutableArray arrayWithCapacity: ((NSArray *)val).count];
                            
                            for (int i = 0; i < ((NSArray *)val).count; i++)
                            {
                                items[i] = [self expressToDict: (EPSExpressBase *)(((NSArray *)val)[0])];
                            }

                            ret[propName] = [NSArray arrayWithArray: items];
                        }
                        break;
                        
                    case propTypeUnknown:
                    default:
                        /*
                         * this is for development purposes only and should never be reached in released code
                         */
                        [[NSException exceptionWithName: @"TypeNotImplementedException" reason: [NSString stringWithFormat: @"Express to dict type \"%@\" not implemented", propTypeName] userInfo: nil] raise];
                        break;
                }
            }
            
            free(props);
        }
    }
    
    return [NSDictionary dictionaryWithDictionary: ret];
}

///
/// \brief Converts a dictionary to an Express object.
///
/// Converts a dictionary from JavaScript side to an Express oject.
///
/// \param dict An NSDictionary containing the name/value pairs to create the object.
///
/// \return An an EPSExpress object representing the data from the dictionary.
///
-(EPSExpress *)dictToExpress:(NSDictionary *)dict
{
    return [self dictToExpress: dict name: nil];
}

///
/// \brief Converts a dictionary to an Express object.
///
/// Converts a dictionary from JavaScript side to an Express oject.
///
/// \param dict An NSDictionary containing the name/value pairs to create the object.
///
/// \param name The name of this property from the parent class. This name is used to create the new object.
///
/// \return An an object representing the data from the dictionary. This method is used recursively so it may return an EPSExpress object or any other object defined in the EPSExpress framework.
///
-(id)dictToExpress:(NSDictionary *)dict name:(NSString *)name
{
    id object;
    
    object = nil;

    if (dict != nil)
    {
        if (name == nil)
        {
            name = @"";
        }
        
        if ((object = [[NSClassFromString([NSString stringWithFormat: @"EPSExpress%@", name]) alloc] init]) != nil && dict.count > 0)
        {
            unsigned int propCount;
            
            objc_property_t *props;
            
            if ((props = class_copyPropertyList([object class], &propCount)) != nil)
            {
                NSMutableArray *newItems;
                
                newItems = [NSMutableArray array];
                
                for (unsigned int p = 0; p < propCount; p++)
                {
#ifdef DEBUG
                    NSLog(@"p=%s", property_getName(props[p]));
#endif
                    
                    EPSPropertyTypes propType;
                    
                    propType = propTypeUnknown;
                    
                    NSString *propTypeName;
                    
                    propTypeName = nil;
                    
                    unsigned int attrCount;
                    
                    objc_property_attribute_t *attrs;
                    
                    if ((attrs = property_copyAttributeList(props[p], &attrCount)) != nil)
                    {
                        for (unsigned int a = 0; a < attrCount; a++)
                        {
#ifdef DEBUG
                            NSLog(@"  n=%s v=%s", attrs[a].name, attrs[a].value);
#endif
                            
                            if (attrs[a].name[0] == 'T')
                            {
                                propTypeName = [[NSString alloc] initWithCString: attrs[a].value encoding: NSASCIIStringEncoding];
                                
                                if (strcmp(attrs[a].value, "@\"NSString\"") == 0)
                                {
                                    propType = propTypeString;
                                }
                                else if (strcmp(attrs[a].value, @encode(BOOL)) == 0)
                                {
                                    propType = propTypeBool;
                                }
                                else if (strcmp(attrs[a].value, "@\"NSNumber\"") == 0)
                                {
                                    propType = propTypeNumber;
                                }
                                else if (strcmp(attrs[a].value, "@\"NSDecimalNumber\"") == 0)
                                {
                                    propType = propTypeAmount;
                                }
                                else if (strcmp(attrs[a].value, @encode(int)) == 0)
                                {
                                    propType = propTypeInt;
                                }
                                else if (strcmp(attrs[a].value, "@\"NSDate\"") == 0)
                                {
                                    propType = propTypeDateTime;
                                }
                                else if (strcmp(attrs[a].value, "@\"NSURL\"") == 0)
                                {
                                    propType = propTypeUrl;
                                }
                                else if (attrs[a].value[0] == '@')
                                {
                                    propType = propTypeClass;
                                }
                                
                                break;
                            }
                        }
                        
                        free(attrs);
                    }
                    
                    NSString *propName;
                    
                    propName = [[NSString alloc] initWithCString: property_getName(props[p]) encoding: NSASCIIStringEncoding];
                    
                    NSObject *val;
                    
                    if ((val = dict[propName]) != nil)
                    {
                        switch (propType)
                        {
                            case propTypeString:
                                if (val != nil && ![val isKindOfClass: [NSNull class]] && [val isKindOfClass: [NSString class]])
                                {
                                    [object setValue: (NSString *)val forKey: propName];
                                }
                                break;
                                
                            case propTypeBool:
                            case propTypeNumber:
                            case propTypeInt:
                                if (val != nil && ![val isKindOfClass: [NSNull class]] && [val isKindOfClass: [NSNumber class]])
                                {
                                    [object setValue: (NSNumber *)val forKey: propName];
                                }
                                break;
                                
                            case propTypeAmount:
                                if (val != nil && ![val isKindOfClass: [NSNull class]] && [val isKindOfClass: [NSNumber class]])
                                {
                                    [object setValue: [NSDecimalNumber decimalNumberWithDecimal: ((NSNumber *)val).decimalValue] forKey: propName];
                                }
                                break;
                                
                            case propTypeDateTime:
                            case propTypeUrl:
                                //
                                // should not get these from JS
                                //
                                break;
                                
                            case propTypeClass:
                                if (val != nil && ![val isKindOfClass: [NSNull class]] && class_getSuperclass(NSClassFromString([[propTypeName stringByReplacingOccurrencesOfString: @"@" withString: @""] stringByReplacingOccurrencesOfString: @"\"" withString: @""])) == [EPSExpressBase class])
                                {
                                    [object setValue: [self dictToExpress: (NSDictionary *)val name: propName] forKey: propName];
                                }
                                break;
                                
                            case propTypeUnknown:
                            default:
                                /*
                                 * this is for development purposes only and should never be reached in released code
                                 */
                                [[NSException exceptionWithName: @"TypeNotImplementedException" reason: [NSString stringWithFormat: @"Dict to Express type \"%@\" not implemented", propTypeName] userInfo: nil] raise];
                                break;
                        }
                    }
                }
                
                free(props);
            }
        }
    }
    
    return object;
}

///
/// \brief Handles the Express response
///
/// For more information, see the EPSExpress framework documentation.
///
-(void)handleExpressResponse:(EPSExpressType)type response:(EPSExpressResponse *)response error:(NSError *)error
{
#ifdef DEBUG
    NSLog(@"%s:", __FUNCTION__);
#endif
    
    [[UIApplication sharedApplication] setNetworkActivityIndicatorVisible: NO];
    
    NSMutableDictionary *event;
    
    event = [NSMutableDictionary dictionary];
    
    if (error != nil && error.code != EPSExpressErrorCodeNone)
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
    else if (response == EPSExpressClassNotSet)
    {
        NSMutableDictionary *eventError;
        
        eventError = [NSMutableDictionary dictionary];
        
        eventError[@"code"] = [NSNumber numberWithInt: 1000];
        
        eventError[@"description"] = @"Express response is not set";
        
        event[@"error"] = eventError;
    }
    else
    {
        NSMutableDictionary *eventData;
        
        eventData = [NSMutableDictionary dictionary];
        
        eventData[@"type"] = [NSNumber numberWithInt: type];
        
        eventData[@"response"] = [self expressToDict: response];
        
        event[@"data"] = eventData;
    }
    
    [self fireEvent: @"onEPSExpressCompleted" callbackId: callbackId data: event];

    [APP_DELEGATE stopActivityIndicator];
}

///
/// \brief Sends the request to Express
///
/// This method is analogous to the sendAsynchronousRequest method in the EPSExpress framework. For more information, see the EPSExpress framework documentation.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR is returned if the arguments are invalid or the Express credentials are not setup. Otherwise, CDVCommandStatus_OK is returned and any responses to the call to EPSExpress sendAsynchronousRequest are returned to the JavaScript side in an 'onEPSExpressCompleted' event.
///
/// \sa handleExpressResponse
///
-(void)sendAsynchronousRequest:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d", __FUNCTION__, command.arguments.count);
#endif

    EPSExpress *epsExpress;
    
    epsExpress = nil;
    
    NSInteger timeout;
    
    timeout = 10;
    
    BOOL autoReversal;
    
    autoReversal = true;
    
    for (int i = 0; i < command.arguments.count; i++)
    {
        switch (i)
        {
            case 0:
                if ([command.arguments[i] isKindOfClass: [NSDictionary class]])
                {
                    epsExpress = [self dictToExpress: command.arguments[i]];
                }
                break;
                
            case 1:
                if ([command.arguments[i] isKindOfClass: [NSNumber class]])
                {
                    timeout = ((NSNumber *)command.arguments[i]).integerValue;
                }
                break;
                
            case 2:
                if ([command.arguments[i] isKindOfClass: [NSNumber class]])
                {
                    autoReversal = ((NSNumber *)command.arguments[i]).boolValue;
                }
                break;
                
            default:
                break;
        }
    }

    CDVPluginResult* pluginResult;
    
    if (epsExpress == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"Error converting EPS Express message"];
    }
    else
    {
        NSUserDefaults *prefs;
        
        prefs = [NSUserDefaults standardUserDefaults];
        
        if (epsExpress.Credentials == EPSExpressClassNotSet)
        {
            epsExpress.Credentials = [[EPSExpressCredentials alloc] init];
        }
        
        if (epsExpress.Credentials.AccountID == EPSExpressStringNotSet && (epsExpress.Credentials.AccountID = [prefs stringForKey: @"account_id_preference"]) == nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"Account ID is missing"];
        }
        else if (epsExpress.Credentials.AccountToken == EPSExpressStringNotSet && (epsExpress.Credentials.AccountToken = [prefs stringForKey: @"account_token_preference"]) == nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"Account token is missing"];
        }
        else if (epsExpress.Credentials.AcceptorID == EPSExpressStringNotSet && (epsExpress.Credentials.AcceptorID = [prefs stringForKey: @"acceptor_id_preference"]) == nil)
        {
            pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"Acceptor ID is missing"];
        }
        else
        {
            if (epsExpress.Application == EPSExpressClassNotSet)
            {
                epsExpress.Application = [[EPSExpressApplication alloc] init];
            }

            if (epsExpress.Application.ApplicationID == EPSExpressStringNotSet && (epsExpress.Application.ApplicationID = [prefs stringForKey: @"application_id_preference"]) == nil)
            {
                pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"Application ID is missing"];
            }
            else if (epsExpress.Application.ApplicationName == EPSExpressStringNotSet)
            {
                pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"Application name is missing"];
            }
            else if (epsExpress.Application.ApplicationVersion == EPSExpressStringNotSet)
            {
                pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"Application version is missing"];
            }
            else
            {
                [APP_DELEGATE startActivityIndicator];
                
                //NSLog(@"%@", epsExpress.stringValue);
                
                [[UIApplication sharedApplication] setNetworkActivityIndicatorVisible: YES];
                
                [epsExpress sendAsynchronousRequest: timeout autoReversal: autoReversal completionHandler: ^(EPSExpressType type, EPSExpressResponse *response, NSError *error){ [self handleExpressResponse: type response: response error: error]; }];

                pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
            }
        }
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
}

///
/// \brief Notification the JavaScript side is ready for the Hosted Payments response
///
/// Because Hosted Payments requires changing pages, this method is used by the page to which Hosted Payments returns to notify the native side it is ready for the Hosted Payments response.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if there is no Hosted Payments response or the Hosted Payments response is too old. Otherwise, CDVCommandStatus_OK is returned and the Hosted Payments response is returned to the JavaScript side in an 'onEPSExpressCompleted' event.
///
/// \sa handleExpressResponse
///
-(void)readyForHostedPaymentsResponse:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d", __FUNCTION__, command.arguments.count);
#endif
    
    CDVPluginResult* pluginResult;
    
    if (hostedPaymentsResponseUrl == nil)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"No Hosted Payments Response available"];
    }
    else if ([[NSDate date] timeIntervalSinceDate: hostedPaymentsResponseDate] > 10.0)
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"Hosted Payments Response is too old"];
        
        hostedPaymentsResponseUrl = nil;
    }
    else
    {
        pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK];
    }
    
    [self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
    
    if (hostedPaymentsResponseUrl != nil)
    {
        EPSExpress *epsExpress;
        
        epsExpress = [EPSExpress expressWithHostedPaymentsReturnUrl: hostedPaymentsResponseUrl];
        
        [self handleExpressResponse: epsExpress.Type response: epsExpress.Response error: nil];
    
        hostedPaymentsResponseUrl = nil;
    }
    
    hostedPaymentsResponseDate = nil;
}

///
/// \brief Parses a Hosted Payments return URL
///
/// Parses a Hosted Payments return URL.
///
/// \param command The CDVInvokedUrlCommand object containing information and parameters from the JavaScript side.
///
/// \return CDVCommandStatus_ERROR if there is an error parsing the URL. Otherwise, CDVCommandStatus_OK is returned and the Hosted Payments response is returned to the JavaScript side in an 'onEPSExpressCompleted' event.
///
/// \sa handleExpressResponse
///
-(void)parseHostedPaymentsReturnUrl:(CDVInvokedUrlCommand*)command
{
#ifdef DEBUG
    NSLog(@"%s: argc=%d", __FUNCTION__, command.arguments.count);
#endif
    
    NSURL *url;
    
    url = nil;
    
    for (int i = 0; i < command.arguments.count; i++)
    {
        switch (i)
        {
            case 0:
                if ([command.arguments[i] isKindOfClass: [NSString class]])
                {
                    url = [NSURL URLWithString: (NSString *)command.arguments[i]];
                }
                break;
                
            default:
                break;
        }
    }

    if (url == nil)
    {
        [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"Error parsing URL"] callbackId: command.callbackId];
    }
    else
    {
        [self setHostedPaymentsResponse: url];
        
        [self readyForHostedPaymentsResponse: command];
    }
}

///
/// \brief Set the Hosted Payments return URL
///
/// This method is called by MainViewController to save a Hosted Payments return URL.
///
/// \param url The Hosted Payments return URL.
///
-(void)setHostedPaymentsResponse:(NSURL *)url
{
    hostedPaymentsResponseUrl = [url copy];
    
    hostedPaymentsResponseDate = [[NSDate date] copy];
}

@end
