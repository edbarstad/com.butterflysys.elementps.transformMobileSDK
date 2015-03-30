/*!
 @file EPS.Utils.js
 
 The EPS.Utils class is a set of utility/helper functions that may be helpful for transaction processing.
 */

// EPS = EPS || {};

/*!
 @class EPS.Utils
 
 @brief Utility/helper functions.
 
 A set of utility/helper functions that may be helpful for transaction processing.
 */
EPS.Utils = new function()
{
    this.scalePage = function()
    {
        try
        {
            var vp;
            
            if ((vp = document.getElementById('viewport')) != undefined)
            {
                vp.setAttribute('content', 'initial-scale=' + (screen.availWidth / 768).toFixed(1) + ', minimum-scale=0.4, maximum-scale=2.5 user-scalable=yes');
                
                //alert('w: ' + screen.availWidth + ' - ' + screen.width + ' a: ' + vp.getAttribute('content'));
            }
        }
        catch (ex)
        {
            console.log('EPS.Utils.js->scalePage: ' + ex);
        }
    };
    
    /*!
     @brief Parses a query string.
     
     This method parses a query string returned as part of a URL.
     
     @param location Typically this is the window.location object.
     
     @return Returns an Array object contain the name/value pairs from the query string.
     */
    this.parseSearch = function(location)
    {
        var args;

        args = undefined;

        try
        {
            if (location.search != undefined)
            {
                args = location.search.substring(1).split('&');
            }
            else
            {
                var i;

                if ((i = location.pathname.indexOf('?')) < 0)
                {
                    args = location.href.substring((location.protocol + '//' + location.host + location.pathname + '?').length).split('&');
                }

                args = location.pathname.substring(i + 1).split('&');
            }
        }
        catch (ex)
        {
            console.log('EPS.Utils.js->parseSearch: ' + ex);
        }

        var ret;

        ret = new Array();

        if (args != undefined)
        {
            var i;

            for (i = 0; i < args.length; i++)
            {
                var pair;

                if ((pair = args[i].split('=')).length == 2)
                {
                    ret[pair[0]] = pair[1];
                }
            }
        }

        return ret;
    };

    /*!
     @brief Formats an amount.
     
     This method formats a whole number in to an amount.
     
     @param amount The whole number amount. For example, 123 is used for 1.23.
     
     @param sign A boolean indicating whether the output should be preceded with a '$'.
     
     @return Returns a string with the formated amount.
     */
    this.amountToString = function(amount, sign)
    {
        var ret;

        ret = '';

        try
        {
            if (sign)
            {
                ret = '$' + (amount / 100).toFixed(2);
            }
            else
            {
                ret = (amount / 100).toFixed(2);
            }
        }
        catch (ex)
        {
            console.log('EPS.Utils.js->amountToString: ' + ex);
        }

        return ret;
    };
    
    /*!
     @brief Fires a document event.
     
     This method fires a document event using the Cordova/PhoneGap functionality.
     
     @param type The type of event.
     
     @param data Data to be included with the event.
     */
    this.fireDocumentEvent = function(type, data)
    {
        try
        {
            window.setTimeout(function()
                                {
                                    cordova.fireDocumentEvent(type, data);
                                },
                              0);
        }   
        catch (ex)
        {
            console.log('EPS.Utils.js->fireDocumentEvent: ' + ex);
        }     
    };
    
    /*!
     @brief Executes a Cordova/PhoneGap plug-in function.
     
     This method executes a Cordova/PhoneGap plug-in function.
     
     @param successCallback Callback to notify the caller of successful completion. This parameter may be null. The prototype is function(data). This method does not return a data parameter.
     
     @param errorCallback Callback to notify the caller of unsuccessful completion. This parameter may be null. The prototype is function(data). This method returns a string indicating the error data parameter.
     
     @param service The name of the Cordova/PhoneGap plug-in.
     
     @param action The name of the Cordova/PhoneGap plug-in function.
     
     @param actionArguments Arguments passed to the Cordova/PhoneGap plug-in function.
     */
    this.exec = function(successCallback, errorCallback, service, action, actionArguments)
    {
        try
        {
            window.setTimeout(function()
                                {
                                    console.log('Calling cordova.exec...' + service + ', ' + action + JSON.stringify(actionArguments, null, '  '));
                                    cordova.exec(successCallback, errorCallback, service, action, actionArguments);
                                    console.log('Calling cordova.exec done.');
                                },
                              0);
        }
        catch (ex)
        {
            console.log('EPS.Utils.js->exec: ' + ex);
        }
    };
};