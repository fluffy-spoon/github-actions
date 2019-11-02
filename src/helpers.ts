import { workspacePath } from "./environment";

import glob from 'glob';
import { join } from "path";

export async function globSearch(pattern: string) {
    return new Promise<string[]>((resolve, reject) => 
        glob(join(workspacePath, pattern), {}, (err, files) => {
            if(err)
                return reject(err);

            return resolve(files);
        }));
}