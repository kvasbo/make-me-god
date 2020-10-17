"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const exec = util_1.default.promisify(require("child_process").exec);
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const finishedDir = "./bibles";
const statuses = {};
var app = express_1.default();
express_1.default.static("./frontend/", {});
app.get("/", function (req, res) {
    res.send("Hello World!");
});
app.listen(8080, function () {
    console.log("Bible creator listening on port " + 8080 + "!");
});
async function createBible(name) {
    if (!name)
        throw Error("No name defined");
    const fileName = createSafeFilename(name);
    const safeName = createSafeFilename(name);
    const workDir = getWorkDir(name);
    try {
        console.log("0: Creating bible:", name);
        initStatus(name);
        if (!fs_1.default.existsSync(workDir)) {
            await exec(`mkdir ${workDir}`);
        }
        else {
            console.log("0: Workdir existed, cleaning out");
            await exec(`rm -rf ${workDir}/*`);
        }
        setStatus(name, "started");
        await exec(`echo "s/tullegud/${safeName}/ig" > ${workDir}/${fileName}.sed`);
        console.log("1: Created SED file");
        await exec(`sed -f ${workDir}/${fileName}.sed /makemegod/templates/template.tex.base > ${workDir}/template.${fileName}.tex`);
        console.log("2: Created bible template .tex file");
        console.log("3: Starting creation...");
        setStatus(name, "building");
        await exec(`pdflatex -jobname=${fileName} -output-directory ${workDir} ${workDir}/template.${fileName}.tex > ${workDir}/latexoutput.txt`);
        console.log("4: Creation is done", name);
        console.log("5: Cleaning up and copying files");
        await exec(`mv ${workDir}/${fileName}.pdf /makemegod/bibles`);
        setStatus(name, "done");
    }
    catch (err) {
        console.log(err);
    }
    finally {
        await exec(`rm -rf ${workDir}`);
        console.log("6: Cleaned up work dir", name);
    }
    return;
}
function initStatus(name) {
    const safeName = createSafeFilename(name);
    if (checkForBible(name)) {
        statuses[safeName] = "done";
        return true;
    }
    else {
        statuses[safeName] = "init";
        return false;
    }
}
function setStatus(name, status) {
    console.log(`Status: ${name}: ${status}`);
    const safeName = createSafeFilename(name);
    statuses[safeName] = status;
}
async function init() {
    console.log("starter");
    createBible("Audun");
}
function checkForBible(name) {
    const file = createSafeFilename(name);
    return fs_1.default.existsSync(getFinishedBiblePath(name));
}
function getFinishedBiblePath(name) {
    const file = createSafeFilename(name);
    return `${finishedDir}/${file}.pdf`;
}
function getWorkDir(name) {
    return `./tmp/${createSafeFilename(name)}`;
}
function createSafeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}
init();
//# sourceMappingURL=index.js.map