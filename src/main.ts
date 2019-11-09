import handleDotNet from "./dotnet";
import { fail } from "./helpers";

async function run() {
    await handleDotNet();
}

run();
export default run; 
