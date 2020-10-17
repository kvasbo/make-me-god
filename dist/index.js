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
var app = express_1.default();
app.get("/", function (req, res) {
    res.sendFile(path_1.default.join(__dirname + "/frontend/index.html"));
});
app.get("/frontend.js", function (req, res) {
    res.sendFile(path_1.default.join(__dirname + "/dist/frontend.js"));
});
app.get("/index.css", function (req, res) {
    res.sendFile(path_1.default.join(__dirname + "/frontend/index.css"));
});
app.get("/bible/:name", function (req, res) {
    const status = getStatusOrStart(req.params.name);
    const result = {
        status,
        name: req.params.name,
    };
    res.status(201).json(result);
});
app.listen(8080, function () {
    console.log("Bible creator listening on port " + 8080 + "!");
});
function createBible(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!name)
            throw Error("No name defined");
        const fileName = createSafeFilename(name);
        const safeName = createSafeFilename(name);
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
        const exists = initStatus(name);
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
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("starter");
        createBible("Audun");
    });
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