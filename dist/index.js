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
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const exec = util_1.default.promisify(require("child_process").exec);
const port = 8080;
const finishedDir = path_1.default.join(__dirname, "bibles");
const tmpDir = path_1.default.join(__dirname, "tmp");
const cleanupAfterHours = 1;
const cleanupIntervalInSeconds = 3600;
const statuses = {};
setInterval(() => cleanupOldFiles(), 1000 * cleanupIntervalInSeconds);
cleanupOldFiles();
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
        result.url = `bibles/${createSafeFilename(name)}.pdf`;
        deleteStatus(name);
    }
    res.status(200).json(result);
});
app.use("/", express_1.default.static(path_1.default.join(__dirname, "/frontend/")));
app.use("/scripts", express_1.default.static(path_1.default.join(__dirname, "/dist/")));
app.use("/bibles", express_1.default.static(finishedDir));
app.listen(port, function () {
    console.log(`God listening on port ${port}`);
});
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
function createBible(name = "Kiwibob") {
    return __awaiter(this, void 0, void 0, function* () {
        const fileName = createSafeFilename(name);
        const workDir = `${tmpDir}/${createSafeFilename(name)}`;
        try {
            if (!fs_1.default.existsSync(workDir)) {
                yield exec(`mkdir ${workDir}`);
            }
            setStatus(name, "started");
            yield exec(`echo "s/tullegud/${name}/ig" > ${workDir}/${fileName}.sed`);
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
function deleteStatus(name) {
    const safeName = createSafeFilename(name);
    delete statuses[safeName];
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
function createSafeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}
function cleanupOldFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Cleaning files older than ${cleanupAfterHours} hour(s).`);
        const threshold = Date.now() - cleanupAfterHours * 60 * 60 * 1000;
        fs_1.default.readdir(finishedDir, function (err, files) {
            if (err) {
                return console.log("Unable to scan directory: " + err);
            }
            files.forEach(function (file) {
                try {
                    const path = `${finishedDir}/${file}`;
                    const stats = fs_1.default.statSync(path);
                    const fileTime = stats.mtime.valueOf();
                    if (fileTime < threshold) {
                        fs_1.default.unlink(path, (err) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            console.log(`Deleted file: ${path}`);
                        });
                    }
                }
                catch (e) {
                    console.log(e);
                }
            });
        });
    });
}
//# sourceMappingURL=index.js.map