import path from 'path';

import { exec } from '@actions/exec';
import { globSearch } from '../helpers';
import SolutionFileParser from './solution-file-parser';

async function compileSolutionFile(solutionFile: string) {
    console.log('building', solutionFile);
    await exec("dotnet", ["build"], {
        cwd: path.dirname(solutionFile)
    });
}

async function testSolutionFile(solutionFile: string) {
    console.log('testing', solutionFile);
    await exec("dotnet", ["test"], {
        cwd: path.dirname(solutionFile)
    });
}

async function packSolutionFile(solutionFile: string) {
    console.log('packing', solutionFile);
    await exec("dotnet", [
        "pack",
        "--output",
        __dirname,
        "--include-symbols",
        "p:SymbolPackageFormat=snupkg"
    ], {
        cwd: path.dirname(solutionFile)
    });
}

export default async function handleDotNet() {
    var solutionFiles = await globSearch("**/*.sln");
    for (let solutionFile of solutionFiles) {
        let projectFiles = await SolutionFileParser.getProjects(solutionFile);
        console.log('projects detected', solutionFile, JSON.stringify(projectFiles));

        await compileSolutionFile(solutionFile);
        await testSolutionFile(solutionFile);
        await packSolutionFile(solutionFile);
    }
}