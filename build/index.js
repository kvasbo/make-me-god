var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var util = require("util");
var exec = util.promisify(require("child_process").exec);
var uuidv4 = require("uuid/v4");
var fs = require("fs");
var express = require("express");
var app = express();
app.get("/", function (req, res) {
    res.send("Hello World!");
});
app.listen(8080, function () {
    console.log("Bible creator listening on port " + 8080 + "!");
});
var queue = (function () {
    function queue() {
    }
    queue.prototype.init = function (name, interval) {
        return __awaiter(this, void 0, void 0, function () {
            var sqsparams;
            var _this = this;
            return __generator(this, function (_a) {
                sqsparams = {
                    QueueName: name,
                    Attributes: {
                        DelaySeconds: "2",
                        MessageRetentionPeriod: "86400",
                    },
                };
                sqs.createQueue(sqsparams, function (err, data) {
                    if (err) {
                        console.log(err);
                        return false;
                    }
                    else {
                        console.log("Q: Queue created", data.QueueUrl);
                        _this.url = data.QueueUrl;
                        setInterval(function () { return _this.checkQueue(); }, interval);
                    }
                });
                return [2];
            });
        });
    };
    queue.prototype.addToQueue = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_a) {
                console.log("Q: Adding", this.url, name);
                params = {
                    DelaySeconds: 2,
                    MessageAttributes: {
                        name: {
                            DataType: "String",
                            StringValue: name,
                        },
                    },
                    MessageBody: "Bible ordered: " + name,
                    QueueUrl: this.url,
                };
                sqs.sendMessage(params, function (err, data) {
                    if (err) {
                        console.log("Error", err);
                    }
                    else {
                        console.log("Q Added", data.MessageId);
                    }
                });
                return [2];
            });
        });
    };
    queue.prototype.checkQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var checkParams;
            var _this = this;
            return __generator(this, function (_a) {
                checkParams = {
                    AttributeNames: ["SentTimestamp"],
                    MaxNumberOfMessages: 1,
                    MessageAttributeNames: ["All"],
                    QueueUrl: this.url,
                    VisibilityTimeout: 60,
                    WaitTimeSeconds: 3,
                };
                sqs.receiveMessage(checkParams, function (err, data) { return __awaiter(_this, void 0, void 0, function () {
                    var name, err_1;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!err) return [3, 1];
                                console.log("Receive Error", err);
                                return [3, 7];
                            case 1:
                                if (!data.Messages) return [3, 7];
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 4, , 5]);
                                name = data.Messages[0].MessageAttributes.name.StringValue;
                                return [4, createBible(name)];
                            case 3:
                                _a.sent();
                                return [3, 5];
                            case 4:
                                err_1 = _a.sent();
                                console.log("E: Malformed message");
                                return [3, 5];
                            case 5: return [4, new Promise(function (resolve, reject) {
                                    sqs.deleteMessage({
                                        QueueUrl: _this.url,
                                        ReceiptHandle: data.Messages[0].ReceiptHandle,
                                    }, function (err, data) {
                                        if (err) {
                                            console.log("Delete Error", err);
                                            reject();
                                        }
                                        else {
                                            console.log("Q: Message Deleted", data);
                                            resolve();
                                        }
                                    });
                                })];
                            case 6:
                                _a.sent();
                                _a.label = 7;
                            case 7: return [2];
                        }
                    });
                }); });
                console.log("Q: Checking queue");
                return [2];
            });
        });
    };
    return queue;
}());
function createBible(name) {
    return __awaiter(this, void 0, void 0, function () {
        var workDir, fileName, safeName, fileData, params, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workDir = "/makemegod/workfiles/" + uuidv4();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 11]);
                    console.log("0: Creating bible:", name);
                    fileName = name;
                    safeName = name;
                    return [4, exec("mkdir " + workDir)];
                case 2:
                    _a.sent();
                    if (!name)
                        throw Exception("No name defined");
                    return [4, exec("echo \"s/tullegud/" + safeName + "/ig\" > " + workDir + "/" + fileName + ".sed")];
                case 3:
                    _a.sent();
                    console.log("1: Created SED file");
                    return [4, exec("sed -f " + workDir + "/" + fileName + ".sed /makemegod/templates/template.tex.base > " + workDir + "/template." + fileName + ".tex")];
                case 4:
                    _a.sent();
                    console.log("2: Created bible template .tex file");
                    console.log("3: Starting creation...");
                    return [4, exec("pdflatex -jobname=" + fileName + " -output-directory " + workDir + " " + workDir + "/template." + fileName + ".tex > " + workDir + "/latexoutput.txt")];
                case 5:
                    _a.sent();
                    console.log("4: Creation is done", name);
                    fileData = fs.readFileSync(workDir + "/" + fileName + ".pdf");
                    params = {
                        Body: fileData,
                        Bucket: "bibles.makemegod.com",
                        Key: fileName + ".pdf",
                        Metadata: {
                            name: name,
                        },
                    };
                    return [4, new Promise(function (resolve, reject) {
                            s3.putObject(params, function (err, data) {
                                if (err)
                                    reject();
                                else
                                    resolve();
                            });
                        })];
                case 6:
                    _a.sent();
                    console.log("5: Uploaded to s3", name);
                    return [4, exec("rm -rf " + workDir)];
                case 7:
                    _a.sent();
                    return [3, 11];
                case 8:
                    err_2 = _a.sent();
                    console.log(err_2);
                    return [3, 11];
                case 9: return [4, exec("rm -rf " + workDir)];
                case 10:
                    _a.sent();
                    console.log("6: Cleaned up work dir", name);
                    return [7];
                case 11: return [2];
            }
        });
    });
}
var q = new queue();
function init() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, q.init("MAKE_ME_GOD", 2000)];
                case 1:
                    _a.sent();
                    setTimeout(function () { return q.addToQueue("Audun"); }, 1000);
                    setTimeout(function () { return q.addToQueue("Audun2"); }, 2000);
                    setTimeout(function () { return q.addToQueue("Audun3"); }, 3000);
                    setTimeout(function () { return q.addToQueue("Audun4"); }, 4000);
                    return [2];
            }
        });
    });
}
init();
//# sourceMappingURL=index.js.map