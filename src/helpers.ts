import glob from 'glob';
import { join } from "path";
import { getGitHubContext } from './environment';

export async function globSearch(pattern: string) {
    let context = await getGitHubContext();
    return new Promise<string[]>((resolve, reject) => 
        glob(join(context.environment.WORKSPACE, pattern), {}, (err, files) => {
            if(err)
                return reject(err);

            return resolve(files);
        }));
}