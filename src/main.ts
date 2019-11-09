import handleDotNet from "./dotnet";
import { fail, runProcess } from "./helpers";
import handleNodeJs from "./nodejs";
import { getGitHubContext } from "./environment";

async function run() {
    let github = await getGitHubContext();

    await runProcess('git', ['fetch'], {
        cwd: github.environment.WORKSPACE
    });
    await runProcess('git', ['pull'], {
        cwd: github.environment.WORKSPACE
    });

    await handleNodeJs();
    await handleDotNet();
}

run().catch(fail);
export default run; 
