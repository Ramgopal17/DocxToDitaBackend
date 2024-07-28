

const { DOMParser, XMLSerializer } = require('xmldom');
function correctXML(xmlString) {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    
    // Parse XML string
    let xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error('Error parsing XML');
    }
  
    // Remove invalid characters (if any)
    let correctedXML = serializer.serializeToString(xmlDoc);
    correctedXML = correctedXML.replace(/[^\x09\x0A\x0D\x20-\x7F]/g, '');
  
    // Re-parse the corrected XML string to check for structural issues
    xmlDoc = parser.parseFromString(correctedXML, 'application/xml');
  
    // Serialize the corrected XML document to a string
    return serializer.serializeToString(xmlDoc);
  }
  
  

module.exports=correctXML