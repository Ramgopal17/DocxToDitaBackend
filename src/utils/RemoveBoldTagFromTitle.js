
const { DOMParser, XMLSerializer } = require('xmldom');
function removeBoldTag(xmlString) {

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const topicNode = xmlDoc.getElementsByTagName("topic")[0];
    const titleNodes = topicNode.getElementsByTagName("title");

    for (let i = 0; i < titleNodes.length; i++) {
        const titleNode = titleNodes[i];
        const boldNodes = titleNode.getElementsByTagName("b");

        while (boldNodes.length > 0) {
            const boldNode = boldNodes[0];
            const textContent = boldNode.textContent;
            const textNode = xmlDoc.createTextNode(textContent);
            titleNode.replaceChild(textNode, boldNode);
        }
    }

    const modifiedXmlString = new XMLSerializer().serializeToString(xmlDoc);

    return modifiedXmlString;
}

function removeBoldTagFromImage(xmlString) {
    // Parse the XML string into a DOM object
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Get all <b> elements
    const boldTags = xmlDoc.getElementsByTagName('b');

    // Iterate over the <b> elements and replace them with their child nodes
    while (boldTags.length > 0) {
        const boldTag = boldTags[0];
        const parent = boldTag.parentNode;

        // Move all child nodes of the <b> tag to its parent
        while (boldTag.firstChild) {
            parent.insertBefore(boldTag.firstChild, boldTag);
        }

        // Remove the empty <b> tag
        parent.removeChild(boldTag);
    }

    // Serialize the DOM object back to a string
    const serializer = new XMLSerializer();
    const newXmlString = serializer.serializeToString(xmlDoc);

    return newXmlString;
}



module.exports={removeBoldTag,removeBoldTagFromImage}



// const { DOMParser, XMLSerializer } = require('xmldom');

// function removeBoldTag(xmlString) {
//     const parser = new DOMParser();
//     const xmlDoc = parser.parseFromString(xmlString, "text/xml");

//     const topicNode = xmlDoc.getElementsByTagName("topic")[0];
//     const titleNodes = topicNode.getElementsByTagName("title");

//     for (let i = 0; i < titleNodes.length; i++) {
//         const titleNode = titleNodes[i];
//         const boldNodes = titleNode.getElementsByTagName("b");

//         while (boldNodes.length > 0) {
//             const boldNode = boldNodes[0];

//             // Check if the <b> node contains an <image> node
//             const imageNodes = boldNode.getElementsByTagName("image");
//             if (imageNodes.length > 0) {
//                 // Move each <image> node out of the <b> node
//                 for (let j = 0; j < imageNodes.length; j++) {
//                     const imageNode = imageNodes[j];
//                     boldNode.parentNode.insertBefore(imageNode, boldNode);
//                 }
//                 boldNode.parentNode.removeChild(boldNode);
//             } else {
//                 // Replace the <b> node with its text content
//                 const textContent = boldNode.textContent;
//                 const textNode = xmlDoc.createTextNode(textContent);
//                 titleNode.replaceChild(textNode, boldNode);
//             }
//         }
//     }

//     const modifiedXmlString = new XMLSerializer().serializeToString(xmlDoc);

//     return modifiedXmlString;
// }

// module.exports = removeBoldTag;
