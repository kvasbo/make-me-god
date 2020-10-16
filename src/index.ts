import util from "util";
const exec = util.promisify(require("child_process").exec);
// import { exec } from "child_process";
import fs from "fs";
import express from "express";

type AllowedStatus = "init" | "started" | "building" | "cleaning" | "done";

interface BibleStatuses {
  [s: string]: AllowedStatus;
}

const finishedDir = "./bibles";
const statuses: BibleStatuses = {};

var app = express();

app.get("/", function (req: any, res: any) {
  res.send("Hello World!");
});

app.listen(8080, function () {
  console.log("Bible creator listening on port " + 8080 + "!");
});

async function createBible(name: string) {
  // Nopey dopey
  if (!name) throw Error("No name defined");

  const fileName = createSafeFilename(name);
  const safeName = createSafeFilename(name);

  const workDir = getWorkDir(name);

  try {
    console.log("0: Creating bible:", name);

    // Create work dir
    if (!fs.existsSync(workDir)) {
      await exec(`mkdir ${workDir}`);
    } else {
      console.log("0: Workdir existed, cleaning out");
      await exec(`rm -rf ${workDir}/*`);
    }

    setStatus(name, "started");

    await exec(`echo "s/tullegud/${safeName}/ig" > ${workDir}/${fileName}.sed`);
    console.log("1: Created SED file");
    await exec(
      `sed -f ${workDir}/${fileName}.sed /makemegod/templates/template.tex.base > ${workDir}/template.${fileName}.tex`
    );
    console.log("2: Created bible template .tex file");
    console.log("3: Starting creation...");

    setStatus(name, "building");
    await exec(
      `pdflatex -jobname=${fileName} -output-directory ${workDir} ${workDir}/template.${fileName}.tex > ${workDir}/latexoutput.txt`
    );
    console.log("4: Creation is done", name);

    console.log("5: Cleaning up and copying files");
    await exec(`mv ${workDir}/${fileName}.pdf /makemegod/bibles`);
    setStatus(name, "done");
  } catch (err) {
    console.log(err);
  } finally {
    await exec(`rm -rf ${workDir}`);
    console.log("6: Cleaned up work dir", name);
  }
  return;
}

function initStatus(name: string) {
  //It exists
  const safeName = createSafeFilename(name);
  if (checkForBible(name)) {
    statuses[safeName] = "done";
  } else {
    statuses[safeName] = "init";
  }
}

function setStatus(name: string, status: AllowedStatus) {
  console.log(`Status: ${name}: ${status}`);
  const safeName = createSafeFilename(name);
  statuses[safeName] = status;
}

async function init() {
  console.log("starter");
  createBible("Audun");
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

init();
