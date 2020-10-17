import util from "util";
import path from "path";
const exec = util.promisify(require("child_process").exec);
import fs from "fs";
import express from "express";
import { AllowedStatus, BibleStatuses, AjaxReply } from "./types";

const finishedDir = "./bibles";
const statuses: BibleStatuses = {};

var app = express();

// Ajax code
app.get("/bible/:name", function (req: any, res: any) {
  const status = getStatusOrStart(req.params.name);
  const result: AjaxReply = {
    status,
    name: req.params.name,
  };
  if (status === "done") {
    const filename = createSafeFilename(req.params.name);
    result.url = `bibles/${filename}.pdf`;
  }
  res.status(201).json(result);
});

app.use("/", express.static(path.join(__dirname, "/frontend/")));
app.use("/scripts", express.static(path.join(__dirname, "/dist/")));
app.use("/bibles", express.static(path.join(__dirname, "/bibles/")));

app.listen(8080, function () {
  console.log("Backend listening on port " + 8080);
});

async function createBible(name: string) {
  // Nopey dopey
  if (!name) throw Error("No name defined");

  const fileName = createSafeFilename(name);
  const safeName = createSafeFilename(name);

  const workDir = getWorkDir(name);

  try {
    // Create work dir
    if (!fs.existsSync(workDir)) {
      await exec(`mkdir ${workDir}`);
    } else {
      await exec(`rm -rf ${workDir}/*`);
    }

    setStatus(name, "started");

    await exec(`echo "s/tullegud/${safeName}/ig" > ${workDir}/${fileName}.sed`);

    await exec(
      `sed -f ${workDir}/${fileName}.sed /makemegod/templates/template.tex.base > ${workDir}/template.${fileName}.tex`
    );

    setStatus(name, "building");
    await exec(
      `pdflatex -jobname=${fileName} -output-directory ${workDir} ${workDir}/template.${fileName}.tex > ${workDir}/latexoutput.txt`
    );

    await exec(`mv ${workDir}/${fileName}.pdf /makemegod/bibles`);
    setStatus(name, "done");
  } catch (err) {
    console.log(err);
  } finally {
    await exec(`rm -rf ${workDir}`);
  }
  return;
}

function getStatusOrStart(name: string): AllowedStatus {
  const safeName = createSafeFilename(name);
  if (!statuses[safeName]) {
    const exists = initStatus(name);
    if (!exists) {
      createBible(name);
    }
    return statuses[safeName];
  } else {
    return statuses[safeName];
  }
}

function initStatus(name: string): boolean {
  //It exists
  const safeName = createSafeFilename(name);
  if (checkForBible(name)) {
    statuses[safeName] = "done";
    return true;
  } else {
    statuses[safeName] = "init";
    return false;
  }
}

function setStatus(name: string, status: AllowedStatus) {
  console.log(`Status: ${name}: ${status}`);
  const safeName = createSafeFilename(name);
  statuses[safeName] = status;
}

function checkForBible(name: string) {
  const file = createSafeFilename(name);
  return fs.existsSync(getFinishedBiblePath(name));
}

function getFinishedBiblePath(name: string): string {
  const file = createSafeFilename(name);
  return `${finishedDir}/${file}.pdf`;
}

function getWorkDir(name: string) {
  return `./tmp/${createSafeFilename(name)}`;
}

function createSafeFilename(name: string) {
  return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}
