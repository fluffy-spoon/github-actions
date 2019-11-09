import {GitHub} from '@actions/github';
import core from '@actions/core';
import { ReposGetResponse, UsersGetByUsernameResponse, ReposListCommitsResponseItem, ReposGetLatestReleaseResponse } from '@octokit/rest';

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
    repository: ReposGetResponse,
    owner: UsersGetByUsernameResponse,
    latestRelease: ReposGetLatestReleaseResponse,
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

        let client = new GitHub(token);

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
        });

        return {
            client,
            repository: repositoryResponse.data,
            owner: userResponse.data,
            latestRelease: latestReleaseResponse.data,
            environment,
            token
        } as GitHubContext;
    });

    return cachedContextPromise;
}