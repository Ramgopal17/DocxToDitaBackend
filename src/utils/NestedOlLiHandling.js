// function cleanXMLStringP(xml) {
//     let olContent = /<\/ol>\s*(?:<p>)(.*?)(?:<\/p>)\s*<ol>/g;
//     let matches = xml.matchAll(olContent);
//     if (matches.length == 0) {
//         return xml;
//     }
//     for (let match of matches) {

//         let result = match[0].replace(/<\/?ol>/g, '');
//         xml = xml.replace(match[0], result);
//         xml = xml.replace(
//             new RegExp('</li>\\s*' + result + '\\s*<li(?:\\s+id="[^"]*")?(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g'),
//             result
//         );
//         xml = xml.replace(new RegExp('</ol>\\s*' + result + '\\s*<ol>', 'g'), result);
//     }
//     return xml;
// }

// function cleanXMLStringPWithOlLi(xml) {
//     let olContent = /<\/ol>\s*(?:<p>)(.*?)(?:<\/p>)\s*<ol>/g;

//     let matches = xml.matchAll(olContent);
//     if (matches.length == 0) {
//         return xml;
//     }
//     for (let match of matches) {
//         let result = match[0].replace(/<\/?ol>/g, '');
//         xml = xml.replace(match[0], result);
//         let checkingFurtherLi = new RegExp('</li>\\s*' + result + '\\s*<li(?:\\s+id="[^"]*")?(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g')
//         if (!checkingFurtherLi.test(xml)) {
//             return xml
//         }
//         xml = xml.replace(
//             new RegExp('</li>\\s*' + result + '\\s*<li(?:\\s+id="[^"]*")?(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g'),
//             result
//         );

//         xml = xml.replace(new RegExp('</ol>\\s*' + result + '\\s*<ol>', 'g'), result);
 
//         xml = xml.replace(
//             new RegExp('</li>\\s*' + result + '\\s*<li(?:\\s+id="[^"]*")?(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g'),
//             result
//         );

//         xml = xml.replace(new RegExp('</ol>\\s*' + result + '\\s*<ol>', 'g'), result)

//     }

//     xml = xml.replace(/<ol>\s*<\/ol>/g, '');

//     return xml;
// }

// function cleanXMLStringNote(xml) {
//     let olContent = /<\/ol>\s*(?:<note>)(.*?)(?:<\/note>)\s*<ol>/g;

//     let matches = xml.matchAll(olContent);

//     if (matches.length == 0) {
//         return xml;
//     }
//     for (let match of matches) {

//         let result = match[0].replace(/<\/?ol>/g, '');

//         xml = xml.replace(match[0], result);

//         let checkingFurtherLi = new RegExp('</li>\\s*' + result + '\\s*<li(?:\\s+id="[^"]*")?(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g')
//         if (!checkingFurtherLi.test(xml)) {
//             return xml
//         }


//         xml = xml.replace(
//             new RegExp('</li>\\s*' + result + '\\s*<li(?:\\s+id="[^"]*")?(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g'),
//             result
//         );
//         // let checkingFurtherol = new RegExp('</ol>\\s*' + result + '\\s*<ol>', 'g')
//         // if (!checkingFurtherol.test(xml)) {
//         //     return xml
//         // }
//         xml = xml.replace(new RegExp('</ol>\\s*' + result + '\\s*<ol>', 'g'), result);
//         // let checkingFurtherSecondLi = new RegExp('</li>\\s*' + result + '\\s*<li(?![^>]*\\sid\\b)(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g')
//         // if (!checkingFurtherSecondLi.test(xml)) {
//         //     return xml
//         // }
//         xml = xml.replace(
//             new RegExp('</li>\\s*' + result + '\\s*<li(?![^>]*\\sid\\b)(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g'),
//             result
//         );
//         // let checkingFurtherSecondOl = new RegExp('</ol>\\s*' + result + '\\s*<ol>', 'g')
//         // if (!checkingFurtherSecondOl.test(xml)) {
//         //     return xml
//         // }
//         xml = xml.replace(new RegExp('</ol>\\s*' + result + '\\s*<ol>', 'g'), result)

//     }

//     xml = xml.replace(/<ol>\s*<\/ol>/g, '');

//     return xml;
// }


// module.exports = { cleanXMLStringP, cleanXMLStringPWithOlLi, cleanXMLStringNote }








function cleanXMLStringP(xml) {
    // let olContent = /<\/ol>\s*(?:<p>)(.*?)(?:<\/p>)\s*<ol>/g;
    let olContent = /<\/ol>\s*(?:<p>|<table>|image)(.*?)(?:<\/p>|<\/table>|<\/image>)\s*<ol>/g;
    let matches = xml.matchAll(olContent);
    for (let match of matches) {
    let result = match[0].replace(/<\/?ol>/g, '');
    xml = xml.replace(match[0], result);
    xml = xml.replace(
        new RegExp('</li>\\s*' + result + '\\s*<li(?:\\s+id="[^"]*")?(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g'),
        result
    );
    

xml = xml.replace(new RegExp('</ol>\\s*' + result + '\\s*<ol>', 'g'), result);

xml = xml.replace(
    new RegExp('</li>\\s*' + result + '\\s*<li(?:\\s+id="[^"]*")?(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g'),
    result
);


xml = xml.replace(new RegExp('</ol>\\s*' + result + '\\s*<ol>', 'g'), result)

    }
    // Remove empty <ol> tags
    xml = xml.replace(/<ol>\s*<\/ol>/g, '');

    return xml;
}

function cleanXMLStringNote(xml) {
    // let olContent = /<\/ol>\s*(?:<p>|<note>|<table>|image)(.*?)(?:<\/p>|<\/note>|<\/table>|<\/image>)\s*<ol>/g;

    let olContent = /<\/ol>\s*(?:<note>)(.*?)(?:<\/note>)\s*<ol>/g;

    let matches = xml.matchAll(olContent);
    for (let match of matches) {

    let result = match[0].replace(/<\/?ol>/g, '');

    xml = xml.replace(match[0], result);
    xml = xml.replace(
        new RegExp('</li>\\s*' + result + '\\s*<li(?:\\s+id="[^"]*")?(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g'),
        result
    );
    

// xml = xml.replaceAll(new RegExp('</li>\\s*' + result + '\\s*<li>', 'g'), result);
xml = xml.replace(new RegExp('</ol>\\s*' + result + '\\s*<ol>', 'g'), result);

// xml = xml.replace(
//     new RegExp('</li>\\s*' + result + '\\s*<li(?![^>]*\\sid\\b)(?:\\s+[\\w-]+(?:="[^"]*")?)*>(?=\\s*<)', 'g'),
//     result
// );

// xml = xml.replace(new RegExp('</ol>\\s*' + result + '\\s*<ol>', 'g'), result)

    }
    // Remove empty <ol> tags
    xml = xml.replace(/<ol>\s*<\/ol>/g, '');

    return xml;
}


module.exports={cleanXMLStringP,cleanXMLStringNote}