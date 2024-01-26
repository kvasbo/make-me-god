import util from "util";
import path from "path";
import fs from "fs";
import express from "express";
import { AllowedStatus, BibleStatuses, AjaxReply } from "./types";
const exec = util.promisify(require("child_process").exec);

const port = 80;
const finishedDir = path.join(__dirname, "bibles");
const tmpDir = path.join(__dirname, "tmp");
const cleanupAfterHours = 1;
const cleanupIntervalInSeconds = 3600;

// Hold state
const statuses: BibleStatuses = {};

// Cleanup
setInterval(() => cleanupOldFiles(), 1000 * cleanupIntervalInSeconds);
cleanupOldFiles();

// Mimetypes
express.static.mime.define({ "application/pdf": ["pdf"] });
express.static.mime.define({ "text/javascript": ["js"] });

// Create web server
var app = express();

// Endpoint for creating bibles
app.get("/bible/:name", function (req: any, res: any) {
  // Clean up and cut off.
  const name = decodeURIComponent(req.params.name).substring(0, 40);
  if (name.length < 1) {
    res.status(403).json({ error: "No name" });
  }
  const status = getStatusOrStart(name);
  const result: AjaxReply = {
    status,
    name,
  };
  if (status === "done") {
    // Add url to return
    result.url = `bibles/${createSafeFilename(name)}.pdf`;
    // Remove the status, we have returned
    deleteStatus(name);
  }
  res.status(200).json(result);
});

// Add some paths
// app.use("/", express.static(path.join(__dirname, "/frontend/")));
app.use("/scripts", express.static(path.join(__dirname, "/dist/")));
app.use("/bibles", express.static(finishedDir));

app.get('/', (req, res) => {
  console.log("Serving index");
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.get('/index.css', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.css'));
});

// Listen to the port
app.listen(port, function () {
  console.log(`God listening on port ${port}`);
});

/**
 * The central function. Gets a status, or starts a creation.
 * @param name Guess
 */
function getStatusOrStart(name: string): AllowedStatus {
  const safeName = createSafeFilename(name);
  if (!statuses[safeName]) {
    const exists = initStatus(safeName);
    if (!exists) {
      createBible(name);
    }
    return statuses[safeName];
  } else {
    return statuses[safeName];
  }
}

/**
 * Creation
 * @param name
 */
async function createBible(name: string = "Kiwibob") {
  const fileName = createSafeFilename(name);

  const workDir = `${tmpDir}/${createSafeFilename(name)}`;

  try {
    // Create work dir
    if (!fs.existsSync(workDir)) {
      await exec(`mkdir ${workDir}`);
    }

    setStatus(name, "started");

    // Create replacement file
    await exec(`echo "s/tullegud/${name}/ig" > ${workDir}/${fileName}.sed`);

    // Replace name in template
    await exec(
      `sed -f ${workDir}/${fileName}.sed /makemegod/templates/template.tex.base > ${workDir}/template.${fileName}.tex`
    );

    setStatus(name, "building");

    // Compile pdf
    await exec(
      `pdflatex -jobname=${fileName} -output-directory ${workDir} ${workDir}/template.${fileName}.tex > ${workDir}/latexoutput.txt`
    );

    // Move file to finished folder
    await exec(`mv ${workDir}/${fileName}.pdf /makemegod/bibles`);
    setStatus(name, "done");
  } catch (err) {
    console.log(err);
  } finally {
    // Remove workdir when done
    await exec(`rm -rf ${workDir}`);
  }
  return;
}

/**
 * Unset state
 * @param name
 */
function deleteStatus(name: string): void {
  const safeName = createSafeFilename(name);
  delete statuses[safeName];
}

/**
 * Initiate state
 * @param name
 */
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

/**
 * Update state
 * @param name
 * @param status
 */
function setStatus(name: string, status: AllowedStatus) {
  console.log(`Status: ${name}: ${status}`);
  const safeName = createSafeFilename(name);
  statuses[safeName] = status;
}

/**
 * Check if we have a file already
 * @param name
 */
function checkForBible(name: string) {
  const file = createSafeFilename(name);
  return fs.existsSync(getFinishedBiblePath(file));
}

/**
 * Get the path for a bible
 * @param name
 */
function getFinishedBiblePath(name: string): string {
  const file = createSafeFilename(name);
  return `${finishedDir}/${file}.pdf`;
}

/**
 * Clean up a file name
 * @param name
 */
function createSafeFilename(name: string) {
  return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

/**
 * Cleanup old files
 */
async function cleanupOldFiles() {
  console.log(`Cleaning files older than ${cleanupAfterHours} hour(s).`);
  const threshold = Date.now() - cleanupAfterHours * 60 * 60 * 1000;
  fs.readdir(finishedDir, function (err, files) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    // Loop through dir
    files.forEach(function (file) {
      try {
        const path = `${finishedDir}/${file}`;
        const stats = fs.statSync(path);
        const fileTime = stats.mtime.valueOf();
        if (fileTime < threshold) {
          fs.unlink(path, (err) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(`Deleted file: ${path}`);
          });
        }
      } catch (e) {
        console.log(e);
      }
    });
  });
}
