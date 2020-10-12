const util = require("util");
const exec = util.promisify(require("child_process").exec);
const uuidv4 = require("uuid/v4");
const fs = require("fs");
var express = require("express");
var app = express();

app.get("/", function(req, res) {
    res.send("Hello World!");
});

app.listen(8080, function() {
    console.log("Bible creator listening on port " + 8080 + "!");
});

class queue {
    async init(name, interval) {
        var sqsparams = {
            QueueName: name,
            Attributes: {
                DelaySeconds: "2",
                MessageRetentionPeriod: "86400",
            },
        };
        sqs.createQueue(sqsparams, (err, data) => {
            if (err) {
                console.log(err);
                return false;
            } else {
                console.log("Q: Queue created", data.QueueUrl);
                // Start checking
                this.url = data.QueueUrl;
                setInterval(() => this.checkQueue(), interval);
            }
        });
    }

    async addToQueue(name) {
        console.log("Q: Adding", this.url, name);
        var params = {
            DelaySeconds: 2,
            MessageAttributes: {
                name: {
                    DataType: "String",
                    StringValue: name,
                },
            },
            MessageBody: `Bible ordered: ${name}`,
            QueueUrl: this.url,
        };

        sqs.sendMessage(params, function(err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Q Added", data.MessageId);
            }
        });
    }

    async checkQueue() {
        const checkParams = {
            AttributeNames: ["SentTimestamp"],
            MaxNumberOfMessages: 1,
            MessageAttributeNames: ["All"],
            QueueUrl: this.url,
            VisibilityTimeout: 60,
            WaitTimeSeconds: 3,
        };
        sqs.receiveMessage(checkParams, async(err, data) => {
            if (err) {
                console.log("Receive Error", err);
            } else if (data.Messages) {
                // Do the stuff
                try {
                    const name = data.Messages[0].MessageAttributes.name.StringValue;
                    await createBible(name);
                } catch (err) {
                    console.log("E: Malformed message");
                }

                // Await deletion
                await new Promise((resolve, reject) => {
                    sqs.deleteMessage({
                            QueueUrl: this.url,
                            ReceiptHandle: data.Messages[0].ReceiptHandle,
                        },
                        (err, data) => {
                            if (err) {
                                console.log("Delete Error", err);
                                reject();
                            } else {
                                console.log("Q: Message Deleted", data);
                                resolve();
                            }
                        }
                    );
                });
            }
        });
        console.log("Q: Checking queue");
    }
}

async function createBible(name) {
    const workDir = `/makemegod/workfiles/${uuidv4()}`;
    try {
        console.log("0: Creating bible:", name);
        const fileName = name;
        const safeName = name;
        await exec(`mkdir ${workDir}`);
        if (!name) throw Exception("No name defined");
        await exec(`echo "s/tullegud/${safeName}/ig" > ${workDir}/${fileName}.sed`);
        console.log("1: Created SED file");
        await exec(
            `sed -f ${workDir}/${fileName}.sed /makemegod/templates/template.tex.base > ${workDir}/template.${fileName}.tex`
        );
        console.log("2: Created bible template .tex file");
        console.log("3: Starting creation...");
        await exec(
            `pdflatex -jobname=${fileName} -output-directory ${workDir} ${workDir}/template.${fileName}.tex > ${workDir}/latexoutput.txt`
        );
        console.log("4: Creation is done", name);
        // console.log("5: Cleaning up and copying files");
        // await exec(`mv ${workDir}/${fileName}.pdf /makemegod/bibles`);
        // Upload
        const fileData = fs.readFileSync(`${workDir}/${fileName}.pdf`);
        var params = {
            Body: fileData,
            Bucket: "bibles.makemegod.com",
            Key: `${fileName}.pdf`,
            Metadata: {
                name: name,
            },
        };
        // const { err, data } =
        await new Promise((resolve, reject) => {
            s3.putObject(params, (err, data) => {
                if (err) reject();
                // an error occurred
                else resolve(); // successful response
            });
        });
        console.log("5: Uploaded to s3", name);
        await exec(`rm -rf ${workDir}`);
    } catch (err) {
        console.log(err);
    } finally {
        await exec(`rm -rf ${workDir}`);
        console.log("6: Cleaned up work dir", name);
    }
    return;
}

const q = new queue();
async function init() {
    // const queueUrl = await initQueue();
    await q.init("MAKE_ME_GOD", 2000);
    // queue.addToQueue("Audun");
    setTimeout(() => q.addToQueue("Audun"), 1000);
    setTimeout(() => q.addToQueue("Audun2"), 2000);
    setTimeout(() => q.addToQueue("Audun3"), 3000);
    setTimeout(() => q.addToQueue("Audun4"), 4000);
}

init();