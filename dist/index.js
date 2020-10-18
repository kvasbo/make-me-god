"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const path_1 = __importDefault(require("path"));
const exec = util_1.default.promisify(require("child_process").exec);
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const finishedDir = "./bibles";
const statuses = {};
express_1.default.static.mime.define({ "application/pdf": ["pdf"] });
express_1.default.static.mime.define({ "text/javascript": ["js"] });
var app = express_1.default();
app.get("/bible/:name", function (req, res) {
    const name = decodeURIComponent(req.params.name).substring(0, 40);
    if (name.length < 1) {
        res.status(403).json({ error: "No name" });
    }
    const status = getStatusOrStart(name);
    const result = {
        status,
        name,
    };
    if (status === "done") {
        const filename = createSafeFilename(name);
        result.url = `bibles/${filename}.pdf`;
    }
    res.status(200).json(result);
});
app.use("/", express_1.default.static(path_1.default.join(__dirname, "/frontend/")));
app.use("/scripts", express_1.default.static(path_1.default.join(__dirname, "/dist/")));
app.use("/bibles", express_1.default.static(path_1.default.join(__dirname, "/bibles/")));
app.listen(8080, function () {
    console.log("God listening on port " + 8080);
});
function createBible(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!name)
            throw Error("No name defined");
        const fileName = createSafeFilename(name);
        const safeName = name;
        const workDir = getWorkDir(name);
        try {
            if (!fs_1.default.existsSync(workDir)) {
                yield exec(`mkdir ${workDir}`);
            }
            else {
                yield exec(`rm -rf ${workDir}/*`);
            }
            setStatus(name, "started");
            yield exec(`echo "s/tullegud/${safeName}/ig" > ${workDir}/${fileName}.sed`);
            yield exec(`sed -f ${workDir}/${fileName}.sed /makemegod/templates/template.tex.base > ${workDir}/template.${fileName}.tex`);
            setStatus(name, "building");
            yield exec(`pdflatex -jobname=${fileName} -output-directory ${workDir} ${workDir}/template.${fileName}.tex > ${workDir}/latexoutput.txt`);
            yield exec(`mv ${workDir}/${fileName}.pdf /makemegod/bibles`);
            setStatus(name, "done");
        }
        catch (err) {
            console.log(err);
        }
        finally {
            yield exec(`rm -rf ${workDir}`);
        }
        return;
    });
}
function getStatusOrStart(name) {
    const safeName = createSafeFilename(name);
    if (!statuses[safeName]) {
        const exists = initStatus(safeName);
        if (!exists) {
            createBible(name);
        }
        return statuses[safeName];
    }
    else {
        return statuses[safeName];
    }
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
function checkForBible(name) {
    const file = createSafeFilename(name);
    return fs_1.default.existsSync(getFinishedBiblePath(file));
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
