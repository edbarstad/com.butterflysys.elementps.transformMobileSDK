/*!
 @file EPS.Express.js
 
 The EPS.Express class is a definition for the data passed between the JavaScript and native code as well as helper functions used to access the EPS Express framework functionality.
 
 <h3>Requirements</h3>
 
 For a list of requirements, see the Requirements section in the native EPS Express SDK for respective platform.
 */

// EPS = EPS || {};

/*!
 @class EPS.Express

 @brief Provides access to the Express functionality.

 This is the main interface to the Express functionality. This interface provides access to all other Express classes.
 */
EPS.Express = function ()
{
    EPS._Express = this;
    
    //
    // This is called each time one of the channel events is subscribed to or unsubscribed from.
    // On the first subscription, this calls the "start" method to notify the native side of the callback ID for unsolicited events.
    // On the last unsubscription, this calls the "stop" method to notify the native side no unsolicited events should be sent.
    //
    EPS.Express._onChannelSubscribersChange = function()
    {
        try
        {
            var handlers;
            
            handlers = 0;
            
            for (var key in EPS._Express._channels)
            {
                handlers += EPS._Express._channels[key].numHandlers;
            }

            if (handlers === 1)
            {
                EPS.Utils.exec(EPS._Express._event, EPS._Express._error, "EPS.Express", "start", []);
            }
            else if (handlers === 0)
            {
                EPS.Utils.exec(null, null, "EPS.Express", "stop", []);
            }
        }
        catch (ex)
        {
            console.log('EPS.Express.js->_onHasSubscribersChange: ' + ex);
        }
    };

    //
    // Channels are used internally to facilitate unsolicited events from the native side.
    // This creates one channel for each event type.
    //
    this._channels = [];
    
    for (key in EPS.Express.Event)
    {
        if (EPS.Express.Event.hasOwnProperty(key))
        {
            this._channels[EPS.Express.Event[key]] = cordova.addDocumentEventHandler('_' + EPS.Express.Event[key].toLowerCase());
            
            this._channels[EPS.Express.Event[key]].onHasSubscribersChange = EPS.Express._onChannelSubscribersChange;
        }
    }

    //
    // This is the unsolicited event callback. It forwards the event to any listeners.
    //
    EPS.Express.prototype._event = function(event)
    {
        try
        {
            console.log('EPS.Express.prototype._event called...' + JSON.stringify(event, null, '  '));
            if (event == undefined)
            {
                console.log('EPS.Express.js->_event: EVENT UNDEFINED');
            }
            else if (!event.hasOwnProperty('type'))
            {
                console.log('EPS.Express.js->_event: EVENT TYPE UNDEFINED');
            }
            else if (typeof event.type !== 'string')
            {
                console.log('EPS.Express.js->_event: EVENT TYPE IS NOT A STRING');
            }
            else
            {
                var type;
                
                type = event.type.substring(1);
                
                if (!EPS._Express._channels.hasOwnProperty(type))
                {
                    console.log('EPS.Express.js->_event: NO CHANNEL DEFINED FOR ' + type + '(' + event.type + ')');
                }
                else
                {
                    console.log('EPS.Express.js->_event: ' + type);
                
                    EPS._Express._channels[type].fire(event);
                
                    event.type = type;
                    
                    EPS.Utils.fireDocumentEvent(type, event);
                }
            }
        }
        catch (ex)
        {
            console.log('EPS.Express.js->_event: ' + ex);
        }
    };

    //
    // This method is not used.
    //
    EPS.Express.prototype._error = function(event)
    {
        console.log('EPS.Express.js->_error: ' + ex);
    };
    
    /*!
     @brief Test/Certification flag.
    
     Setting this flag to YES sends all transactions to the Express test/certification host. Setting this flag to NO sends all transaction toe the Express production host.
     */
    this.TestCertification = false;

    /*!
     @brief Type of message.
    
     Specifies the type of message.
     */
    this.Type = "Unknown";

    /*!
     @brief Application class.
    
     The Application class is required for every transaction and is used to uniquely identify the sending application.
     */
    this.Application = null;

    /*!
     @brief Credentials class.
    
     The Credentials class is required for every transaction and is used to authenticate the sender.
     */
    this.Credentials = null;

    /*!
     @brief Transaction class.
     */
    this.Transaction = null;

    /*!
     @brief Terminal class.
     */
    this.Terminal = null;

    /*!
     @brief Card class.
    
     The Card class is used to transmit/receive cardholder information.
     */
    this.Card = null;

    /*!
     @brief PaymentAccount class.
     */
    this.PaymentAccount = null;

    /*!
     @brief PaymentAccountParameters class.
     */
    this.PaymentAccountParameters = null;

    /*!
     @brief Address class.
     */
    this.Address = null;

    /*!
     @brief Parameters class.
     */
    this.Parameters = null;

    /*!
     @brief Batch class.
    
     The Batch class is used to request and receive batch information from Express.
     */
    this.Batch = null;

    /*!
     @brief TransactionSetup class.
     */
    this.TransactionSetup = null;

    /*!
     @brief ExtendedParameters class.
     */
    this.ExtendedParameters = null;

    /*!
     @brief Paging class.
     */
    this.Paging = null;

    /*!
     @brief Response class.
    
     The Response class is used to communicate any output messages back to the sender. An ExpressResponseCode is returned with every response and should be examined to determine success or failure.
     */
    this.Response = null;

    /*!
     @brief Sends the request to Express asynchronously.
    
     This method serializes the Express message, sends it to the Express host, receives the response, and deserializes the response. Upon successful completion, an onCompleted event is generated.
    
     @param timeout The timeout in milliseconds to wait for the response from Express.
    
     @param autoReversal flag that indicates whether a system reversal is generated for a communication error.
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     */
    this.sendAsynchronousRequest = function(timeout, autoReversal, successCallback, errorCallback)
    {
        try
        {
            document.addEventListener('_' + EPS.Express.Event.onCompleted, this._onCompleted, false);

            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Express', 'sendAsynchronousRequest', [this, timeout, autoReversal]);
        }
        catch (ex)
        {
            console.log('EPS.Express.js->sendAsynchronousRequest: ' + ex);
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }
    };

    /*!
     @brief Indicate ready to receive Hosted Payments response.
    
     This method allows the JavaScript side to notify the native side it is ready to receive the Hosted Payments response. Upon successful completion, an onCompleted event is generated.
     
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     
     @seealso //eps_ref/js/data/EPS.Express.TransactionSetup/.ReturnURL EPS.Express.TransactionSetup.ReturnURL
     */
    this.readyForHostedPaymentsResponse = function(successCallback, errorCallback)
    {
        try
        {
            document.addEventListener('_' + EPS.Express.Event.onCompleted, this._onCompleted, false);

            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Express', 'readyForHostedPaymentsResponse', []);
        }
        catch (ex)
        {
            console.log('EPS.Express.js->readyForHostedPaymentsResponse: ' + ex);
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }
    };

    /*!
     @brief Parse a Hosted Payments return URL.
    
     This method parses a Hosted Payments return URL. Upon successful completion, an onCompleted event is generated.
    
     @param location Typically this is the window.location object. 
    
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
    
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     
     @seealso //eps_ref/js/data/EPS.Express.TransactionSetup/.ReturnURL EPS.Express.TransactionSetup.ReturnURL
     */
    this.parseHostedPaymentsReturnUrl = function(location, successCallback, errorCallback)
    {
        try
        {
            console.log('parseHostedPaymentsReturnUrl called with params: ' + JSON.stringify(location, null, '  ') + ', ' + JSON.stringify(successCallback, null, '  ') + ', ' + JSON.stringify(errorCallback, null, '  '));

            document.addEventListener('_' + EPS.Express.Event.onCompleted, this._onCompleted, false);

            console.log('parseHostedPaymentsReturnUrl executing EPS.Express parseHostedPaymentReturnUrl: ' + JSON.stringify(location, null, '  '));
            EPS.Utils.exec(successCallback, errorCallback, 'EPS.Express', 'parseHostedPaymentsReturnUrl', [ location.href ]);
        }
        catch (ex)
        {
            console.log('EPS.Express.js->parseHostedPaymentsReturnUrl: ' + ex);
            
            if (errorCallback != null)
            {
                errorCallback(ex.toString());
            }
        }
    };
    
    //
    // Not currently used, but necessary to setup the channel
    //
    this._onCompleted = function(event)
    {
        try
        {
            console.log('EPS.Express.js->_onCompleted:');
        }
        catch (ex)
        {
            console.log('EPS.Express.js->_onCompleted: ' + ex);
        }
    };
};

/*!
 @class
 
 @brief Definitions of the event types to which an application may subscribe.
 
 @var onCompleted Type for an onCompletedEvent.
 */
EPS.Express.Event =
{
    onCompleted                                 : 'onEPSExpressCompleted'
};

/*!
 @class
 
 @var Null Null.
 @var False False.
 @var True True.
 */
EPS.Express.BooleanType =
{
    // Null
    Null                                        : -1,
    // False
    False                                       : 0,
    // True
    True                                        : 1
};


/*!
 @class

 @brief Errors for Express messages.
 
 @var None No error.
 @var InProgress The transaction is in progress and an event will be generated when completed.
 @var Unknown Unknown error.
 @var Reversed The transaction completed with a communication error and was successfully reversed.
 @var NeedsReversal  The transaction completed with a communication error and a reversal is still necessary.
 @var SerializeError Unable the serialize the Express request.
 @var SendReceiveError The transaction completed with a communication error. A reversal is not necessary.
 @var StatusCodeError The HTTPS request returned a non-success error code.
 @var DecodeError Unable to  decode the HTTPS response.
 @var DeserializeError Unable to deserialize the Express response.
 @var HostedPaymentsCancelled Hosted Payments result is cancelled.
 @var HostedPaymentsError Hosted Payments result is an error.
 */
EPS.Express.ErrorCode =
{
    // No error.
    None                                        : 0,
    // The transaction is in progress and an event will be generated when completed.
    InProgress                                  : 1,
    // Unknown error.
    Unknown                                     : 2,
    // The transaction completed with a communication error and was successfully reversed.
    Reversed                                    : 3,
    // The transaction completed with a communication error and a reversal is still necessary.
    NeedsReversal                               : 4,
    // Unable the serialize the Express request.
    SerializeError                              : 5,
    // The transaction completed with a communication error. A reversal is not necessary.
    SendReceiveError                            : 6,
    // The HTTPS request returned a non-success error code.
    StatusCodeError                             : 7,
    // Unable to  decode the HTTPS response.
    DecodeError                                 : 8,
    // Unable to deserialize the Express response.
    DeserializeError                            : 9,
    // Hosted Payments result is cancelled.
    HostedPaymentsCancelled                     : 10,
    // Hosted Payments result is an error.
    HostedPaymentsError                         : 11
};

/*!
 @class
 
 @brief Types of Express messages.
 
 @var Unknown Unknown type.
 @var AccountTokenActivate AccountTokenActivate request.
 @var AccountTokenCreate AccountTokenCreate request.
 @var BatchClose BatchClose request.
 @var BatchItemQuery BatchItemQuery request.
 @var BatchTotalsQuery BatchTotalsQuery request.
 @var CreditCardAVSOnly CreditCardAVSOnly request.
 @var CreditCardAdjustment CreditCardAdjustment request.
 @var CreditCardAuthorization CreditCardAuthorization request.
 @var CreditCardIncrementalAuthorization CreditCardIncrementalAuthorization request.
 @var CreditCardAuthorizationCompletion CreditCardAuthorizationCompletion request.
 @var CreditCardCredit CreditCardCredit request.
 @var CreditCardForce CreditCardForce request.
 @var CreditCardReturn CreditCardReturn request.
 @var CreditCardReversal CreditCardReversal request.
 @var CreditCardSale CreditCardSale request.
 @var CreditCardVoid CreditCardVoid request.
 @var DebitCardReturn DebitCardReturn request.
 @var DebitCardReversal DebitCardReversal request.
 @var DebitCardSale DebitCardSale request.
 @var CheckSale CheckSale request.
 @var CheckCredit CheckCredit request.
 @var CheckVerification CheckVerification request.
 @var CheckReturn CheckReturn request.
 @var CheckVoid CheckVoid request.
 @var CheckReversal CheckReversal request.
 @var HealthCheck HealthCheck request.
 @var TimeCheck TimeCheck request.
 @var TransactionSetup TransactionSetup request.
 @var BINQuery BINQuery request.
 @var CreditCardBalanceInquiry CreditCardBalanceInquiry request.
 @var TransactionSetupExpire TransactionSetupExpire request.
 @var TransactionQuery TransactionQuery request.
 @var PaymentAccountCreate PaymentAccountCreate request.
 @var PaymentAccountUpdate PaymentAccountUpdate request.
 @var PaymentAccountDelete PaymentAccountDelete request.
 @var PaymentAccountQuery PaymentAccountQuery request.
 @var PaymentAccountAutoUpdate PaymentAccountAutoUpdate request.
 @var PaymentAccountCreateWithTransID PaymentAccountCreateWithTransID request.
 @var PaymentAccountQueryRecordCount PaymentAccountQueryRecordCount request.
 @var PaymentAccountQueryTokenReport PaymentAccountQueryTokenReport request.
 
 @var Response Generic response.
 @var AccountTokenActivateResponse AccountTokenActivate response.
 @var AccountTokenCreateResponse AccountTokenCreate response.
 @var BatchCloseResponse BatchClose response.
 @var BatchItemQueryResponse BatchItemQuery response.
 @var BatchTotalsQueryResponse BatchTotalsQuery response.
 @var CreditCardAVSOnlyResponse CreditCardAVSOnly response.
 @var CreditCardAdjustmentResponse CreditCardAdjustment response.
 @var CreditCardAuthorizationResponse CreditCardAuthorization response.
 @var CreditCardIncrementalAuthorizationResponse CreditCardIncrementalAuthorization response.
 @var CreditCardAuthorizationCompletionResponse CreditCardAuthorizationCompletion response.
 @var CreditCardCreditResponse CreditCardCredit response.
 @var CreditCardForceResponse CreditCardForce response.
 @var CreditCardReturnResponse CreditCardReturn response.
 @var CreditCardReversalResponse CreditCardReversal response.
 @var CreditCardSaleResponse CreditCardSale response.
 @var CreditCardVoidResponse CreditCardVoid response.
 @var DebitCardReturnResponse DebitCardReturn response.
 @var DebitCardReversalResponse DebitCardReversal response.
 @var DebitCardSaleResponse DebitCardSale response.
 @var CheckSaleResponse CheckSale response.
 @var CheckCreditResponse CheckCredit response.
 @var CheckVerificationResponse CheckVerification response.
 @var CheckReturnResponse CheckReturn response.
 @var CheckVoidResponse CheckVoid response.
 @var CheckReversalResponse CheckReversal response.
 @var HealthCheckResponse HealthCheck response.
 @var TimeCheckResponse TimeCheck response.
 @var TransactionSetupResponse TransactionSetup response.
 @var BINQueryResponse BINQuery response.
 @var CreditCardBalanceInquiryResponse CreditCardBalanceInquiry response.
 @var TransactionSetupExpireResponse TransactionSetupExpire response.
 @var TransactionQueryResponse TransactionQuery response.
 @var PaymentAccountCreateResponse PaymentAccountCreate response.
 @var PaymentAccountUpdateResponse PaymentAccountUpdate response.
 @var PaymentAccountDeleteResponse PaymentAccountDelete response.
 @var PaymentAccountQueryResponse PaymentAccountQuery response.
 @var PaymentAccountAutoUpdateResponse PaymentAccountAutoUpdate response.
 @var PaymentAccountCreateWithTransIDResponse PaymentAccountCreateWithTransID response.
 @var PaymentAccountQueryRecordCountResponse PaymentAccountQueryRecordCount response.
 @var PaymentAccountQueryTokenReportResponse PaymentAccountQueryTokenReport response.
 @var HostedPaymentsResponse Hosted Payments response.
 */
EPS.Express.Type =
{
    // Unknown type
    Unknown                                     : -1,
    // AccountTokenActivate request
    AccountTokenActivate                        : 0,
    // AccountTokenCreate request
    AccountTokenCreate                          : 1,
    // BatchClose request
    BatchClose                                  : 2,
    // BatchItemQuery request
    BatchItemQuery                              : 3,
    // BatchTotalsQuery request
    BatchTotalsQuery                            : 4,
    // CreditCardAVSOnly request
    CreditCardAVSOnly                           : 5,
    // CreditCardAdjustment request
    CreditCardAdjustment                        : 6,
    // CreditCardAuthorization request
    CreditCardAuthorization                     : 7,
    // CreditCardIncrementalAuthorization request
    CreditCardIncrementalAuthorization          : 8,
    // CreditCardAuthorizationCompletion request
    CreditCardAuthorizationCompletion           : 9,
    // CreditCardCredit request
    CreditCardCredit                            : 10,
    // CreditCardForce request
    CreditCardForce                             : 11,
    // CreditCardReturn request
    CreditCardReturn                            : 12,
    // CreditCardReversal request
    CreditCardReversal                          : 13,
    // CreditCardSale request
    CreditCardSale                              : 14,
    // CreditCardVoid request
    CreditCardVoid                              : 15,
    // DebitCardReturn request
    DebitCardReturn                             : 16,
    // DebitCardReversal request
    DebitCardReversal                           : 17,
    // DebitCardSale request
    DebitCardSale                               : 18,
    // CheckSale request
    CheckSale                                   : 19,
    // CheckCredit request
    CheckCredit                                 : 20,
    // CheckVerification request
    CheckVerification                           : 21,
    // CheckReturn request
    CheckReturn                                 : 22,
    // CheckVoid request
    CheckVoid                                   : 23,
    // CheckReversal request
    CheckReversal                               : 24,
    // HealthCheck request
    HealthCheck                                 : 25,
    // TimeCheck request
    TimeCheck                                   : 26,
    // TransactionSetup request
    TransactionSetup                            : 27,
    // BINQuery request
    BINQuery                                    : 28,
    // CreditCardBalanceInquiry request
    CreditCardBalanceInquiry                    : 29,
    // TransactionSetupExpire request
    TransactionSetupExpire                      : 30,
    // TransactionQuery request
    TransactionQuery                            : 31,
    // PaymentAccountCreate request
    PaymentAccountCreate                        : 32,
    // PaymentAccountUpdate request
    PaymentAccountUpdate                        : 33,
    // PaymentAccountDelete request
    PaymentAccountDelete                        : 34,
    // PaymentAccountQuery request
    PaymentAccountQuery                         : 35,
    // PaymentAccountAutoUpdate request
    PaymentAccountAutoUpdate                    : 36,
    // PaymentAccountCreateWithTransID request
    PaymentAccountCreateWithTransID             : 37,
    // PaymentAccountQueryRecordCount request
    PaymentAccountQueryRecordCount              : 38,
    // PaymentAccountQueryTokenReport request
    PaymentAccountQueryTokenReport              : 39,
    
    // Generic response
    Response                                    : 40,
    // AccountTokenActivate response
    AccountTokenActivateResponse                : 41,
    // AccountTokenCreate response
    AccountTokenCreateResponse                  : 42,
    // BatchClose response
    BatchCloseResponse                          : 43,
    // BatchItemQuery response
    BatchItemQueryResponse                      : 44,
    // BatchTotalsQuery response
    BatchTotalsQueryResponse                    : 45,
    // CreditCardAVSOnly response
    CreditCardAVSOnlyResponse                   : 46,
    // CreditCardAdjustment response
    CreditCardAdjustmentResponse                : 47,
    // CreditCardAuthorization response
    CreditCardAuthorizationResponse             : 48,
    // CreditCardIncrementalAuthorization response
    CreditCardIncrementalAuthorizationResponse  : 49,
    // CreditCardAuthorizationCompletion response
    CreditCardAuthorizationCompletionResponse   : 50,
    // CreditCardCredit response
    CreditCardCreditResponse                    : 51,
    // CreditCardForce response
    CreditCardForceResponse                     : 52,
    // CreditCardReturn response
    CreditCardReturnResponse                    : 53,
    // CreditCardReversal response
    CreditCardReversalResponse                  : 54,
    // CreditCardSale response
    CreditCardSaleResponse                      : 55,
    // CreditCardVoid response
    CreditCardVoidResponse                      : 56,
    // DebitCardReturn response
    DebitCardReturnResponse                     : 57,
    // DebitCardReversal response
    DebitCardReversalResponse                   : 58,
    // DebitCardSale response
    DebitCardSaleResponse                       : 59,
    // CheckSale response
    CheckSaleResponse                           : 60,
    // CheckCredit response
    CheckCreditResponse                         : 61,
    // CheckVerification response
    CheckVerificationResponse                   : 62,
    // CheckReturn response
    CheckReturnResponse                         : 63,
    // CheckVoid response
    CheckVoidResponse                           : 64,
    // CheckReversal response
    CheckReversalResponse                       : 65,
    // HealthCheck response
    HealthCheckResponse                         : 66,
    // TimeCheck response
    TimeCheckResponse                           : 67,
    // TransactionSetup response
    TransactionSetupResponse                    : 68,
    // BINQuery response
    BINQueryResponse                            : 69,
    // CreditCardBalanceInquiry response
    CreditCardBalanceInquiryResponse            : 70,
    // TransactionSetupExpire response
    TransactionSetupExpireResponse              : 71,
    // TransactionQuery response
    TransactionQueryResponse                    : 72,
    // PaymentAccountCreate response
    PaymentAccountCreateResponse                : 73,
    // PaymentAccountUpdate response
    PaymentAccountUpdateResponse                : 74,
    // PaymentAccountDelete response
    PaymentAccountDeleteResponse                : 75,
    // PaymentAccountQuery response
    PaymentAccountQueryResponse                 : 76,
    // PaymentAccountAutoUpdate response
    PaymentAccountAutoUpdateResponse            : 77,
    // PaymentAccountCreateWithTransID response
    PaymentAccountCreateWithTransIDResponse     : 78,
    // PaymentAccountQueryRecordCount response
    PaymentAccountQueryRecordCountResponse      : 79,
    // PaymentAccountQueryTokenReport response
    PaymentAccountQueryTokenReportResponse      : 80,
    // Hosted Payments response
    HostedPaymentsResponse                      : 10000
};

/*!
 @class
 
 @brief Definition of an onCompleted event.
 
 @var error Optional property indicating an error occurred.
 @var data Optional property containing data for this event.
 */
EPS.Express.OnCompleted =
{
    //
    // This property is present only if an error occurred.
    //
    error:
    {
        //
        // Error code
        //
        code: EPS.Express.ErrorCode.None,
        
        //
        // Error description
        //
        description: null
    },
    
    //
    // This property is present only if no error occurred.
    //
    data:
    {
        //
        // Type of response
        //
        type: EPS.Express.Type.Unknown,
        
        //
        // An instance of EPS.Express.Response.
        //
        response: null
    }    
};

/*!
 @class
 
 @brief Address class.

 Provides access to Express address information.
 */
EPS.Express.Address = function()
{
    /*!
     @brief Billing name.
    
     The name used for billing purposes.
     */
    this.BillingName = null;

    /*!
     @brief Billing address 1.
    
     The street address used for billing purposes.
     */
    this.BillingAddress1 = null;

    /*!
     @brief Billing address 2.
    
     The street address used for billing purposes.
     */
    this.BillingAddress2 = null;

    /*!
     @brief Billing city.
    
     The name of the city used for billing purposes.
     */
    this.BillingCity = null;

    /*!
     @brief Billing state.
    
     The name of the state used for billing purposes. This value may be any 2 character state code or the full state name.
     */
    this.BillingState = null;

    /*!
     @brief Billing ZIP code.
    
     The ZIP code used for billing purposes.
     */
    this.BillingZipcode = null;

    /*!
     @brief Billing e-mail.
    
     The e-mail address used for billing purposes.
     */
    this.BillingEmail = null;

    /*!
     @brief Billing phone.
    
     The phone number used for billing purposes. The recommended format is (800)555-1212
     */
    this.BillingPhone = null;

    /*!
     @brief Shipping name.
    
     The name used for shipping purposes.
     */
    this.ShippingName = null;

    /*!
     @brief Shipping address 1.
    
     The street address used for shipping purposes.
     */
    this.ShippingAddress1 = null;

    /*!
     @brief Shipping address 2.
    
     The street address used for shipping purposes.
     */
    this.ShippingAddress2 = null;

    /*!
     @brief Shipping city.
    
     The name of the city used for shipping purposes.
     */
    this.ShippingCity = null;

    /*!
     @brief The name of the state used for shipping purposes.
     
     This value may be any 2 character state code or the full state name.
     */
    this.ShippingState = null;

    /*!
     @brief Shipping ZIP code.
    
     The ZIP code used for shipping purposes.
     */
    this.ShippingZipcode = null;

    /*!
     @brief Shipping e-mail.
    
     The e-mail address used for shipping purposes.
     */
    this.ShippingEmail = null;

    /*!
     @brief Shipping phone.
    
     The phone number used for shipping purposes. The recommended format is (800)555-1212
     */
    this.ShippingPhone = null;
};

/*!
 @class
 
 @brief Application class.
 
 Provides access to Express application information.
 */
EPS.Express.Application = function()
{
    /*!
     @brief Application ID.
    
     Unique application identifier. This value is assigned by Element Payment Services.
     */
    this.ApplicationID = null;
    
    /*!
     @brief Application name.
    
     Name of the application.
     */
    this.ApplicationName = null;
    
    /*!
     @brief Application version.
    
     Version of the application.
     */
    this.ApplicationVersion = null;
};

/*!
 @class
 
 @brief Batch close types
 
 @var Regular Regular close.
 @var Force Force close.
 */
EPS.Express.BatchCloseType =
{
    // Regular close
    Regular                                     : 0,
    // Force close
    Force                                       : 1
};

/*!
 @class
 
 @brief Batch query types
 
 @var Total Total query.
 @var Item Item query.
 */
EPS.Express.BatchQueryType =
{
    // Total query
    Total                                       : 0,
    // Item query
    Item                                        : 1
};

/*!
 @class
 
 @brief Batch grouping codes
 
 @var Full Full.
 @var Single Single.
 */
EPS.Express.BatchGroupingCode = 
{
    // Full
    Full                                        : 0,
    // Single
    Single                                      : 1
};

/*!
 @class
 
 @brief Batch index codes
 
 @var Current Current batch.
 @var Previous First previous batch.
 */
EPS.Express.BatchIndexCode =
{
    // Current batch
    Current                                     : 0,
    // First previous batch
    Previous                                    : 1
};

/*!
 @class
 
 @brief Batch class

 The Batch class is used to request and receive batch information from Express.
 */
EPS.Express.Batch = function()
{
    /*!
     @brief Batch close type.
    
     Batch close type.
     
     @see EPS.Express.BatchCloseType
     */
    this.BatchCloseType = null;

    /*!
     @brief Batch query type.
    
     Batch query type.
     
     @see EPS.Express.BatchQueryType
     */
    this.BatchQueryType = null;

    /*!
     @brief Host batch ID.
    
     Host batch ID.
     */
    this.HostBatchID = null;

    /*!
     @brief Host item ID.
    
     Host item ID.
     */
    this.HostItemID = null;

    /*!
     @brief Host batch count.
    
     Host batch count.
     */
    this.HostBatchCount = null;

    /*!
     @brief Host batch amount.
    
     Host batch amount.
     */
    this.HostBatchAmount = null;

    /*!
     @brief Batch grouping code.
    
     Batch grouping code.
     
     @see EPS.Express.BatchGroupingCode
     */
    this.BatchGroupingCode = null;

    /*!
     @brief Host reversal queue ID.
    
     Host reversal queue ID.
     */
    this.HostReversalQueueID = null;

    /*!
     @brief Host credit sale count.
    
     Host credit sale count.
     */
    this.HostCreditSaleCount = null;

    /*!
     @brief Host credit sale amount.
    
     Host credit sale amount.
     */
    this.HostCreditSaleAmount = null;

    /*!
     @brief Host credit return count.
    
     Host credit return count.
     */
    this.HostCreditReturnCount = null;

    /*!
     @brief Host credit return amount.
    
     Host credit return amount.
     */
    this.HostCreditReturnAmount = null;

    /*!
     @brief Host debit sale count.
    
     Host debit sale count.
     */
    this.HostDebitSaleCount = null;

    /*!
     @brief Host debit sale amount.
    
     Host debit sale amount.
     */
    this.HostDebitSaleAmount = null;

    /*!
     @brief Host debit return count.
    
     Host debit return count.
     */
    this.HostDebitReturnCount = null;

    /*!
     @brief Host debit return amount.
    
     Host debit return amount.
     */
    this.HostDebitReturnAmount = null;

    /*!
     @brief Host batch items.
    
     Host batch items.
     */
    this.HostBatchItems = null;

    /*!
     @brief Batch index code.
    
     Batch index code.
     
     @see EPS.Express.BatchIndexCode
     */
    this.BatchIndexCode = null;
};

/*!
 @class
 
 @brief BIN type codes
 
 @var NotFound Not found.
 @var Debit Debit.
 @var HealthCare Health care.
 @var Commercial Commercial.
 @var Other Other.
 @var PrepaidDebit Prepaid debit.
 */
EPS.Express.BINTypeCode =
{
    // Not found
    NotFound                                    : 0,
    // Debit
    Debit                                       : 1,
    // Health care
    HealthCare                                  : 2,
    // Commercial
    Commercial                                  : 3,
    // Other
    Other                                       : 4,
    // Prepaid debit
    PrepaidDebit                                : 5
};

/*!
 @class
 
 @brief BIN class

 The BIN class is used when performing BINQuery reqeusts.
 */
EPS.Express.BIN = function()
{
    /*!
     @brief BIN type code.
    
     BIN type code.
     
     @see EPS.Express.BINTypeCode
     */
    this.BINTypeCode = null;

    /*!
     @brief BIN type value.
    
     BIN type value.
     */
    this.BINTypeValue = null;

    /*!
     @brief BIN decorator.
    
     BIN decorator.
     */
    this.BINDecorator = null;
};

/*!
 @class
 
 @brief Card encrypted formats.
 
 @var Default Default, used for standard EPS encryption devices.
 @var Format1 Format 1, used for MagTek devices.
 @var Format2 Format 2, used for Ingenico DPP device.
 @var Format3 Format 3 used for Ingenico On-Guard devices.
 @var Format4 Format 4 used for IDTECH devices.
 */
EPS.Express.CardEncryptedFormat =
{
    // Default, used for standard EPS encryption devices
    Default                                     : 0,
    // Format 1, used for MagTek devices
    Format1                                     : 1,
    // Format 2, used for Ingenico DPP device
    Format2                                     : 2,
    // Format 3 used for Ingenico On-Guard devices
    Format3                                     : 3,
    // Format 4 used for IDTECH devices
    Format4                                     : 4
};

/*!
 @class
 
 @brief Card class.

 The Card class is used to transmit/receive cardholder information.
 */
EPS.Express.Card = function()
{
    /*!
     @brief Track 1 data.
    
     Clear text swiped track 1 data.
     */
    this.Track1Data = null;

    /*!
     @brief Track 2 data.
    
     Clear text swiped track 2 data.
     */
    this.Track2Data = null;

    /*!
     @brief Track 3 data.
    
     Clear text swiped track 3 data.
     */
    this.Track3Data = null;

    /*!
     @brief Magneprint data.
    
     Raw output of certain devices directly supported by Express.
     */
    this.MagneprintData = null;

    /*!
     @brief Card number.
    
     Manually keyed account number. If this field is used, ExpirationMonth and ExpirationYear must be used.
     */
    this.CardNumber = null;

    /*!
     @brief Truncated card number.
    
     Truncated card number.
     */
    this.TruncatedCardNumber = null;

    /*!
     @brief Expiration month.
    
     Manually keyed expiration month. This field is used along with CardNumber and ExpirationYear.
     */
    this.ExpirationMonth = null;

    /*!
     @brief Expiration year.
    
     Manually keyed expiration year. This field is used along with CardNumber and ExpirationMonth.
     */
    this.ExpirationYear = null;

    /*!
     @brief Card holder name.
    
     The name of the card holder as printed on the front of the card.
     */
    this.CardholderName = null;

    /*!
     @brief Card verification value.
    
     Card verification value found on the card.
     */
    this.CVV = null;

    /*!
     @brief Card authentication verification value.
    
     Card authentication verification value.
     */
    this.CAVV = null;

    /*!
     @brief Verified by Visa.
    
     Verified by Visa value.
     */
    this.XID = null;

    /*!
     @brief Encrypted PIN block.
    
     Encrypted PIN block information sent from the PIN encryption device.
     */
    this.PINBlock = null;

    /*!
     @brief PIN key serial number.
    
     PIN key serial number.
     */
    this.KeySerialNumber = null;

    /*!
     @brief Encrypted format.
    
     The format of of the encrypted card data.
     
     @see EPS.Express.CardEncryptedFormat
     */
    this.EncryptedFormat = null;

    /*!
     @brief Encrypted track 1 data.
    
     Encrypted swiped track 1 data.
     */
    this.EncryptedTrack1Data = null;

    /*!
     @brief Encrypted track 2 data.
    
     Encrypted swiped track 2 data.
     */
    this.EncryptedTrack2Data = null;

    /*!
     @brief Encrypted manually keyed card data.
    
     Encrypted manually keyed card data.
     */
    this.EncryptedCardData = null;

    /*!
     @brief Encrypted card data key serial number.
    
     Encrypted card data key serial number.
     */
    this.CardDataKeySerialNumber = null;

    /*!
     @brief Address verification response code.
    
     Address verification response code.
     */
    this.AVSResponseCode = null;

    /*!
     @brief Card verification value response code.
    
     Card verification value response code.
     */
    this.CVVResponseCode = null;

    /*!
     @brief Card authentication verification value response code.
    
     Card authentication verification value response code.
     */
    this.CAVVResponseCode = null;

    /*!
     @brief Card logo.
    
     Brand of the card. Possible values include: Visa, mastercard, Discover, Amex, Diners Club, JCB, Carte Blanche, Other.
     */
    this.CardLogo = null;
};

/*!
 @class
 
 @brief Credentials class.

 The Credentials class is required for every transaction and is used to authenticate the sender.
 */
EPS.Express.Credentials = function()
{
    /*!
     @brief Account ID.
    
     Unique account ID. Assigned by Element Payment Services.
     */
    this.AccountID = null;

    /*!
     @brief Account token.
    
     Secret token used for authentication. Assigned by Element Payment Services.
     */
    this.AccountToken = null;

    /*!
     @brief Acceptor ID.
    
     Unique merchant account identifier. Assigned by Element Payment Services.
     */
    this.AcceptorID = null;

    /*!
     @brief New account token.
    
     New secret token used for authentication. Assigned by Element Payment Services
     */
    this.NewAccountToken = null;
};

/*!
 @class
 
 @brief ExtendedParameters class.
 */
EPS.Express.ExtendedParameters = function()
{
    /*!
     @brief PaymentAccount class.
     
     @see EPS.Express.PaymentAccount
     */
    this.PaymentAccount = null;
};

/*!
 @class
 
 @brief Paging class.

 The Paging class is optional with the PaymentAccountQueryTokenReport request.
 */
EPS.Express.Paging = function()
{
    /*!
     @brief Page.
    
     PASS token report page number.
     */
    this.Page = null;
};

/*!
 @class
 
 @brief Parameters class.

 This class is used for reporting transactions.
 */
EPS.Express.Parameters = function()
{
    /*!
     @brief Transaction date/time begin.
    
     Date/time for the beginning of the transaction range formatted YYYY-MM-DD HH:MM:SS.FFF.
     */
    this.TransactionDateTimeBegin = null;

    /*!
     @brief Transaction date/time end.
    
     Date/time for the beginning of the transaction range formatted YYYY-MM-DD HH:MM:SS.FFF.
     */
    this.TransactionDateTimeEnd = null;

    /*!
     @brief Transaction ID.
    
     Unique transaction ID.
     */
    this.TransactionID = null;

    /*!
     @brief Terminal ID.
    
     Unique terminal identifier assigned by Element Payment Serivces.
     */
    this.TerminalID = null;

    /*!
     @brief Application ID.
    
     Unique application identifier. This value is assigned by Element Payment Services.
     */
    this.ApplicationID = null;

    /*!
     @brief Approval number.
    
     Issuer assigned approval number.
     */
    this.ApprovalNumber = null;

    /*!
     @brief Approved amount.
    
     Amount approved by the transaction.
     */
    this.ApprovedAmount = null;

    /*!
     @brief Express transaction date.
    
     Express transaction date formatted YYMMDD.
     */
    this.ExpressTransactionDate = null;

    /*!
     @brief Express transaction time.
    
     Express transaction time.
     */
    this.ExpressTransactionTime = null;

    /*!
     @brief Host batch ID.
    
     Host batch ID.
     */
    this.HostBatchID = null;

    /*!
     @brief Host item ID.
    
     Host item ID.
     */
    this.HostItemID = null;

    /*!
     @brief Host reversal queue ID.
    
     Host reversal queue ID.
     */
    this.HostReversalQueueID = null;

    /*!
     @brief Original authorized amount.
    
     Original authorized amount.
     */
    this.OriginalAuthorizedAmount = null;

    /*!
     @brief Reference number.
    
     Reference number.
     */
    this.ReferenceNumber = null;

    /*!
     @brief Shift ID.
    
     Shift ID.
     */
    this.ShiftID = null;

    /*!
     @brief Source transaction ID.
    
     Source transaction ID.
     */
    this.SourceTransactionID = null;

    /*!
     @brief Terminal type.
    
     Terminal type.
     
     @see EPS.Express.TerminalType
     */
    this.TerminalType = null;

    /*!
     @brief Tracking ID.
    
     Tracking ID.
     */
    this.TrackingID = null;

    /*!
     @brief Transaction amount.
    
     Transaction amount.
     */
    this.TransactionAmount = null;

    /*!
     @brief Transaction setup ID.
    
     Transaction setup ID.
     */
    this.TransactionSetupID = null;

    /*!
     @brief Transaction status.
    
     Transaction status.
     */
    this.TransactionStatus = null;

    /*!
     @brief Transaction type.
    
     Transaction type.
     */
    this.TransactionType = null;

    /*!
     @brief Verified by Visa value.
    
     Verified by Visa value.
     */
    this.XID = null;

    /*!
     @brief Reverse order.
    
     Indicates the records are in descending order.
     
     @see EPS.Express.BooleanType
     */
    this.ReverseOrder = null;
};

/*!
 @class
 
 @brief PASS updater batch statuses.
 
 @var Null Null.
 @var IncludedInNextBatch Included in next batch.
 @var NotIncludedInNextBatch Not included in next batch.
 */
EPS.Express.PASSUpdaterBatchStatus =
{
    // Null
    Null                                        : 0,
    // Included in next batch
    IncludedInNextBatch                         : 1,
    // Not included in next batch
    NotIncludedInNextBatch                      : 2
};

/*!
 @class
 
 @brief PASS updater options.
 
 @var Null Null.
 @var AutoUpdateDisabled Auto update enabled.
 @var AutoUpdateEnabled Auto update disabled.
 */
EPS.Express.PASSUpdaterOption =
{
    // Null
    Null                                        : 0,
    // Auto update enabled
    AutoUpdateEnabled                           : 1,
    // Auto update disabled
    AutoUpdateDisabled                          : 2
};

/*!
 @class
 
 @brief Payment account types.
 
 @var CreditCard Credit card.
 @var Checking Checking account.
 @var Savings Savings account.
 @var ACH ACH.
 @var Other Other.
 */
EPS.Express.PaymentAccountType =
{
    // Credit card
    CreditCard                                  : 0,
    // Checking account
    Checking                                    : 1,
    // Savings account
    Savings                                     : 2,
    // ACH
    ACH                                         : 3,
    // Other
    Other                                       : 4
};

/*!
 @class
 
 @brief Payment account class.

 This class is used in transactions utilizing our Payment Account Secure Storage (PASS) service.
 */
EPS.Express.PaymentAccount = function()
{
    /*!
     @brief Payment account ID..
    
     Unique GUID that identifies the payment account. The Express platform generates this.
     */
    this.PaymentAccountID = null;

    /*!
     @brief Payment account type.
    
     The type of payment account.
     
     @see EPS.Express.PaymentAccountType
     */
    this.PaymentAccountType = null;

    /*!
     @brief Payment account reference number.
    
     User generated reference number used to identify a payment account.
     */
    this.PaymentAccountReferenceNumber = null;

    /*!
     @brief Transaction setup ID.
    
     Unique GUID that identifies the transaction setup ID. The Express platform generates this.
     */
    this.TransactionSetupID = null;

    /*!
     @brief PASS updater batch status.
    
     Specifies whether or not the PASS record will be included in the next PASS updater batch.
     
     @see EPS.Express.PASSUpdaterBatchStatus
     */
    this.PASSUpdaterBatchStatus = null;

    /*!
     @brief PASS updater option.
    
     Specifies the match status of the PASS record.
     
     @see EPS.Express.PASSUpdaterOption
     */
    this.PASSUpdaterOption = null;
};

/*!
 @class
 
 @brief PASS updater statuses.
 
 @var Null Null.
 @var UpdateInProgress Update in progress.
 @var MatchNoChanges Match, no changes.
 @var MatchAccountChange Match, account changed.
 @var MatchExpirationChange Match, expiration date changed.
 @var MatchAccountClosed Match, account closed.
 @var MatchContactCardholder Match, contact cardholder.
 @var NoMatchParticipating No match, participating.
 @var NoMatchNonParticipating No match, non-participating.
 @var InvalidInfo Invalid information.
 @var NoResponse No response.
 @var NotAllowed Not allowed.
 @var Error Error.
 @var PASSUpdaterDisabled PASS updater disabled.
 @var NotUpdated Not updated.
 */
EPS.Express.PASSUpdaterStatus =
{
    // Null
    Null                                        : 0,
    // Update in progress
    UpdateInProgress                            : 1,
    // Match, no changes
    MatchNoChanges                              : 2,
    // Match, account changed
    MatchAccountChange                          : 3,
    // Match, expiration date changed
    MatchExpirationChange                       : 4,
    // Match, account closed
    MatchAccountClosed                          : 5,
    // Match, contact cardholder
    MatchContactCardholder                      : 6,
    // No match, participating
    NoMatchParticipating                        : 7,
    // No match, non-participating
    NoMatchNonParticipating                     : 8,
    // Invalid information
    InvalidInfo                                 : 9,
    // No response
    NoResponse                                  : 10,
    // Not allowed
    NotAllowed                                  : 11,
    // Error
    Error                                       : 12,
    // PASS updater disabled
    PASSUpdaterDisabled                         : 13,
    // Not updated
    NotUpdated                                  : 14
};

/*!
 @class
 
 @brief Payment account parameters class.

 This class is used in transactions utilizing our Payment Account Secure Storage (PASS) service.
 */
EPS.Express.PaymentAccountParameters = function()
{
    /*!
     @brief Payment account ID.
    
     Unique GUID that identifies the payment account. The Express platform generates this.
     */
    this.PaymentAccountID = null;

    /*!
     @brief Payment account type.
    
     The type of payment account.
     
     @see EPS.Express.PaymentAccountType
     */
    this.PaymentAccountType = null;

    /*!
     @brief Payment account reference number.
    
     User generated reference number used to identify a payment account.
     */
    this.PaymentAccountReferenceNumber = null;

    /*!
     @brief Payment brand.
    
     Card type for the query. Must match exactly and can be Visa, MasterCard, Discover, Amex, or Diners Club.
     */
    this.PaymentBrand = null;

    /*!
     @brief Expiration month begin.
    
     Beginning expiration month for the query.
     */
    this.ExpirationMonthBegin = null;

    /*!
     @brief Expiration month end.
    
     Ending expiration month for the query.
     */
    this.ExpirationMonthEnd = null;

    /*!
     @brief Expiration year begin.
    
     Beginning expiration year for the query.
     */
    this.ExpirationYearBegin = null;

    /*!
     @brief Expiration year end.
    
     Ending expiration year for the query.
     */
    this.ExpirationYearEnd = null;

    /*!
     @brief Transaction setup ID.
    
     Unique GUID that identifies the transaction setup ID. The Express platform generates this.
     */
    this.TransactionSetupID = null;

    /*!
     @brief PASS updater batch status.
    
     Specifies whether or not the PASS record will be included in the next PASS updater batch.
     
     @see EPS.Express.PASSUpdaterBatchStatus
     */
    this.PASSUpdaterBatchStatus = null;

    /*!
     @brief PASS updater date/time begin.
    
     Beginning date and time for the query formatted yyyy-MM-dd HH:mm:ss.fff.
     */
    this.PASSUpdaterDateTimeBegin = null;

    /*!
     @brief PASS updater date/time end.
    
     Ending date and time for the query formatted yyyy-MM-dd HH:mm:ss.fff.
     */
    this.PASSUpdaterDateTimeEnd = null;

    /*!
     @brief PASS updater status.
    
     Specifies the match status of the PASS record.
     
     @see EPS.Express.PASSUpdaterStatus
     */
    this.PASSUpdaterStatus = null;
};

/*!
 @class
 
 @brief Payment account query record count class.

 This class is a utility class that defines individual items in the QueryData field returned in a PaymentAccountQueryRecordCount response. This class is not part of the Express message specification.
 */
EPS.Express.PaymentAccountQueryRecordCountItem = function()
{
    /*!
     @brief Record count.
    
     Record count.
     */
    this.RecordCount = null;

    /*!
     @brief Page count.
    
     Page count.
     */
    this.PageCount = null;
};

/*!
 @class
 
 @brief Payment account token report item class.

 This class is a utility class that defines individual items in the QueryData field returned in a PaymentAccountQueryTokenReport response. This class is not part of the Express message specification.
 */
EPS.Express.PaymentAccountTokenReportItem = function()
{
    /*!
     @brief Payment account ID.
    
     Unique GUID that identifies the payment account. The Express platform generates this.
     */
    this.T = null;

    /*!
     @brief Payment account reference number.
    
     User generated reference number used to identify a payment account.
     */
    this.R = null;
};

/*!
 @class
 
 @brief Payment account guery item class.

 This class is a utility class that defines individual items in the QueryData field returned in a PaymentAccountQuery response. This class is not part of the Express message specification.
 */
EPS.Express.PaymentAccountQueryItem = function()
{
    /*!
     @brief Payment account ID.
    
     Unique GUID that identifies the payment account. The Express platform generates this.
     */
    this.PaymentAccountID = null;

    /*!
     @brief Payment account type.
    
     The type of payment account.
     
     @see EPS.Express.PaymentAccountType
     */
    this.PaymentAccountType = null;

    /*!
     @brief Truncated account number.
    
     Truncated account number associated with this payment account.
     */
    this.TruncatedCardNumber = null;

    /*!
     @brief Expiration month.
    
     Expiration month for the account associated with this payment account.
     */
    this.ExpirationMonth = null;

    /*!
     @brief Expiration year.
    
     Expiration year for the account associated with this payment account.
     */
    this.ExpirationYear = null;

    /*!
     @brief Payment account reference number.
    
     User generated reference number used to identify a payment account.
     */
    this.PaymentAccountReferenceNumber = null;

    /*!
     @brief Payment brand.
    
     Card type for the query. Must match exactly and can be Visa, MasterCard, Discover, Amex, or Diners Club.
     */
    this.PaymentBrand = null;

    /*!
     @brief PASS updater batch status.
    
     Specifies whether or not the PASS record will be included in the next PASS updater batch.
     
     @see EPS.Express.PASSUpdaterBatchStatus
     */
    this.PASSUpdaterBatchStatus = null;

    /*!
     @brief PASS updater status.
    
     Specifies the match status of the PASS record.
     
     @see EPS.Express.PASSUpdaterStatus
     */
    this.PASSUpdaterStatus = null;
};

/*!
 @class
 
 @brief Reporting data item class.

 This class is a utility class that defines individual items in the ReportingData field. This class is not part of the Express message specification.
 */
EPS.Express.ReportingDataItem = function()
{
    /*!
     @brief Terminal ID.
    
     Unique transaction identifier.
     */
    this.TransactionID = null;

    /*!
     @brief Acceptor ID.
    
     Unique merchant account identifier. Assigned by Element Payment Services.
     */
    this.AcceptorID = null;

    /*!
     @brief Account ID.
    
     Unique account ID. Assigned by Element Payment Services.
     */
    this.AccountID = null;

    /*!
     @brief Name.
    
     Name.
     */
    this.Name = null;

    /*!
     @brief Terminal ID.
    
     Unique terminal identifier assigned by Element Payment Serivces.
     */
    this.TerminalID = null;

    /*!
     @brief Application ID.
    
     Unique application identifier. This value is assigned by Element Payment Services.
     */
    this.ApplicationID = null;

    /*!
     @brief Approval number.
    
     Issuer assigned approval number.
     */
    this.ApprovalNumber = null;

    /*!
     @brief Approved amount.
    
     Approved dollar amount.
     */
    this.ApprovedAmount = null;

    /*!
     @brief Address verification response code.
    
     Address verification response code.
     */
    this.AVSResponseCode = null;

    /*!
     @brief Card verification value response code.
    
     Card verification value response code.
     */
    this.CVVResponseCode = null;

    /*!
     @brief Expiration month.
    
     Expiration month.
     */
    this.ExpirationMonth = null;

    /*!
     @brief Expiration year.
    
     Expiration year.
     */
    this.ExpirationYear = null;

    /*!
     @brief Express response code.
    
     The result of the transaction as determined by Express.
     
     @see EPS.Express.ResponseCode
     */
    this.ExpressResponseCode = null;

    /*!
     @brief Express response message.
    
     A brief text description of the result of the transaction as determined by Express.
     */
    this.ExpressResponseMessage = null;

    /*!
     @brief Host batch ID.
    
     Host batch ID.
     */
    this.HostBatchID = null;

    /*!
     @brief Host item ID.
    
     Host item ID.
     */
    this.HostItemID = null;

    /*!
     @brief Host response code.
    
     Response code for the transaction returned by the host that processed the transaction.
     */
    this.HostResponseCode = null;

    /*!
     @brief Host response message.
    
     Response message for the transaction returned by the host that processed the transaction.
     */
    this.HostResponseMessage = null;

    /*!
     @brief Reference number.
    
     User assigned reference number.
     */
    this.ReferenceNumber = null;

    /*!
     @brief Tracking ID.
    
     Tracking ID.
     */
    this.TrackingID = null;

    /*!
     @brief Transaction amount.
    
     Dollar amount of the transaction.
     */
    this.TransactionAmount = null;

    /*!
     @brief Transaction status.
    
     Description of the status/state of the transaction.
     */
    this.TransactionStatus = null;

    /*!
     @brief Transaction status code.
    
     Status/state of the transaction.
     
     @see EPS.Express.TransactionStatusCode
     */
    this.TransactionStatusCode = null;

    /*!
     @brief Transaction type.
    
     Type of transaction.
     */
    this.TransactionType = null;

    /*!
     @brief Transaction type (CONVENIENCE).
    
     Type of transaction.
     */
    this.TransactionTypeEx = EPS.Express.Type.Unknown;

    /*!
     @brief Card number masked.
    
     Masked card account number.
     */
    this.CardNumberMasked = null;

    /*!
     @brief Card logo.
    
     Brand of the card. Possible values include: Visa, mastercard, Discover, Amex, Diners Club, JCB, Carte Blanche, Other.
     */
    this.CardLogo = null;

    /*!
     @brief Track data present.
    
     Indicates whether track data was present in the transaction.
     */
    this.TrackDataPresent = false;

    /*!
     @brief Express transaction date.
    
     The date when Express processed the transaction. The timezone for this value is determined by ExpressTransactionTimezone. The format of this property is YYYYMMDD.
     */
    this.ExpressTransactionDate;

    /*!
     @brief Express transaction time.
    
     The time when Express processed the transaction. The timezone for this value is determined by ExpressTransactionTimezone. The format of this property is HHMMSS where HH is 00-23.
     */
    this.ExpressTransactionTime = null;

    /*!
     @brief Time stamp.
    
     Time stamp.
     */
    this.TimeStamp = null;
};

/*!
 @class
 
 @brief Terminal types.
 
 @var Unknown Unknown.
 @var PointOfSale Point-of-sale.
 @var ECommerce E-commerce.
 @var MOTO Mail/telephone order.
 @var FuelPump Fuel pump.
 @var ATM ATM.
 @var Voice Voice.
 */
EPS.Express.TerminalType =
{
    // Unknown
    Unknown                                     : 0,
    // Point-of-sale
    PointOfSale                                 : 1,
    // E-commerce
    ECommerce                                   : 2,
    // Mail/telephone order
    MOTO                                        : 3,
    // Fuel pump
    FuelPump                                    : 4,
    // ATM
    ATM                                         : 5,
    // Voice
    Voice                                       : 6
};

/*!
 @class
 
 @brief Card present codes
 
 @var Default Default.
 @var Unknown Unknown.
 @var Present Present.
 @var NotPresent Not present.
 */
EPS.Express.CardPresentCode =
{
    // Default
    Default                                     : 0,
    // Unknown
    Unknown                                     : 1,
    // Present
    Present                                     : 2,
    // Not present
    NotPresent                                  : 3
};

/*!
 @class
 
 @brief Card holder present codes
 
 @var Default Default.
 @var Unknown Unknown.
 @var Present Present.
 @var NotPresent Not present.
 @var MailOrder Mail order.
 @var PhoneOrder Phone order.
 @var StandingAuth Standing authorization.
 @var ECommerce E-commerce.
 */
EPS.Express.CardHolderPresentCode =
{
    // Default
    Default                                     : 0,
    // Unknown
    Unknown                                     : 1,
    // Present
    Present                                     : 2,
    // Not present
    NotPresent                                  : 3,
    // Mail order
    MailOrder                                   : 4,
    // Phone order
    PhoneOrder                                  : 5,
    // Standing authorization
    StandingAuth                                : 6,
    // E-commerce
    ECommerce                                   : 7
};

/*!
 @class
 
 @brief Card input codes

 @var Default Default.
 @var Unknown Unknown.
 @var MagstripeRead Magnetic stripe read.
 @var ContactlessMagstripeRead Contactless card read.
 @var ManualKeyed Manually keyed.
 @var ManualKeyedMagstripeFailure Manually keyed, magnetic stripe failure.
 */
EPS.Express.CardInputCode =
{
    // Default
    Default                                     : 0,
    // Unknown
    Unknown                                     : 1,
    // Magnetic stripe read
    MagstripeRead                               : 2,
    // Contactless card read
    ContactlessMagstripeRead                    : 3,
    // Manually keyed
    ManualKeyed                                 : 4,
    // Manually keyed, magnetic stripe failure
    ManualKeyedMagstripeFailure                 : 5
};

/*!
 @class
 
 @brief CVV presence codes
 
 @var Default Default.
 @var NotProvided Not provided.
 @var Provided Provided.
 @var Illegible Illegible.
 @var CustomerIllegible Customer illegible.
 */
EPS.Express.CVVPresenceCode =
{
    // Default
    Default                                     : 0,
    // Not provided
    NotProvided                                 : 1,
    // Provided
    Provided                                    : 2,
    // Illegible
    Illegible                                   : 3,
    // Customer illegible
    CustomerIllegible                           : 4
};

/*!
 @class
 
 @brief Terminal capability codes
 
 @var Default Default.
 @var Unknown Unknown.
 @var NoTerminal No terminal.
 @var MagstripeReader Magnetic stripe reader.
 @var ContactlessMagstripeReader Contactless card reader.
 @var KeyEntered Key entered.
 */
EPS.Express.TerminalCapabilityCode =
{
    // Default
    Default                                     : 0,
    // Unknown
    Unknown                                     : 1,
    // No terminal
    NoTerminal                                  : 2,
    // Magnetic stripe reader
    MagstripeReader                             : 3,
    // Contactless card reader
    ContactlessMagstripeReader                  : 4,
    // Key entered
    KeyEntered                                  : 5
};

/*!
 @class
 
 @brief Terminal environment codes
 
 @var Default Default.
 @var NoTerminal No terminal.
 @var LocalAttended Local attended.
 @var LocalUnattended Local unattended.
 @var RemoteAttended Remote attended.
 @var RemoteUnattended Remote unattended.
 @var ECommerce E-commerce.
 */
EPS.Express.TerminalEnvironmentCode =
{
    // Default
    Default                                     : 0,
    // No terminal
    NoTerminal                                  : 1,
    // Local attended
    LocalAttended                               : 2,
    // Local unattended
    LocalUnattended                             : 3,
    // Remote attended
    RemoteAttended                              : 4,
    // Remote unattended
    RemoteUnattended                            : 5,
    // E-commerce
    ECommerce                                   : 6
};

/*!
 @class
 
 @brief Moto/ECI codes
 
 @var Default Default.
 @var NotUsed Not used.
 @var Single Single.
 @var Recurring Recurring.
 @var Installment Installment.
 @var SecureElectronicCommerce Secure e-commerce.
 @var NonAuthenticatedSecureTransaction Non-authenticated secure transaction.
 @var NonAuthenticatedSecureECommerceTransaction Non-authenticated secure e-commerce transaction.
 @var NonSecureECommerceTransaction Non-secure e-commerce transaction.
 */
EPS.Express.MotoECICode =
{
    // Default
    Default                                     : 0,
    // Not used
    NotUsed                                     : 1,
    // Single
    Single                                      : 2,
    // Recurring
    Recurring                                   : 3,
    // Installment
    Installment                                 : 4,
    // Secure e-commerce
    SecureElectronicCommerce                    : 5,
    // Non-authenticated secure transaction
    NonAuthenticatedSecureTransaction           : 6,
    // Non-authenticated secure e-commerce transaction
    NonAuthenticatedSecureECommerceTransaction  : 7,
    // Non-secure e-commerce transaction
    NonSecureECommerceTransaction               : 8
};

/*!
 @class
 
 @brief CVV response types
 
 @var Regular Regular.
 @var Extended Extended.
 */
EPS.Express.CVVResponseType =
{
    // Regular
    Regular                                     : 0,
    // Extended
    Extended                                    : 1
};

/*!
 @class
 
 @brief Consent codes
 
 @var NotSpecified Not specified.
 @var FaceToFace Face-to-face.
 @var Phone Phone.
 @var Internet Internet.
 */
EPS.Express.ConsentCode =
{
    // Not specified
    NotSpecified                                : 0,
    // Face-to-face
    FaceToFace                                  : 1,
    // Phone
    Phone                                       : 2,
    // Internet
    Internet                                    : 3
};

/*!
 @class
 
 @brief Terminal encryption formats
 
 @var Default Default, used for standard EPS encryption devices.
 @var Format1 Format 1, used for MagTek devices.
 @var Format2 Format 2, used for Ingenico DPP device.
 @var Format3 Format 3 used for Ingenico On-Guard devices.
 @var Format4 Format 4 used for IDTECH devices.
 */
EPS.Express.TerminalEncryptionFormat =
{
    // Default, used for standard EPS encryption devices
    Default                                     : 0,
    // Format 1, used for MagTek devices
    Format1                                     : 1,
    // Format 2, used for Ingenico DPP device
    Format2                                     : 2,
    // Format 3 used for Ingenico On-Guard devices
    Format3                                     : 3,
    // Format 4 used for IDTECH devices
    Format4                                     : 4
};

/*!
 @class
 
 @brief Terminal class.

 The terminal class identifies characteristics of the payment device used.
 */
EPS.Express.Terminal = function()
{
    /*!
     @brief Terminal ID.
    
     Unique terminal identifier assigned by Element Payment Serivces.
     */
    this.TerminalID = null;

    /*!
     @brief Terminal type.
    
     Specifies what type of terminal is used to send the transaction.
     
     @see EPS.Express.TerminalType
     */
    this.TerminalType = null;

    /*!
     @brief Card present code.
    
     Specifies the location of the card at the time of the transaction.
     
     @see EPS.Express.CardPresentCode
     */
    this.CardPresentCode = null;

    /*!
     @brief Cardholder present code.
    
     Location of the cardholder at the time of the transaction.
     
     @see EPS.Express.CardHolderPresentCode
     */
    this.CardholderPresentCode = null;

    /*!
     @brief Card input code.
    
     Specifies the means by which the card number or track data was acquired.
     
     @see EPS.Express.CardInputCode
     */
    this.CardInputCode = null;

    /*!
     @brief CVV presence code.
    
     Specifies whether the CVV code is included in the transaction or the reason why it could not be obtained.
     
     @see EPS.Express.CVVPresenceCode
     */
    this.CVVPresenceCode = null;

    /*!
     @brief Terminal capability code.
    
     Specifies the capabilities of the terminal.
     
     @see EPS.Express.TerminalCapabilityCode
     */
    this.TerminalCapabilityCode = null;

    /*!
     @brief Terminal environment code.
    
     Specifies whether a payment terminal is used or environment in which the terminal is installed.
     
     @see EPS.Express.TerminalEnvironmentCode
     */
    this.TerminalEnvironmentCode = null;

    /*!
     @brief MOTO/ECI code.
    
     Used on mail/telephone order or e-commerce transactions to identify they type of transaction and the means by which it was obtained.
     
     @see EPS.Express.MotoECICode
     */
    this.MotoECICode = null;

    /*!
     @brief CVV response type.
    
     Type of CVV response codes returned by the host.
     
     @see EPS.Express.CVVResponseType
     */
    this.CVVResponseType = null;

    /*!
     @brief Consent code.
    
     Specifies how the consumer consent for the transaction was received.
     
     @see EPS.Express.ConsentCode
     */
    this.ConsentCode = null;

    /*!
     @brief Terminal serial number.
    
     Serial number of the terminal used for the transaction.
     */
    this.TerminalSerialNumber = null;

    /*!
     @brief Terminal encryption format.
    
     Specifies the encryption formation of the device used for the transaction.
     
     @see EPS.Express.TerminalEncryptionFormat
     */
    this.TerminalEncryptionFormat = null;
};

/*!
 @class
 
 @brief Reversal types
 
 @var System System.
 @var Full Full.
 @var Partial Partial.
 */
EPS.Express.ReversalType =
{
    // System
    System                                      : 0,
    // Full
    Full                                        : 1,
    // Partial
    Partial                                     : 2
};

/*!
 @class
 
 @brief Market codes

 @var Default Default.
 @var AutoRental Auto rental.
 @var DirectMarketing Direct marketing.
 @var ECommerce E-commerce.
 @var FoodRestaurant Food/restaurant.
 @var HotelLodging Hotel/lodging.
 @var Petroleum Petroleum.
 @var Retail Retail.
 @var QSR QSR.
 */
EPS.Express.MarketCode =
{
    // Default
    Default                                     : 0,
    // Auto rental
    AutoRental                                  : 1,
    // Direct marketing
    DirectMarketing                             : 2,
    // E-commerce
    ECommerce                                   : 3,
    // Food/restaurant
    FoodRestaurant                              : 4,
    // Hotel/lodging
    HotelLodging                                : 5,
    // Petroleum
    Petroleum                                   : 6,
    // Retail
    Retail                                      : 7,
    // QSR
    QSR                                         : 8
};

/*!
 @class
 
 @brief Transaction status codes.
 
 @var InProcess In process.
 @var Approved Approved.
 @var Declined Declined.
 @var Duplicate Duplicate.
 @var Voided Voided.
 @var Authorized Authorized.
 @var AuthComplete Authorization complete.
 @var Reversed Reversed.
 @var Success Success.
 @var Returned Returned.
 @var Pending Pending.
 @var Queued Queued.
 @var Unknown Unknown.
 @var Error Error.
 @var Originated Originated.
 @var Settled Settled.
 @var PartialApproved Partially approved.
 @var Rejected Rejected.
 */
EPS.Express.TransactionStatusCode =
{
    // In process
    InProcess                                   : 0,
    // Approved
    Approved                                    : 1,
    // Declined
    Declined                                    : 2,
    // Duplicate
    Duplicate                                   : 3,
    // Voided
    Voided                                      : 4,
    // Authorized
    Authorized                                  : 5,
    // Authorization complete
    AuthComplete                                : 6,
    // Reversed
    Reversed                                    : 7,
    // Success
    Success                                     : 8,
    // Returned
    Returned                                    : 9,
    // Pending
    Pending                                     : 10,
    // Queued
    Queued                                      : 11,
    // Unknown
    Unknown                                     : 12,
    // Error
    Error                                       : 13,
    // Originated
    Originated                                  : 14,
    // Settled
    Settled                                     : 15,
    // Partially approved
    PartialApproved                             : 16,
    // Rejected
    Rejected                                    : 17
};

/*!
 @class
 
 @brief Transaction class.

 The transaction class specifies information about the transaction.
 */
EPS.Express.Transaction = function()
{
    /*!
     @brief Terminal ID.
    
     Unique transaction identifier.
     */
    this.TransactionID = null;
    
    /*!
     @brief Clerk number.
    
     Identifier for the clerk performing the transaction.
     */
    this.ClerkNumber = null;
    
    /*!
     @brief Shift ID.
    
     Identifier for the shift during which the transaction in performed.
     */
    this.ShiftID = null;
    
    /*!
     @brief Transaction amount.
    
     Dollar amount of the transaction.
     */
    this.TransactionAmount = null;
    
    /*!
     @brief Original authorized amount.
    
     Original dollar amount authorized.
     */
    this.OriginalAuthorizedAmount = null;
    
    /*!
     @brief Total authorized amount.
    
     Total dollar amount authorized.
     */
    this.TotalAuthorizedAmount = null;
    
    /*!
     @brief Sales tax amount.
    
     Sales tax dollar amount.
     */
    this.SalesTaxAmount = null;
    
    /*!
     @brief Tip amount.
    
     Tip dollar amount.
     */
    this.TipAmount = null;
    
    /*!
     @brief Approval number.
    
     Issuer assigned approval number.
     */
    this.ApprovalNumber = null;
    
    /*!
     @brief Reference number.
    
     User assigned reference number.
     */
    this.ReferenceNumber = null;
    
    /*!
     @brief Ticket number.
    
     Used for direct marketing, mail/telephone order, and e-commerce transactions. Required when the card number is manually keyed.
     */
    this.TicketNumber = null;
    
    /*!
     @brief Reversal type.
    
     Specifies the type of reversal.
     
     @see EPS.Express.ReversalType
     */
    this.ReversalType = null;
    
    /*!
     @brief Market code.
    
     Specifies the industy of the merchant. Set this value to EPS.Express.MarketCodeDefault to use the market code from the merchant profile.
     
     @see EPS.Express.MarketCode
     */
    this.MarketCode = null;
    
    /*!
     @brief Acquirer data.
    
     Data returned by the acquirer.
     */
    this.AcquirerData = null;
    
    /*!
     @brief Cash back amount.
    
     Cash back dollar amount.
     */
    this.CashBackAmount = null;
    
    /*!
     @brief Bill payment flag.
    
     Specifies whether this is a bill payment transaction or not.
     
     @see EPS.Express.BooleanType
     */
    this.BillPaymentFlag = null;
    
    /*!
     @brief Duplicate check disable flag.
    
     Disables duplicate checking for this transaction.
     
     @see EPS.Express.BooleanType
     */
    this.DuplicateCheckDisableFlag = null;
    
    /*!
     @brief Duplicate override flag.
    
     Overrides duplicate transaction checking at the host for transactions that were previously retruned as being a duplicate.
     
     @see EPS.Express.BooleanType
     */
    this.DuplicateOverrideFlag = null;
    
    /*!
     @brief Recurring flag.
    
     Spcifies if this is part of a recurring series of transactions.
     
     @see EPS.Express.BooleanType
     */
    this.RecurringFlag = null;
    
    /*!
     @brief Commercial card customer code.
    
     Commercial card customer code.
     */
    this.CommercialCardCustomerCode = null;
    
    /*!
     @brief Processor name.
    
     Name of the processor that processed the transaction.
     */
    this.ProcessorName = null;
    
    /*!
     @brief Transaction status.
    
     Description of the status/state of the transaction.
     */
    this.TransactionStatus = null;
    
    /*!
     @brief Transaction status code.
    
     Status/state of the transaction.
     
     @see EPS.Express.TransactionStatusCode
     */
    this.TransactionStatusCode = null;
    
    /*!
     @brief Host transaction ID.
    
     Transaction ID from the host processor.
     */
    this.HostTransactionID = null;
    
    /*!
     @brief Transaction setup ID.
    
     Unique GUID generated by Express that identifies the tranaction setup ID.
     */
    this.TransactionSetupID = null;
    
    /*!
     @brief Merchant verification value.
    
     Merchant verification value.
     */
    this.MerchantVerificationValue = null;
    
    /*!
     @brief Partial approved flag.
    
     Indicates whether the software supports partial approvals.
     
     @see EPS.Express.BooleanType
     */
    this.PartialApprovedFlag = null;
    
    /*!
     @brief Approved amount.
    
     Approved dollar amount.
     */
    this.ApprovedAmount = null;
    
    /*!
     @brief Commercial card response code.
    
     Commercial card response code.
     */
    this.CommercialCardResponseCode = null;
    
    /*!
     @brief Balance amount.
    
     Balance dollar amount. This amount may be negative.
     */
    this.BalanceAmount = null;
    
    /*!
     @brief Balance currency code.
    
     Currency code for the balance amount.
     */
    this.BalanceCurrencyCode = null;
};

/*!
 @class
 
 @brief Transaction setup methods
 
 @var Default Default.
 @var CreditCardSale Credit card sale.
 @var CreditCardAuthorization Credit card authorization.
 @var CreditCardAVSOnly  Credit card AVS only.
 @var CreditCardForce Credit card force.
 @var DebitCardSale Debit card sale.
 @var CheckSale  Check sale.
 @var PaymentAccountCreate Payment account create.
 @var PaymentAccountUpdate Payment account update.
 @var Sale Sale.
 */
EPS.Express.TransactionSetupMethod =
{
    // Default
    Default                                     : 0,
    // Credit card sale
    CreditCardSale                              : 1,
    // Credit card authorization
    CreditCardAuthorization                     : 2,
    // Credit card AVS only
    CreditCardAVSOnly                           : 3,
    // Credit card force
    CreditCardForce                             : 4,
    // Debit card sale
    DebitCardSale                               : 5,
    // Check sale
    CheckSale                                   : 6,
    // Payment account create
    PaymentAccountCreate                        : 7,
    // Payment account update
    PaymentAccountUpdate                        : 8,
    // Sale
    Sale                                        : 9
};

/*!
 @class
 
 @brief Transaction setup devices
 
 @var Default Default.
 @var MagtekEncryptedSwipe MagTek encrypted swipe.
 @var EncryptedInputDevice Encrypted input device (reserved for future use).
 */
EPS.Express.TransactionSetupDevice =
{
    // Default
    Default                                     : 0,
    // MagTek encrypted swipe
    MagtekEncryptedSwipe                        : 1,
    // Encrypted input device (reserved for future use)
    EncryptedInputDevice                        : 2
};

/*!
 @class
 
 @brief Device input codes
 
 @var NotUsed Not used.
 @var Unknown Unknown.
 @var Terminal Terminal.
 @var Keyboard Keyboard.
 */
EPS.Express.DeviceInputCode =
{
    // Not used
    NotUsed                                     : 0,
    // Unknown
    Unknown                                     : 1,
    // Terminal
    Terminal                                    : 2,
    // Keyboard
    Keyboard                                    : 3
};

/*!
 @class
 
 @brief Transaction setup class.

 The transaction setup class is used to initiate a HostedPayments transaction.
 */
EPS.Express.TransactionSetup = function()
{
    /*!
     @brief Transaction setup ID.
    
     Unique GUID generated by Express that identifies the tranaction setup ID.
     */
    this.TransactionSetupID = null;

    /*!
     @brief Transaction setup methods.
    
     Specifies the transaction method used for the transaction.
     
     @see EPS.Express.TransactionSetupMethod
     */
    this.TransactionSetupMethod = null;

    /*!
     @brief Device.
    
     Entry device used.
     
     @see EPS.Express.TransactionSetupDevice
     */
    this.Device = null;

    /*!
     @brief Embedded.
    
     Specifies if the card entry page will be embedded in a application.
     
     @see EPS.Express.BooleanType
     */
    this.Embedded = null;

    /*!
     @brief CVV required.
    
     Requires use to enter CVV2, CVC2, or CID values.
     
     @see EPS.Express.BooleanType
     */
    this.CVVRequired = null;

    /*!
     @brief Auto return.
    
     Specifies if the approval page will be automatically returned to the ReturnURL.
     
     @see EPS.Express.BooleanType
     */
    this.AutoReturn = null;

    /*!
     @brief Company name.
    
     Name of the merchant.
     */
    this.CompanyName = null;

    /*!
     @brief Logo URL.
    
     HTTPS URL of the merchant logo.
     */
    this.LogoURL = null;

    /*!
     @brief Tag line.
    
     Text displayed next to the logo.
     */
    this.Tagline = null;

    /*!
     @brief Welcome message.
    
     Text to display to customer. If not provided, a generic message will be displayed.
     */
    this.WelcomeMessage = null;

    /*!
     @brief Return URL.
    
     Return URL link displayed after the transaction is completed or cancelled. The calling application may handle the Hosted Payments URL any way it sees fit, but there are two built-in mechanisms available to help.
     
     1. If the calling application prefixes the ReturnURL with "epshpr", the native side will:
     
        <ol type='i'>
        <li>Intercept the loading of that URL.</li>
        <li>Parse the Hosted Payments response.</li>
        <li>Strip "epshpr" from and navigate to the URL.</li>
        <li>Wait for a call to EPS.Express.readyForHostedPaymentsResponse.</li>
        <li>Generate an onCompleted event with the result of the transaction.</li>
        </ol>
        
     2. If the calling application chooses to handle the Hosted Payments response on its own, it may use EPS.Express.parseHostedPaymentsReturnUrl and the native side will:
     
        <ol type='i'>
        <li>Parse the Hosted Payments response.</li>
        <li>Generate an onCompleted event with the result of the transaction.</li>
        </ol>
        
     @seealso //eps_ref/js/data/EPS.Express/.readyForHostedPaymentsResponse EPS.Express.readyForHostedPaymentsResponse
     @seealso //eps_ref/js/data/EPS.Express/.parseHostedPaymentsReturnUrl EPS.Express.parseHostedPaymentsReturnUrl
     */
    this.ReturnURL = null;

    /*!
     @brief Return URL title.
    
     Text to diplay for return ULR. If not provided, "Return to merchant" will be displayed.
     */
    this.ReturnURLTitle = null;

    /*!
     @brief Order details.
    
     Text to describe purchase or detail information.
     */
    this.OrderDetails = null;

    /*!
     @brief Process transaction title.
    
     Text to describe submit button.
     */
    this.ProcessTransactionTitle = null;

    /*!
     @brief Validation code.
    
     Unique coded returned from a TransactionSetup requst and as part of the query string redirect during a successful Hosted Payments request.
     */
    this.ValidationCode = null;

    /*!
     @brief Device input code.
    
     Specifies the entry devcie input type used for the transaction.
     
     @see EPS.Express.DeviceInputCode
     */
    this.DeviceInputCode = null;
};

/*!
 @class
 
 @brief Response codes
 
 @var Approved Approved.
 @var PartialApproval Partially approved.
 @var Decline Declined.
 @var ExpiredCard Expired card.
 @var DuplicateApproved Duplicate approved.
 @var Duplicate Duplicate.
 @var PickUpCard Pick up card.
 @var ReferralCallIssuer Referral, call issuer.
 @var BalanceNotAvailable Balance is not available.
 @var NotDefined Not defined.
 @var InvalidData Invalid data.
 @var InvalidAccount Invalid account.
 @var InvalidRequest Invalid request.
 @var AuthorizationFailed Authorization failed.
 @var NotAllowed Not allowed.
 @var OutOfBalance Out of balance.
 @var CommunicationError Communication error.
 @var HostError Host error.
 @var HostedPaymentsCancelled Hosted Payments cancelled.
 */
EPS.Express.ResponseCode =
{
    // Approved
    Approved                                    : 0,
    // Partially approved
    PartialApproval                             : 5,
    // Declined
    Decline                                     : 20,
    // Expired card
    ExpiredCard                                 : 21,
    // Duplicate approved
    DuplicateApproved                           : 22,
    // Duplicate
    Duplicate                                   : 23,
    // Pick up card
    PickUpCard                                  : 24,
    // Referral, call issuer
    ReferralCallIssuer                          : 25,
    // Balance is not available
    BalanceNotAvailable                         : 30,
    // Not defined
    NotDefined                                  : 90,
    // Invalid data
    InvalidData                                 : 101,
    // Invalid account
    InvalidAccount                              : 102,
    // Invalid request
    InvalidRequest                              : 103,
    // Authorization failed
    AuthorizationFailed                         : 104,
    // Not allowed
    NotAllowed                                  : 105,
    // Out of balance
    OutOfBalance                                : 120,
    // Communication error
    CommunicationError                          : 1001,
    // Host error
    HostError                                   : 1002,
    
    // Hosted Payments cancelled
    HostedPaymentsCancelled                     : 10000
};

/*!
 @class
 
 @brief Response class.

 The response class is used to communicate any output messages back to the sender. An ExpressResponseCode is returned with every transaction and should be the first field examined to determine success or failure.
 */
EPS.Express.Response = function()
{
    /*!
     @brief Credentials class.
    
     An instance of the Credentials class. NOTE: This property is only present if the Credentials class is present in the Express response.
     */
    this.Credentials = null;

    /*!
     @brief Card class.
    
     An instance of the Credentials class. NOTE: This property is only present if the Card class is present in the Express response.
     */
    this.Card = null;

    /*!
     @brief Batch class.
    
     An instance of the Batch class. NOTE: This property is only present if the Batch class is present in the Express response.
     */
    this.Batch = null;

    /*!
     @brief Transaction class.
    
     An instance of the Transaction class. NOTE: This property is only present if the Transaction class is present in the Express response.
     */
    this.Transaction = null;

    /*!
     @brief BIN class.
    
     An instance of the BIN class. NOTE: This property is only present if the BIN class is present in the Express response.
     */
    this.BIN = null;

    /*!
     @brief TransactionSetup class.
    
     An instance of the TransactionSetup class. NOTE: This property is only present if the TransactionSetup class is present in the Express response.
     */
    this.TransactionSetup = null;

    /*!
     @brief PaymentAccount class.
    
     An instance of the PaymentAccount class. NOTE: This property is only present if the PaymentAccount class is present in the Express response.
     */
    this.PaymentAccount = null;

    /*!
     @brief Address class.
    
     An instance of the Address class. NOTE: This property is only present if the Address class is present in the Express response.
     */
    this.Address = null;

    /*!
     @brief Express response code.
    
     The result of the transaction as determined by Express.
     
     @see EPS.Express.ResponseCode
     */
    this.ExpressResponseCode = null;

    /*!
     @brief Express response message.
    
     A brief text description of the result of the transaction as determined by Express.
     */
    this.ExpressResponseMessage = null;

    /*!
     @brief Express transaction date.
    
     The date when Express processed the transaction. The timezone for this value is determined by ExpressTransactionTimezone. The format of this property is YYYYMMDD.
     */
    this.ExpressTransactionDate = null;

    /*!
     @brief Express transaction time.
    
     The time when Express processed the transaction. The timezone for this value is determined by ExpressTransactionTimezone. The format of this property is HHMMSS where HH is 00-23.
     */
    this.ExpressTransactionTime = null;

    /*!
     @brief Express transaction time zone.
    
     The time zone in which Express processed the transaction. This value is expressed as an offset from UTC (i.e. UTC-05:00:00).
     */
    this.ExpressTransactionTimezone = null;

    /*!
     @brief Host response code.
     
     Response code for the transaction returned by the host that processed the transaction.
     */
    this.HostResponseCode = null;

    /*!
     @brief Host response message.
    
     Response message for the transaction returned by the host that processed the transaction.
     */
    this.HostResponseMessage = null;

    /*!
     @brief Host transaction date/time.
    
     Date and time of the host that processed the transaction.
     */
    this.HostTransactionDateTime = null;

    /*!
     @brief Query data.
    
     Query information in XML format.
     */
    this.QueryData = null;

    /*!
     @brief QueryDataEx  (CONVENIENCE).
    
     An array of parsed EPS.Express.PaymentAccountQueryRecordCountItems, EPS.Express.PaymentAccountTokenReportItems, or EPS.Express.PaymentAccountQueryItems. This property is for convenience and not part of the Express message.
     */
    this.QueryDataEx = null;

    /*!
     @brief Reporting data.
    
     Transaction report information in XML format.
     */
    this.ReportingData = null;

    /*!
     @brief ReportDataEx (CONVENIENCE).
    
     An array of parsed EPS.Express.ReportingDataItems. This property is for convenience and not part of the Express message.
     */
    this.ReportingDataEx = null;

    /*!
     @brief Services ID.
    
     Unique services identifier.
     */
    this.ServicesID = null;

    /*!
     @brief Reporting ID.
    
     Unique reporting identifier.
     */
    this.ReportingID = null;

    /*!
     @brief Returns the URL to use for Hosted Payments.
    
     This property gets the URL used for Hosted Payments. This value should only be queried after a successful TransactionSetup request/response. The property will be nil if Response, response.TransactionSetup, or Response.TransactionSetup.TransactionSetupID is not set.
     */
    this.HostedPaymentsUrl = null;
};
