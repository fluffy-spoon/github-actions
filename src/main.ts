import handleDotNet from "./dotnet";
import { fail } from "./helpers";

async function run() {
    await handleDotNet();
}

run().catch((e) => Promise.reject(fail(e && e.toString())));
export default run; 
