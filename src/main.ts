import handleDotNet from "./dotnet";

async function run() {
    await handleDotNet();
}

run().catch(console.error);
export default run; 
