console.log('index.ts');

import { join, dirname } from 'path';

import { exec } from '@actions/exec';

import { ExecOptions } from '@actions/exec/lib/interfaces';

import SolutionFileParser from './solution-file-parser';
import xml2js from 'xml2js';

import { getGitHubContext } from '../environment';
import { globSearch, fail } from '../helpers';
import { Project } from './project-file-parser';
import { writeFileSync, readFileSync, existsSync } from 'fs';

async function run(commandLine: string, args?: string[], options?: ExecOptions) {
    let result = await exec(commandLine, args, options);
    if(result !== 0)
        return fail('Process ' + commandLine + ' exited with non-zero exit code: ' + result);
}

async function dotnetBuild(solutionFile: string) {
    console.log('building', solutionFile);
    await run("dotnet", ["build"], {
        cwd: dirname(solutionFile)
    });
}

async function dotnetTest(solutionFile: string) {
    console.log('testing', solutionFile);
    await run("dotnet", ["test"], {
        cwd: dirname(solutionFile)
    });
}

async function dotnetPack(project: Project) {
    console.log('packing', project.csprojFilePath);

    await run("dotnet", [
        "pack",
        "--include-symbols",
        "--include-source",
        "-p:SymbolPackageFormat=snupkg",
        `-p:NuspecFile=${project.nuspecFilePath}`,
        `-p:NuspecBasePath=${project.directoryPath}`
    ], {
        cwd: project.directoryPath
    });
}

async function dotnetNuGetPush(nuGetFile: string) {
    console.log('adding package source', nuGetFile);
    
    let gitHub = await getGitHubContext();
    await run("dotnet", [
        "nuget",
        "sources",
        "add",
        "-Name",
        "GPR",
        "-Source",
        `https://nuget.pkg.github.com/${gitHub.owner.login}/index.json`,
        "-UserName",
        gitHub.repository.owner.login,
        "-Password",
        gitHub.token
    ], {
        cwd: dirname(nuGetFile)
    });
    
    console.log('publishing package', nuGetFile);

    await run("dotnet", [
        "nuget",
        "push",
        nuGetFile,
        "-Source",
        "GPR"
    ], {
        cwd: dirname(nuGetFile)
    });
}

async function generateNuspecFileForProject(project: Project) {
    let github = await getGitHubContext();

    let version = 
        (github.latestRelease && github.latestRelease.name) ||
        '1.0.0';

    version = (+(version.substr(0, 1)) + 1) + version.substr(1);

    const newNuspecContents = `<?xml version="1.0"?>
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
                <description>${github.repository.description}</description>
                <releaseNotes>No release notes available.</releaseNotes>
                <copyright>Copyright ${new Date().getFullYear()}</copyright>
                <tags>${github.repository.topics && github.repository.topics.join(', ')}</tags>
                <dependencies>
                    ${project.packageReferences
                        .map(x => `<dependency id="${x.name}" version="${x.version}" />`)
                        .join()}
                </dependencies>
            </metadata>
        </package>`;
    const newNuspecXml = await xml2js.parseStringPromise(newNuspecContents);

    if(existsSync(project.nuspecFilePath)) {
        const existingNuspecContents = readFileSync(project.nuspecFilePath).toString();
        const existingNuspecXml = await xml2js.parseStringPromise(existingNuspecContents);

        //TODO: merge
    }

    let nuspecPath = join(project.directoryPath, `${project.name}.nuspec`);
    console.log('generated nuspec', nuspecPath, newNuspecContents, JSON.stringify(newNuspecXml));

    writeFileSync(
        nuspecPath,
        newNuspecContents);
}

export default async function handleDotNet() {
    console.log('scanning for solutions');

    var solutionFiles = await globSearch("**/*.sln");
    console.log('solutions found', solutionFiles);

    for (let solutionFile of solutionFiles) {
        let projects = await SolutionFileParser.getProjects(solutionFile);
        console.log('projects detected', solutionFile, projects);

        let testProjects = projects.filter(x => x.isTestProject);
        for(let project of testProjects) {
            await dotnetBuild(project.csprojFilePath);
            await dotnetTest(project.csprojFilePath);
        }

        let nonTestProjects = projects.filter(x => !x.isTestProject);
        for(let project of nonTestProjects) {
            await generateNuspecFileForProject(project);

            await dotnetBuild(project.csprojFilePath);
            await dotnetPack(project);
        }

        for(let project of nonTestProjects)
            console.log('todo-push', project.directoryPath);
    }
}