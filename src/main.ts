import handleDotNet from "./dotnet";
import { fail } from "./helpers";

async function run() {
    await handleDotNet();
}

run().catch(fail);
export default run; 
