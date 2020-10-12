const util = require("util");
const exec = util.promisify(require("child_process").exec);
const uuidv4 = require("uuid/v4");
const fs = require("fs");
var express = require("express");
var app = express();
app.get("/", function (req, res) {
    res.send("Hello World!");
});
app.listen(8080, function () {
    console.log("Bible creator listening on port " + 8080 + "!");
});
async function createBible(name) {
    const workDir = `/makemegod/workfiles/${uuidv4()}`;
    try {
        console.log("0: Creating bible:", name);
        const fileName = name;
        const safeName = name;
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
        const fileData = fs.readFileSync(`${workDir}/${fileName}.pdf`);
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