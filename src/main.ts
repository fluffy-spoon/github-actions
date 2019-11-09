import handleDotNet from "./dotnet";
import { fail, runProcess } from "./helpers";
import handleNodeJs from "./nodejs";
import { getGitHubContext } from "./environment";
import { ExecOptions } from "@actions/exec/lib/interfaces";

async function gitCommand(args: string[]) {
    let github = await getGitHubContext();
    return await runProcess('git', args, {
        cwd: github.environment.WORKSPACE
    });
}

async function gitCheckout() {
    let github = await getGitHubContext();

    await gitCommand(['init']);
    await gitCommand(['remote', 'add', 'origin', github.repository.git_url]);
    await gitCommand(['config', 'gc.auto', '0']);
    await gitCommand(['fetch', '--tags', '--prune', 'origin', '+refs/heads/*:refs/remotes/origin/*']);
    await gitCommand(['checkout', '--progress', '--force', github.environment.SHA]);
}

async function run() {
    await gitCheckout();

    await handleNodeJs();
    await handleDotNet();
}

run().catch(fail);
export default run; 

