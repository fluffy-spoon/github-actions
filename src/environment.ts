import {GitHub} from '@actions/github';
import core from '@actions/core';

enum KnownGitHubEnvironmentKey {
    WORKFLOW,
    ACTION,
    ACTOR,
    EVENT_NAME,
    EVENT_PATH,
    WORKSPACE,
    SHA,
    REF,
    HEAD_REF,
    BASE_REF,
    REPOSITORY
};

export type KnownGitHubEnvironmentKeyObject = {
    [property in keyof typeof KnownGitHubEnvironmentKey]: string;
}

export type GitHubContext = {
    client: GitHub,
    environment: KnownGitHubEnvironmentKeyObject,
    owner: string,
    repo: string,
    token: string
};

let cachedContextPromise: Promise<GitHubContext>;

export async function getGitHubContext(): Promise<GitHubContext> {
    if(cachedContextPromise)
        return cachedContextPromise;

    cachedContextPromise = new Promise<GitHubContext>(async () => {
        const token = core.getInput('gitHubKey');

        let environment: KnownGitHubEnvironmentKeyObject = {} as any;
        for(let key in KnownGitHubEnvironmentKey)
            environment[key] = core.getInput('GITHUB_' + key);

        let [owner, repo] = environment.REPOSITORY.split('/');

        return {
            client: new GitHub(token),
            environment,
            owner,
            repo,
            token
        };
    });

    return cachedContextPromise;
}