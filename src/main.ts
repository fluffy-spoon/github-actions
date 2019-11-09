import handleDotNet from "./dotnet";
import { fail, runProcess } from "./helpers";
import handleNodeJs from "./nodejs";
import { getGitHubContext } from "./environment";
import { ExecOptions } from "@actions/exec/lib/interfaces";
import { join } from "path";

async function gitCommand(cwd: string, args: string[]) {
    let github = await getGitHubContext();
    return await runProcess('/usr/bin/git', args, {
        cwd
    });
}

async function gitCheckout() {
    let github = await getGitHubContext();
    
    await gitCommand(
        github.environment.WORKSPACE, 
        ['clone', `https://${github.owner.login}:${github.token}@github.com/${github.owner.login}/${github.repository.name}.git`]);
    
    await gitCommand(
        join(github.environment.WORKSPACE, github.repository.name), 
        ['submodule', 'update', '--init', '--recursive']);
}

async function run() {
    await gitCheckout();

    await handleNodeJs();
    await handleDotNet();
}

run().catch(fail);
export default run; 

