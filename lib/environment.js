"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('environment.ts');
const github_1 = require("@actions/github");
const core_1 = require("@actions/core");
var KnownGitHubEnvironmentKey;
(function (KnownGitHubEnvironmentKey) {
    KnownGitHubEnvironmentKey[KnownGitHubEnvironmentKey["WORKFLOW"] = 0] = "WORKFLOW";
    KnownGitHubEnvironmentKey[KnownGitHubEnvironmentKey["ACTION"] = 1] = "ACTION";
    KnownGitHubEnvironmentKey[KnownGitHubEnvironmentKey["ACTOR"] = 2] = "ACTOR";
    KnownGitHubEnvironmentKey[KnownGitHubEnvironmentKey["EVENT_NAME"] = 3] = "EVENT_NAME";
    KnownGitHubEnvironmentKey[KnownGitHubEnvironmentKey["EVENT_PATH"] = 4] = "EVENT_PATH";
    KnownGitHubEnvironmentKey[KnownGitHubEnvironmentKey["WORKSPACE"] = 5] = "WORKSPACE";
    KnownGitHubEnvironmentKey[KnownGitHubEnvironmentKey["SHA"] = 6] = "SHA";
    KnownGitHubEnvironmentKey[KnownGitHubEnvironmentKey["REF"] = 7] = "REF";
    KnownGitHubEnvironmentKey[KnownGitHubEnvironmentKey["HEAD_REF"] = 8] = "HEAD_REF";
    KnownGitHubEnvironmentKey[KnownGitHubEnvironmentKey["BASE_REF"] = 9] = "BASE_REF";
    KnownGitHubEnvironmentKey[KnownGitHubEnvironmentKey["REPOSITORY"] = 10] = "REPOSITORY";
})(KnownGitHubEnvironmentKey || (KnownGitHubEnvironmentKey = {}));
;
let cachedContextPromise;
async function getGitHubContext() {
    if (cachedContextPromise)
        return await cachedContextPromise;
    cachedContextPromise = new Promise(async (resolve) => {
        const token = core_1.getInput('gitHubToken');
        let environment = {};
        for (let key in KnownGitHubEnvironmentKey) {
            if (!isNaN(+key))
                continue;
            let value = process.env['GITHUB_' + key];
            if (!value)
                continue;
            environment[key] = value;
        }
        let [owner, repo] = environment.REPOSITORY.split('/');
        let client = new github_1.GitHub(token);
        let userResponse = await client.users.getByUsername({
            username: owner
        });
        let repositoryResponse = await client.repos.get({
            owner,
            repo
        });
        let latestReleaseResponse = await client.repos.getLatestRelease({
            owner,
            repo
        }).catch(() => null);
        let context = {
            client,
            repository: repositoryResponse.data,
            owner: userResponse.data,
            latestRelease: latestReleaseResponse && latestReleaseResponse.data,
            environment,
            token,
            shouldPublish: !!token
        };
        resolve(context);
    });
    return await cachedContextPromise;
}
exports.getGitHubContext = getGitHubContext;
