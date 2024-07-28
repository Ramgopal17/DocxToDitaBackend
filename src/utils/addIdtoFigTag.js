

const { DOMParser, XMLSerializer } = require('xmldom');
const generateRandomId=require("../utils/generateRandomId.js")

// function addRandomIdToFig(xmlString) {
//     const parser = new DOMParser();
//     const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
//     const figElements = xmlDoc.getElementsByTagName('fig');
//     for (let i = 0; i < figElements.length; i++) {
//         const id = generateRandomId();
//         figElements[i].setAttribute('id', id);
//     }
//     const modifiedXmlString = new XMLSerializer().serializeToString(xmlDoc);
//     return modifiedXmlString;
// }

function addRandomIdToFig(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    const imageElements = xmlDoc.getElementsByTagName('image');
    const imageElementsArray = Array.from(imageElements);

    imageElementsArray.forEach(imageElement => {
        // Create a new fig element
        const figElement = xmlDoc.createElement('fig');

        // Append the image element to the fig element
        figElement.appendChild(imageElement.cloneNode(true));

        // Add a random id attribute to the fig element
        const id = generateRandomId();
        figElement.setAttribute('id', id);

        // Replace the image element with the fig element in the XML document
        imageElement.parentNode.replaceChild(figElement, imageElement);
    });

    const modifiedXmlString = new XMLSerializer().serializeToString(xmlDoc);
    return modifiedXmlString;
}

module.exports=addRandomIdToFig