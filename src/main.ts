import handleDotNet from "./dotnet";
import { fail, runProcess } from "./helpers";
import handleNodeJs from "./nodejs";
import { getGitHubContext } from "./environment";
import { ExecOptions } from "@actions/exec/lib/interfaces";

async function gitCommand(args: string[]) {
    let github = await getGitHubContext();
    return await runProcess('/usr/bin/git', args, {
        cwd: github.environment.WORKSPACE
    });
}

async function gitCheckout() {
    let github = await getGitHubContext();
    await gitCommand(['clone', '--recurse-submodules', `https://${github.owner.login}:${github.token}@github.com/${github.owner.login}/${github.repository.name}.git`]);
}

async function run() {
    await gitCheckout();

    await handleNodeJs();
    await handleDotNet();
}

run().catch(fail);
export default run; 

