
const path = require("path");
const mammoth = require("mammoth")
const fs = require("fs")
const { HTMLToJSON, JSONToHTML } = require("html-to-json-parser");
const cheerio = require("cheerio");
const processXML=require("./utils/abc.js")
const { cleanXMLStringP, cleanXMLStringNote } = require("./utils/NestedOlLiHandling.js")
const movePandNoteTagInsideLi = require("./utils/movePTagInsideLi.js")
const addRandomIdToTopics = require("./utils/addRandomGeneratedId.js")
const moveTitleAboveBody = require("./utils/moveTitleAboveBody.js");
const moveTgroupClosingTagBeforeTable = require("./utils/moveTgroupClosingTagBeforeTable.js");
const characterToEntity = require("./utils/characterToEntity.js");
const removeUnwantedElements = require("./utils/removeUnwantedElements.js");
const extractHTML = require("./utils/extractHTML.js");
const addTopicTag = require("./utils/addTopicTag.js");
const NestinTopicTag = require("./utils/nestingTopicTag.js")
const attachIdToTitle = require("./utils/attachedIdToTitle.js")
const { converBase64ToImage } = require('convert-base64-to-image');
const fileSeparator = require("./utils/fileSeperator.js");
const tagsValidator = require("./utils/tagValidator.js");
const dtdConcept = require("./utils/dtdConcept.js");
const dtdReference = require("./utils/dtdReference.js");
const dtdTask = require("./utils/dtdTask.js");
const generateRandomId = require("./utils/generateRandomId.js");
const addIdTOFigTag = require("./utils/addIdtoFigTag.js")
const addRandomIdToTags = require("./utils/addRandomIdToTags.js")
const { addData, getData, resetData, setIsBodyEmpty, getIsBodyEmpty, getJsonData, getXrefJsonData, setInputFileName } = require("./utils/StateManagement.js");
const archiver = require('archiver');
const { removeBoldTag, removeBoldTagFromImage } = require("./utils/RemoveBoldTagFromTitle.js");
const replaceOlWIthFn = require("./utils/replaceOlWithFn.js")
const removeXref = require("./utils/removeRowEntry.js")
const extractXrefIds = require("./utils/extractIds.js")
const XrefHrefIds = require("./utils/xrefHrefId.js")
const addXmlLangAttributes = require("./utils/addXmlLang.js")
const outputDirName = "./output/";
const removeOutputClassHeading=require("./utils/removeOutputClass.js")

require("dotenv").config({ path: "./.env" });

async function convertDocxToDita(filePath) {
  const outputId = Math.random().toString(36).substring(7);
  const OutputPath = path.join(outputDirName, outputId);
  function transformElement(element) {
    if (!element) {
      return;
    }
    if (element.children) {
      element.children.forEach(transformElement);
    }

    if (element?.type === "paragraph" && element?.styleId) {

      switch (element.styleId) {

        case "NoteStyle":
          element.attributes = { type: "note" };

          break;
        case "CautionStyle":
          element.attributes = { type: "caution" };
          break;
        case "DangerStyle":
          element.attributes = { type: "danger" };
          break;
        default:
          break;
      }
    }

    return element;
  }
  try {
    const mammothOptions = {
      styleMap: [
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='AltTitle'] => h2:fresh",
        "p[style-name='Quote'] => blockquote:fresh",
        "p[style-name='Hyperlink'] => a:fresh",
        "p.Figure => figure:fresh",
        "p.OrderedList => li[id^=_Toc] > ol > li:fresh",
        "p.OrderedListitem2 =>  ol > li > ol > li:fresh",
        "p.Orderedlistitem3 =>  ol > li > ol > li > ol > li:fresh",
        "p.OrderListitem4 =>  ol > li > ol > li > ol > li > ol > li:fresh",
        "p.OrderListitem5 =>  ol > li > ol > li > ol > li > ol > li > ol > li:fresh",
        "p.OrderListitem6 =>  ol > li > ol > li > ol > li > ol > li > ol > li > ol > li:fresh",
        'p.NoteStyle => note:fresh',
        'p.CautionStyle => note:fresh',
        'p.DangerStyle => note:fresh',

      ],
    };
    const { value: rawHtml } = await mammoth.convertToHtml(
      { path: filePath },
      {
        ...mammothOptions,
        transformDocument: mammoth.transforms.paragraph(transformElement)
      }
    );
    const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        ${rawHtml}
    </body>
    </html>
`;
    const $ = cheerio.load(fullHtml);
    $("table").each((index, element) => {
      let maxCols = 0;
      $(element).find("tr").each((rowIndex, rowElement) => {
        const colsInRow = $(rowElement).find("th, td").length;
        if (colsInRow > maxCols) {
          maxCols = colsInRow;
        }
      });
      $(element).prepend(`<colgroup cols="${maxCols}" />`);
    });

    $('img').each((index, element) => {
      const src = $(element).attr('src');
      const base64Prefix = 'data:image/';
      if (src.startsWith(base64Prefix)) {
        const mimeType = src.substring(base64Prefix.length, src.indexOf(';'));
        const isPng = mimeType === 'png';
        const isJpeg = mimeType === 'jpeg' || mimeType === 'jpg';

        if (isPng || isJpeg) {

          const extension = isPng ? 'png' : 'jpg';
          const pathToSaveImage = `${OutputPath}/media/image${index}.${extension}`;
          const pathToSaveImagewithMedia = `media/image${index}.${extension}`;
          const path = converBase64ToImage(src, pathToSaveImage);
          $(element).attr('src', pathToSaveImagewithMedia);
        } else {
          console.log(`Image at index ${index} is not a PNG or JPEG: ${mimeType}`);
        }
      }
    });
    const modifiedHtml = $.html();
    const contentWithHmtlAsRootElement = extractHTML(modifiedHtml);

    let footNoteList = [];
    let result = await HTMLToJSON(contentWithHmtlAsRootElement, false);


    function removeNewlines(array) {
      return array.filter((item) => typeof item !== "string" || item !== "\n");
    }

    result.content.map((e) => {
      if (e.type === "body") {
        e.content.map((ele) => {
          if (ele.type === "section") {
            const hehe = removeNewlines(ele.content);
            footNoteList = removeNewlines(hehe[0].content);
          }
        });
      }
    });

    result = removeUnwantedElements(
      result,
      {},
      ""
    );

    result = characterToEntity(result);

    const footNoteMap = new Map();
    footNoteList.forEach((obj) => {
      footNoteMap.set(obj.attributes.id, obj.content[0].content[0]);
    });


    result.content.forEach((e) => {
      if (e.type === "body") {
        e.content.forEach((ele) => {
          if (ele.type === "p") {
            ele.content.forEach((g) => {
              if (g.content !== undefined) {
                let footId = g.content[0].attributes?.href.split(";")[1];
                const line = footNoteMap.get(footId);
                if (line) {
                  g.type = "fn";
                  g.content = [line];
                  delete g.attributes;
                }
              }
            });
          }
          if (ele.type === "section" && ele.attributes?.class === "footnotes") {
            ele.content = [];
            ele.type = "";
            ele.attributes = {};
          }
        });
      }
    });


    JSONToHTML(result).then(async (res) => {
      try {
        const cleanedUpContent = res.replace(/<\/*>/g, "");

        const cleanedUpJson = await HTMLToJSON(cleanedUpContent, false);

        if (Array.isArray(cleanedUpJson.content)) {
          cleanedUpJson.content.forEach((ele) => {
            if (ele.type === "body" && Array.isArray(ele.content)) {
              ele.content.forEach((bodyEle, indx) => {
                if (
                  typeof bodyEle === "string" &&
                  bodyEle.trim() !== "\n" &&
                  bodyEle.trim() !== "\n\n" &&
                  bodyEle.trim() !== ""
                ) {
                  ele.content[indx] = { type: "p", content: [bodyEle] };
                }
              });
            }
          });
        }

        const modifiedDitaCode = codeRestructure(
          await JSONToHTML(characterToEntity(cleanedUpJson))
        );

        function capitalizeFirstWord(str) {
          return str.charAt(0).toUpperCase() + str.slice(1);
        }

        const removedIdFromXrefAttachedToTitle = attachIdToTitle(modifiedDitaCode)
        XrefHrefIds(removedIdFromXrefAttachedToTitle)
        let boldTagdeletion = removeBoldTag(removedIdFromXrefAttachedToTitle)
       let boldTagRemovalFromIMage= removeBoldTagFromImage(boldTagdeletion)

        // // let cleanXMLStringPWithOlLiMultilevel = cleanXMLStringPWithOlLi(boldTagRemovalFromIMage)
        // let pTagListing = cleanXMLStringP(boldTagRemovalFromIMage)
        // let NoteTagListing = cleanXMLStringNote(pTagListing)
        // let finallyMovedInsideLi = movePandNoteTagInsideLi(NoteTagListing)
        // let addedRandomIds = addRandomIdToTags(finallyMovedInsideLi)
      //  let f=processXML(finallyMovedInsideLi) 
    
        let topicWise = fileSeparator(boldTagRemovalFromIMage);

        let newPath = filePath
          .replace(/\\/g, "/")
          .split("/")
          .slice(1)
          .join("/");
        var topicContent = topicWise.topics[0].content;
        var bodyElement = extractBodyElement(topicContent);
        var isBodyEmpty = bodyElement.trim() === '';
        setIsBodyEmpty(isBodyEmpty)
        function extractBodyElement(htmlContent) {
          var start = htmlContent.indexOf('<body>');
          var end = htmlContent.lastIndexOf('</body>');
          if (start === -1 || end === -1) {
            return '';
          }
          var bodyContent = htmlContent.substring(start + 6, end);
          return bodyContent;
        }
        const fileInfo = {}
        fileInfo.nestObj = []
        let fileNames = {};
       
        topicWise.topics.map((tc, index) => {
          let dtdType = "topic";
          tc.content = tagsValidator(tc.content);
          let result = dtdConcept(tc.content);

          if (result.boolValue) {
            dtdType = "concept";
            tc.content = result.content;
          } else if (result.boolValue === false) {
            let result2 = dtdReference(tc.content);
            if (result2.boolValue) {
              dtdType = "reference";
              tc.content = result2.content;
            } else if (result2.boolValue === false) {
              let temp = dtdTask(tc.content);
              if (temp.boolValue) {
                dtdType = "task";
                tc.content = temp.content;
              }
            }
          }

          let baseName = tc.title
            .replaceAll(" ", "_")
            .replaceAll("?", "")
            .replaceAll(".", "")
            .replace(/[^\w\s]/gi, '');

          let uniqueName = baseName + ".docx";

          if (fileNames[baseName]) {
            let count = fileNames[baseName];
            fileNames[baseName] = count + 1; 
            uniqueName = baseName + `_${count + 1}.docx`;
          } else {
            fileNames[baseName] = 1; 
          }

          if (fileNames[baseName] > 1) {
            uniqueName = baseName + `_${fileNames[baseName] - 1}.docx`;
          } else {
            uniqueName = baseName + ".docx";
          }

          let outputFilePath = "";
          let actualPath = newPath.split("/").slice(0, -1).join("/") + "/" + uniqueName;
          let fileNameLowerCased = uniqueName.toLowerCase();

          if (actualPath.endsWith(".doc")) {
            outputFilePath = `${OutputPath}/${fileNameLowerCased.replace(
              /\.doc$/,
              ".dita"
            )}`;
          } else if (actualPath.endsWith(".docx")) {
            outputFilePath = `${OutputPath}/${fileNameLowerCased.replace(
              /\.docx$/,
              ".dita"
            )}`;
          }

          const outputDir = path.dirname(outputFilePath);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          fileInfo.nestObj.push({
            level: tc.level,
            path: outputFilePath,
            child: []
          });

          if (tc.level !== undefined || !isBodyEmpty) {
            fs.writeFileSync(
              outputFilePath,
              `<?xml version="1.0" encoding="UTF-8"?>
                <!DOCTYPE ${dtdType} PUBLIC "-//OASIS//DTD DITA ${capitalizeFirstWord(dtdType)}//EN" "${dtdType}.dtd">
                ${tc.content}`,
              {
                encoding: 'utf-8',
              }
            );
          }

          addData(fileInfo);
        });

        let fetchData = getData()
      DitaMapMaker(fetchData, topicWise.topics[0].title, OutputPath)
     
        fs.readdir(OutputPath, function (err, files) {
          if (err) {
            return console.error('Unable to scan directory:', err);
          }

          const ditaFiles = files.filter(file => path.extname(file) === '.dita');

          ditaFiles.forEach(file => {
            const OutputPath = path.join(outputDirName, outputId, file);

            extractXrefIds(OutputPath);


            fs.readFile(OutputPath, 'utf8', (err, content) => {
              if (err) {
                return console.error('Error reading file:', err);
              }

              let removingOutputClass=removeOutputClassHeading(content)
               let addingXmlLangAttributes = addXmlLangAttributes(removingOutputClass)
         
              let modifiedContent = addingXmlLangAttributes;

              let XrefrenceHrefId = getXrefJsonData();
              let JsonDataIDTopicId = getJsonData();

              let aDict = {};
              JsonDataIDTopicId.forEach(item => {
                aDict[item.id] = item;
              });

              let matchedDetails = XrefrenceHrefId
                .filter(id => aDict.hasOwnProperty(id))
                .map(id => ({
                  id: id,
                  TopicId: aDict[id].TopicId,
                  FileName: aDict[id].FileName
                }));
              matchedDetails.forEach(item => {
                let lowercasesFileName = item.FileName.toLowerCase();
                const regex = new RegExp(`<xref href="#${item.id}"`, 'g');
                const replacement = `<xref href="./${lowercasesFileName}#${item.TopicId}/${item.id}"`;
                modifiedContent = modifiedContent.replaceAll(regex, replacement);
              });

              fs.writeFile(OutputPath, modifiedContent, 'utf8', (err) => {
                if (err) {
                  return console.error('Error writing file:', err);
                }
              });
            });
          });
        });
      } catch (error) {
        console.log(error);
      }
    });

     const downloadLink = `${process.env.BASE_URL}/api/download/${outputId}`;
    // const downloadLink = `http://localhost:8000/api/download/${outputId}`;
    let fileName = path.parse(path.basename(filePath)).name + ".zip";
    setInputFileName(fileName)
    function codeRestructure(xmlString) {
      let newXmlString = moveTitleAboveBody(xmlString);
      let movingTgroupTop = moveTgroupClosingTagBeforeTable(newXmlString);
      let removexrefFromEntry = removeXref(movingTgroupTop);
      let structureTopic = addTopicTag(removexrefFromEntry);
      let addingRandomIdToTopic = addRandomIdToTopics(structureTopic);
      let moveTitle = NestinTopicTag(addingRandomIdToTopic);
      let addIDtoFig = addIdTOFigTag(moveTitle);
      let footnoterelatedOlLI = replaceOlWIthFn(addIDtoFig)
      return footnoterelatedOlLI
    }
    console.log("Docx to Dita converted succesfully")

  return { downloadLink, outputId}
 
  } catch (error) {
    console.error("Error converting DOCX to DITA:", error);
  }
}
module.exports = convertDocxToDita
function DitaMapMaker(fetchData, title, OutputPath) {
  let nestedFiles = {};

  try {

    fetchData[0].nestObj.forEach((ff) => {

      const level = parseInt(ff.level);

      let parent = nestedFiles;

      for (let i = 1; i < level; i++) {
        if (!parent.child || parent.child.length === 0) {
          console.error(
            "Error occurred: Parent has no children.",
            parent
          );
          throw new Error("Parent has no children.");
        }
        parent = parent.child[parent.child.length - 1];
      }
      if (!parent.child) parent.child = [];
      parent.child.push(ff);
    });

  } catch (error) {
    console.log(error);
  }

  function createXMLStructure(data) {
    let InfoAboutIsBodyEmpty = getIsBodyEmpty()
    function getLastPathSegment(path) {
      const parts = path.split(/[\\/]/);
      return parts[parts.length - 1];
    }
    let xmlStructure = "";

    data.child?.forEach((item, index) => {

      if (item.level !== undefined) {

        let topicPathInDita = getLastPathSegment(item.path);

        xmlStructure += `<topicref href="${topicPathInDita}" `;
        if (
          item.child &&
          Array.isArray(item.child) &&
          item.child.length > 0
        ) {
          xmlStructure +=
            ">\n" +
            createXMLStructure({ child: item.child }) +
            "</topicref>\n";
        } else {
          xmlStructure += "/>\n";
        }
      } else if (!InfoAboutIsBodyEmpty) {
        let topicPathInDita = getLastPathSegment(item.path);
        xmlStructure += `<topicref href="${topicPathInDita}" `;

        if (
          item.child &&
          Array.isArray(item.child) &&
          item.child.length > 0
        ) {
          xmlStructure +=
            ">\n" +
            createXMLStructure({ child: item.child }) +
            "</topicref>\n";
        } else {
          xmlStructure += "/>\n";
        }
      }
    }

    );

    return xmlStructure;
  }

  let mapId = generateRandomId();
  const xmlString = `<?xml version="1.0"  encoding="UTF-8" standalone="no"?>
<!DOCTYPE map PUBLIC "-//OASIS//DTD DITA Map//EN" "map.dtd">
 <map id="${mapId}" xml:lang="en-us">\n    <title>${title}</title>\n ${createXMLStructure(nestedFiles)}</map>`;
  let loweCaseTitleName = title.toLowerCase()
  fs.writeFileSync(`${OutputPath}/${loweCaseTitleName.replace(/ /g, "_")}.ditamap`, xmlString);
  console.log("XML structure created successfully!");
  resetData()
}









