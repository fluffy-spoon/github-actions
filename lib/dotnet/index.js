"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('index.ts');
const path_1 = require("path");
const exec_1 = require("@actions/exec");
const solution_file_parser_1 = __importDefault(require("./solution-file-parser"));
const xml2js_1 = __importDefault(require("xml2js"));
const environment_1 = require("../environment");
const helpers_1 = require("../helpers");
const fs_1 = require("fs");
async function run(commandLine, args, options) {
    let result = await exec_1.exec(commandLine, args, options);
    if (result !== 0)
        return helpers_1.fail('Process ' + commandLine + ' exited with non-zero exit code: ' + result);
}
async function dotnetBuild(solutionFile) {
    console.log('building', solutionFile);
    await run("dotnet", ["build"], {
        cwd: path_1.dirname(solutionFile)
    });
}
async function dotnetTest(solutionFile) {
    console.log('testing', solutionFile);
    await run("dotnet", ["test"], {
        cwd: path_1.dirname(solutionFile)
    });
}
async function dotnetPack(project) {
    console.log('packing', project.csprojFilePath);
    await generateNuspecFileForProject(project);
    await run("dotnet", [
        "pack",
        "--include-symbols",
        "--include-source",
        "--output",
        project.directoryPath,
        "-p:SymbolPackageFormat=snupkg",
        `-p:NuspecFile=${project.nuspecFilePath}`,
        `-p:NuspecBasePath=${project.directoryPath}`
    ], {
        cwd: project.directoryPath
    });
}
async function dotnetNuGetPush(project) {
    let gitHub = await environment_1.getGitHubContext();
    let nugetConfigContents = `<?xml version="1.0" encoding="utf-8"?>
        <configuration>
        <config>
            <add key="DefaultPushSource" value="CustomFeed" />
        </config>
        <packageSources>
            <add key="CustomFeed" value="https://nuget.pkg.github.com/${gitHub.owner.login}/index.json" />
        </packageSources>
        <packageSourceCredentials>
            <CustomFeed>
                <add key="Username" value="${gitHub.repository.owner.login}" />
                <add key="ClearTextPassword" value="${gitHub.token}" />
            </CustomFeed>
        </packageSourceCredentials>
        </configuration>`;
    console.log('writing nuget.config', nugetConfigContents);
    fs_1.writeFileSync(path_1.join(project.directoryPath, 'nuget.config'), nugetConfigContents);
    console.log('publishing package', project.nuspecFilePath);
    let version = getProjectVersion(gitHub);
    await run("dotnet", [
        "nuget",
        "push",
        path_1.join(project.directoryPath, `${project.name}.${version}.nupkg`),
        "--api-key",
        gitHub.token
    ], {
        cwd: project.directoryPath
    });
}
async function generateNuspecFileForProject(project) {
    let github = await environment_1.getGitHubContext();
    let version = getProjectVersion(github);
    let topics = github.repository.topics;
    let newNuspecContents = `<?xml version="1.0"?>
        <package>
            <metadata>
                <id>${project.name}</id>
                <version>${version}</version>
                <authors>${github.owner.name} (${github.owner.login})</authors>
                <owners>${github.owner.name} (${github.owner.login})</owners>
                <readme>README.md</readme>
                ${github.repository.license && github.repository.license.url ?
        `<licenseUrl>${github.repository.license.url}</licenseUrl>` :
        ''}
                <repository type="git" url="${github.repository.git_url}" />
                <projectUrl>${github.repository.html_url}</projectUrl>
                <requireLicenseAcceptance>false</requireLicenseAcceptance>
                <description>${github.repository.description || `The ${project.name} NuGet package.`}</description>
                <releaseNotes>No release notes available.</releaseNotes>
                <copyright>Copyright ${new Date().getFullYear()}</copyright>
                <tags>
                    ${topics ?
        topics.join(', ') :
        ''}
                </tags>
                <dependencies>
                    ${project.packageReferences
        .map(x => `<dependency id="${x.name}" version="${x.version}" />`)
        .join()}
                </dependencies>
            </metadata>
        </package>`;
    const newNuspecXml = await xml2js_1.default.parseStringPromise(newNuspecContents);
    if (fs_1.existsSync(project.nuspecFilePath)) {
        const existingNuspecContents = fs_1.readFileSync(project.nuspecFilePath).toString();
        const existingNuspecXml = await xml2js_1.default.parseStringPromise(existingNuspecContents);
        newNuspecXml.package.metadata[0] = Object.assign(Object.assign({}, newNuspecXml.package.metadata[0]), existingNuspecXml.package.metadata[0]);
        newNuspecContents = new xml2js_1.default.Builder().buildObject(newNuspecXml);
    }
    let nuspecPath = path_1.join(project.directoryPath, `${project.name}.nuspec`);
    console.log('generated nuspec', nuspecPath, newNuspecContents, JSON.stringify(newNuspecXml));
    fs_1.writeFileSync(nuspecPath, newNuspecContents);
}
function getProjectVersion(github) {
    let version = (github.latestRelease && github.latestRelease.name) ||
        '0.0.0';
    version = (+(version.substr(0, 1)) + 1) + version.substr(1);
    return version;
}
async function handleDotNet() {
    console.log('scanning for solutions');
    var solutionFiles = await helpers_1.globSearch("**/*.sln");
    console.log('solutions found', solutionFiles);
    for (let solutionFile of solutionFiles) {
        let projects = await solution_file_parser_1.default.getProjects(solutionFile);
        console.log('projects detected', solutionFile, projects);
        let testProjects = projects.filter(x => x.isTestProject);
        for (let project of testProjects) {
            await dotnetBuild(project.csprojFilePath);
            await dotnetTest(project.csprojFilePath);
        }
        let nonTestProjects = projects.filter(x => !x.isTestProject);
        for (let project of nonTestProjects) {
            await dotnetBuild(project.csprojFilePath);
            await dotnetPack(project);
        }
        for (let project of nonTestProjects)
            await dotnetNuGetPush(project);
    }
}
exports.default = handleDotNet;
