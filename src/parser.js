/* globals require, __dirname */

var xpath = require( 'xpath' );
var xmldom = require( 'xmldom' ).DOMParser;

var fs = require( 'fs' );
var path = require( 'path' );
var testFilePath = path.join( __dirname, '..', 'test', 'OTA_HotelAvailNotifRQ.xml' );

console.log( testFilePath );
fs.readFile( testFilePath, 'utf-8', processData );

function processData( err, data ){
    if( err ){
        console.error( err );
    }
    
    console.log( ":processData" );
    console.log( parseMessage( parseXml( data ) ) );
}

function parseXml( xmlString ){
    if( typeof xmlString === "string" ){
        var doc = new xmldom().parseFromString( xmlString );
        return doc;
    }
    else{
        return null;
    }
}

function parseMessage( doc ){
    var result = {};
    if( doc ){
        var parser = new OTA_HotelAvailNotifRQParser( doc );
        console.log( ":parseMessage" );
        console.log( parser.getHotelAvailNotifRQ() );
    }
    return result;
}

function OTA_HotelAvailNotifRQParser( doc ){
    this.doc = doc;
    this.init();
}

OTA_HotelAvailNotifRQParser.prototype = {
    init : function(){
        this.select = xpath.select;
        var attributes = this.select( "/*/@*", this.doc );
        if( attributes && attributes.length > 0 ){
            for( var i = 0; i < attributes.length; i++ ){
                if( attributes[i].name === "xmlns" ){
                    this.select = xpath.useNamespaces({ "n" : attributes[i].value });
                }
            }
        }
    },
    getHotelAvailNotifRQ : function(){
        var result = {};
        result.messageAttributes = this.getAttributes();
        result.hotelCode = this.getHotelCode();
        result.availStatusMessages = this.getAvailStatusMessages();
        return result;
    },
    getAttributes : function(){
        console.log("OTA_HotelAvailNotifRQParser:getAttributes");
        var result = {};
        var attributesNodes = this.select( "/*/@*", this.doc );
        if( attributesNodes && attributesNodes.length > 0 ){
            for( var i = 0; i< attributesNodes.length; i++ ){
                var attribute = attributesNodes[i];
                result[attribute.name] = attribute.value;
            }
        }
        return result;
    },
    getHotelCode : function() {
        console.log( "OTA_HotelAvailNotifRQParser:HotelCode" );
        var result = null;
        var hotelCodeNode = this.select( "//n:AvailStatusMessages/@HotelCode", this.doc );
        if( hotelCodeNode && hotelCodeNode.length > 0 ){
            result = hotelCodeNode[0].value;
        }
        return result;
    },
    getAvailStatusMessages : function() {
        console.log( "OTA_HotelAvailNotifRQParser:getAvailStatusMessages" );
        var result = [];
        var nodes = this.select( "//n:AvailStatusMessages/n:AvailStatusMessage", this.doc );
        if( nodes && nodes.length > 0 ){
            for( var i = 0; i < nodes.length; i++ ){
                var availStatusMessage = this.getAvailStatusMessage( nodes[i] );
                if( availStatusMessage ){
                    result.push( availStatusMessage );
                }
            }
        }
        return result;
    },
    getAvailStatusMessage : function( node ){
        console.log( "OTA_HotelAvailNotifRQParser:getAvailStatusMessages" );
        var result = null;
        if( node ){
            result = {};
            var bookingLimitAttr = this.select( "//@BookingLimit", node )[0];
            if( bookingLimitAttr ){
                result.bookingLimit = bookingLimitAttr.value;
            }
            var bookingLimitMessageTypeAttr = this.select( "//@BookingLimitMessageType", node )[0];
            if( bookingLimitMessageTypeAttr ){
                result.bookingLimitMessage = bookingLimitMessageTypeAttr.value;
            }
            
            var control = this.getStatusApplicationControl( node );
            if( control ){
                result.control = control;
            }
            
            var restrictionStatus = this.getRestrictionStatus( node );
            if( restrictionStatus ){
                result.restrictionStatus = restrictionStatus;
            }
        }
        return result;
    },
    getStatusApplicationControl : function( node ){
        console.log( "OTA_HotelAvailNotifRQParser:getStatusApplicationControl" );
        var result = null;
        var statusControlNode = this.select( "//n:StatusApplicationControl/@*", node );
        if( statusControlNode && statusControlNode.length > 0 ){
            result = {};
            for( var i = 0; i < statusControlNode.length; i++ ){
                var attribute = statusControlNode[i];
                result[attribute.name] = attribute.value;
            }
        }
        return result;
    },
    getRestrictionStatus : function( node ){
        console.log( "OTA_HotelAvailNotifRQParser:getRestrictionStatus" );
        var result = null;
        var restrictionStatusNode = this.select( "//n:RestrictionStatus/@*", node );
        if( restrictionStatusNode && restrictionStatusNode.length > 0 ){
            result = {};
            for( var i = 0; i < restrictionStatusNode.length; i++ ){
                var attribute = restrictionStatusNode[i];
                result[attribute.name] = attribute.value;
                console.log( attribute.name + " - " + attribute.value );
            }
        }
        return result;
    }
};