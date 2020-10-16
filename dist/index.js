"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const exec = util_1.default.promisify(require("child_process").exec);
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
var app = express_1.default();
app.get("/", function (req, res) {
    res.send("Hello World!");
});
app.listen(8080, function () {
    console.log("Bible creator listening on port " + 8080 + "!");
});
async function createBible(name) {
    const tmpDir = "./tmp";
    const workDir = `${tmpDir}/${uuid_1.v4()}`;
    try {
        await exec(`mkdir ${workDir}`);
        console.log("0: Creating bible:", name);
        const fileName = name;
        const safeName = name;
        try {
        }
        catch (e) {
            await exec(`mkdir ${tmpDir}`);
        }
        await exec(`mkdir ${workDir}`);
        if (!name)
            throw Error("No name defined");
        await exec(`echo "s/tullegud/${safeName}/ig" > ${workDir}/${fileName}.sed`);
        console.log("1: Created SED file");
        await exec(`sed -f ${workDir}/${fileName}.sed /makemegod/templates/template.tex.base > ${workDir}/template.${fileName}.tex`);
        console.log("2: Created bible template .tex file");
        console.log("3: Starting creation...");
        await exec(`pdflatex -jobname=${fileName} -output-directory ${workDir} ${workDir}/template.${fileName}.tex > ${workDir}/latexoutput.txt`);
        console.log("4: Creation is done", name);
        const fileData = fs_1.default.readFileSync(`${workDir}/${fileName}.pdf`);
        var params = {
            Body: fileData,
            Bucket: "bibles.makemegod.com",
            Key: `${fileName}.pdf`,
            Metadata: {
                name: name,
            },
        };
        await new Promise((resolve, reject) => {
            resolve();
        });
        console.log("5: Uploaded to s3", name);
        await exec(`rm -rf ${workDir}`);
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
async function init() {
    console.log("starter");
    createBible("Audun");
}
init();
//# sourceMappingURL=index.js.map