var express = require("express");
var cors = require("cors");

var app = express();
var fs = require("fs");
const download = require("download");

var bodyParser = require("body-parser");
var multer = require("multer");
var XMLParser = require("react-xml-parser");

var extract = require("extract-zip");
var Web3 = require("web3");
const util = require("util");
const { promisify } = require("util");
const oracleJSON = require("iexec-oracle-contract/build/contracts/IexecOracle.json");
const exec = util.promisify(require("child_process").exec);
const spawn = util.promisify(require("child_process").spawn);

const path = require("path");

//https://ropsten.infura.io/ZljFLJUVL3VVLEqwiVOz

async function toFileShare(file) {
  var command =
    "curl --upload-file " + file.path + " https://transfer.sh/" + file.filename;
  console.log("upload command transfer.sh: ", command);
  const { stdout, stderr } = await exec(command, { maxBuffer: 1024 * 500 });
  console.log("uploadURL: ", stdout);
  return stdout;
  //return "https://transfer.sh/y7PBx/142d9d4662a95591ad13f36c203bf8ce";
}

app.use(cors());
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

var uploads = multer({ dest: "/tmp/" });

app.post("/process_result", async function(req, res) {
  const createIExecClient = require("iexec-server-js-client");

  console.log("inside /process_result");
  const downloadUri = req.body.uri;
  const server = req.body.server;
  const jwtoken = req.body.jwtoken;

  //console.log(downloadUri);
  //console.log(server);
  //console.log(jwtoken);

  const scheduler = createIExecClient({ server });
  const FETCH_INTERVAL = 10000;
  const sleep = ms => new Promise(res => setTimeout(res, ms));

  await sleep(FETCH_INTERVAL);
  await scheduler.getCookieByJWT(jwtoken);

  const resultUID = scheduler.uri2uid(downloadUri);
  //console.log("resultUID", resultUID);
  const resultObj = await scheduler.getByUID(resultUID);
  //console.log("resultObj", resultObj);

  const extension = scheduler.getFieldValue(resultObj, "type").toLowerCase();
  //console.log("Extension of result file: ", extension);

  const fileName = "testV2Result";
  const workingDir = await process.cwd();
  //console.log(workingDir);
  const resultPath = await path.join(
    process.cwd(),
    fileName.concat(".", extension)
  );
  console.log("Result download path:", resultPath);

  const resultStream = fs.createWriteStream(resultPath);
  await scheduler.downloadStream(resultUID, resultStream);
  const unzipPath = workingDir + "/UnzipV2";

  await unzip(resultPath, unzipPath);
  const extractFilePath = unzipPath + "/" + "output.txt";
  const result = await extractNAF(extractFilePath);

  console.log("FINAL RESULT TO BE SENT BACK:", result);
  res.send(result);

  //await extractNAF(extractFilePath);
});

async function unzip(zipPath, unzipPath) {
  console.log("in unzip function");
  //console.log("zipPath:", zipPath);
  //console.log("unzipPath", unzipPath);

  const myPromise = new Promise(function(resolve, reject) {
    extract(zipPath, { dir: unzipPath }, err => {
      if (err) {
        reject("Something went wrong while unzipping");
      } else {
        resolve("Zip has been succesfully unzipped");
      }
    });
  });

  myPromise
    .then(response => {
      console.log("Succeed response: ", response);
      return 1;
    })
    .catch(response => {
      console.log.bind(this);
      return 0;
    });
}

async function extractNAF(extractFilePath) {
  console.log("In extractNaf function");
  const readFileAsync = util.promisify(fs.readFile);

  const finalResult = await readFileAsync(extractFilePath, "utf8")
    .then(data => {
      console.log("THEN: in XMLtoJSON ");
      return XMLtoJSON(data);
    })
    .then(jsonOutput => {
      console.log("THEN: in NAFtoENtities ");
      return NAFtoEntities(jsonOutput);
    })
    .then(splitted => {
      console.log("THEN: in resultJSON to main function");
      const result = {
        message: "Zip unzipped, Naf file read and entities extracted",
        filename: "output.txt",
        splittedEntities: splitted
      };
      return result;
    })
    .catch(console.log.bind(this));

  return finalResult;
}

async function XMLtoJSON(data) {
  var parser = new XMLParser();
  var json = await parser.parseFromString(data);
  console.log("XMLtoJSON Result:", json);
  return json;
}

function NAFtoEntities(naf) {
  var entities = naf.getElementsByTagName("entity");
  //console.log('Extracted entities from naf: ', entities);
  var extractedPER = [];
  var extractedLOC = [];
  var extractedORG = [];
  for (var entity of entities) {
    const name = entity.children[0].children[0].name;
    const type = entity.attributes.type;
    const termId =
      entity.children[0].children[0].children[0].children[0].attributes.id;
    //const source = entity.children[0].children[0].children[1].children[0].attributes.reference
    //const confidence = entity.children[0].children[0].children[1].children[0].attributes.confidence;
    var strippedName = name.replace("--", "").replace("--", "");
    var entityDetails = [strippedName, type, termId];
    if (type === "LOC") {
      console.log("Extracted location added to locations: ", strippedName);
      extractedLOC.push(entityDetails);
    } else if (type === "PER") {
      console.log("Extracted person added to persons: ", strippedName);
      extractedPER.push(entityDetails);
    } else if (type === "ORG") {
      console.log(
        "Extracted organization added to organizations: ",
        strippedName
      );
      extractedORG.push(entityDetails);
    } else {
      console.log(
        "Entity does not belong to a current section so it has been skipped..."
      );
      continue;
    }
  }
  return [extractedPER, extractedLOC, extractedORG];
}

// GET method route
app.post("/docker_path", uploads.single("file"), async function(req, res, next) {
  console.log("requested file: ", req.file.path);
  const transferURL = await toFileShare(req.file)
    .then(fileURL => {
      return fileURL;
    })
    .catch(console.log.bind(this));
  const result = { transferURL: transferURL };
  console.log("file URL to be sent to front-end: ", result);
  res.send(result);

});

var server = app.listen(8081, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});
