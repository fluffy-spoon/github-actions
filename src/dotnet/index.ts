import path, { join, basename, extname } from 'path';

import { exec } from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces';

import { globSearch } from '../helpers';
import SolutionFileParser from './solution-file-parser';
import { getGitHubContext } from '../environment';

async function run(commandLine: string, args?: string[], options?: ExecOptions) {
    let result = await exec(commandLine, args, options);
    if(result !== 0)
        throw new Error('Process ' + commandLine + ' exited with non-zero exit code: ' + result);
}

async function compileSolutionFile(solutionFile: string) {
    console.log('building', solutionFile);
    await run("dotnet", ["build"], {
        cwd: path.dirname(solutionFile)
    });
}

async function testSolutionFile(solutionFile: string) {
    console.log('testing', solutionFile);
    await run("dotnet", ["test"], {
        cwd: path.dirname(solutionFile)
    });
}

async function packSolutionFile(solutionFile: string) {
    console.log('packing', solutionFile);

    let gitHub = await getGitHubContext();
    await run("dotnet", [
        "pack",
        "--output",
        __dirname,
        "--include-symbols",
        "-p:SymbolPackageFormat=snupkg",
        "-properties",
        `owners=${gitHub.owner};desc=`
    ], {
        cwd: path.dirname(solutionFile)
    });
}

async function pushNuGetPackage(nuGetFile: string) {
    console.log('adding package source', nuGetFile);
    
    let gitHub = await getGitHubContext();
    await run("dotnet", [
        "nuget",
        "sources",
        "add",
        "-Name",
        "GPR",
        "-Source",
        `https://nuget.pkg.github.com/${gitHub.owner}/index.json`,
        "-UserName",
        gitHub.owner,
        "-Password",
        gitHub.token
    ], {
        cwd: path.dirname(nuGetFile)
    });
    
    console.log('publishing package', nuGetFile);

    await run("dotnet", [
        "nuget",
        "push",
        nuGetFile,
        "-Source",
        "GPR"
    ], {
        cwd: path.dirname(nuGetFile)
    });
}

export default async function handleDotNet() {
    var solutionFiles = await globSearch("**/*.sln");
    for (let solutionFile of solutionFiles) {
        let projectFiles = await SolutionFileParser.getProjects(solutionFile);
        console.log('projects detected', solutionFile, projectFiles);

        await compileSolutionFile(solutionFile);
        await testSolutionFile(solutionFile);
        await packSolutionFile(solutionFile);

        let nugetFiles = await globSearch(join(__dirname, '*.nupkg'));
        for(let nugetFile of nugetFiles) {
            let fileName = basename(nugetFile, extname(nugetFile));

            let matchingProject = projectFiles.find(x => x.name === fileName);
            if(!matchingProject)
                throw new Error('Could not find a project called ' + fileName + ' in the solution, inferred from the .nupkg file.');

            if(matchingProject.isTestProject)
                continue;

            await pushNuGetPackage(nugetFile);
        }
    }
}