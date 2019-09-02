import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as io from '@actions/io'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'

function getToolRoot() {
  let toolRoot = process.env['RUNNER_TOOL_CACHE'] || ''
  if (!toolRoot) {
    let baseLocation: string
    if (process.platform === 'win32') {
      baseLocation = process.env['USERPROFILE'] || 'C:\\'
    } else if (process.platform === 'darwin') {
      baseLocation = '/Users'
    } else {
      baseLocation = '/home'
    }

    toolRoot = path.join(baseLocation, 'actions', 'cache')
  }
  return toolRoot;
}

async function run() {
  try {
    if (process.platform === 'win32') {
      await exec.exec('choco', [ 'install', 'gitversion.portable' ]);
    } else {
      let url = 'https://github.com/GitTools/GitVersion/releases/download/5.0.1/GitVersion-bin-corefx-v5.0.1.zip'

      core.debug("Creating tool dir")
      const toolPath = path.join(getToolRoot(), 'gitversion')
      await io.mkdirP(toolPath)

      core.debug("Downloading tool")
      const zipPath = await tc.downloadTool(url)

      core.debug("Extracting zip")
      await tc.extractZip(zipPath, toolPath)

      core.debug("Writing wrapper script")
      const exePath = toolPath + '/gitversion'
      await fs.writeFile(exePath,
        '#!/bin/sh\n' +
        'exec dotnet ' + toolPath + '/GitVersion.dll $*\n',
        function(err) { if (err) { throw(err) } }
      );
      await exec.exec('chmod', [ '0755', exePath ]);
      core.addPath(toolPath)
    }
  } catch (err) {
    core.setFailed(err.message)
  }
}

run();
