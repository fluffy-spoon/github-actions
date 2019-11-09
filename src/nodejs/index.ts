import { logDebug, globSearch, runProcess } from "../helpers";
import PackageJsonParser, { NodeJsPackage } from "./package-json-parser";

async function npmCommand(project: NodeJsPackage, command: string) {
    logDebug('running command', command, project);

    await runProcess("npm", [command], {
        cwd: project.directoryPath
    });
}

async function npmPublish(project: NodeJsPackage) {
    
}

export default async function handleNodeJs() {
    logDebug('scanning for nodejs projects');

    var packageJsFiles = await globSearch("**/package.json", ["**/node_modules/**"]);
    logDebug('nodejs projects found', packageJsFiles);

    packageJsFiles = packageJsFiles
        .sort((a, b) => b.length - a.length)
        .filter(x => !!packageJsFiles.find(y => y === x || y.indexOf(x) > -1));

    logDebug('nodejs projects filtered', packageJsFiles);

    for (let packageJsFile of packageJsFiles) {
        let project = PackageJsonParser.readPackage(packageJsFile);
        logDebug('project detected', packageJsFile, project);

        if(project.hasBuildCommand)
            await npmCommand(project, 'build');

        if(project.hasTestCommand)
            await npmCommand(project, 'test');

        await npmPublish(project);
    }
}