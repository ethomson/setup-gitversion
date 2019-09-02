"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const exec = __importStar(require("@actions/exec"));
const tc = __importStar(require("@actions/tool-cache"));
function getToolRoot() {
    let toolRoot = process.env['RUNNER_TOOL_CACHE'] || '';
    if (!toolRoot) {
        let baseLocation;
        if (process.platform === 'win32') {
            baseLocation = process.env['USERPROFILE'] || 'C:\\';
        }
        else if (process.platform === 'darwin') {
            baseLocation = '/Users';
        }
        else {
            baseLocation = '/home';
        }
        toolRoot = path.join(baseLocation, 'actions', 'cache');
    }
    return toolRoot;
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (process.platform === 'win32') {
                yield exec.exec('choco', ['install', 'gitversion.portable']);
            }
            else {
                let url = 'https://github.com/GitTools/GitVersion/releases/download/5.0.1/GitVersion-bin-corefx-v5.0.1.zip';
                core.debug("Creating tool dir");
                const toolPath = path.join(getToolRoot(), 'gitversion');
                yield io.mkdirP(toolPath);
                core.debug("Downloading tool");
                const zipPath = yield tc.downloadTool(url);
                core.debug("Extracting zip");
                yield tc.extractZip(zipPath, toolPath);
                core.debug("Writing wrapper script");
                const exePath = toolPath + '/gitversion';
                yield fs.writeFile(exePath, '#!/bin/sh\n' +
                    'exec dotnet ' + toolPath + '/GitVersion.dll $*\n', function (err) { if (err) {
                    throw (err);
                } });
                yield exec.exec('chmod', ['0755', exePath]);
                core.addPath(toolPath);
            }
        }
        catch (err) {
            core.setFailed(err.message);
        }
    });
}
run();
