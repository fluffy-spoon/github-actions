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

    await gitCommand(['clone', `https://${github.owner.login}:${github.token}@github.com/${github.owner.login}/${github.repository.name}.git`]);

    // await gitCommand(['init', github.environment.WORKSPACE]);
    // await gitCommand(['remote', 'add', 'origin', github.repository.html_url]);
    // await gitCommand(['config', 'gc.auto', '0']);
    // await gitCommand(['-c', 'http.extraheader="AUTHORIZATION: basic ' + github.token + '"', 'fetch', '--tags', '--prune', '--progress', '--no-recurse-submodules', 'origin', '+refs/heads/*:refs/remotes/origin/*']);
    // await gitCommand(['checkout', '--progress', '--force', github.environment.SHA]);
}

async function run() {
    await gitCheckout();

    await handleNodeJs();
    await handleDotNet();
}

run().catch(fail);
export default run; 

