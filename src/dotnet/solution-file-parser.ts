import fs from 'fs';
import { dirname, join } from 'path';

export interface ProjectFile {
    filePath: string;
    name: string;
}

export default class SolutionFileParser {
    static getProjects(solutionFile: string) {
        let guidRegex = `\\{[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}\\}`;
        let projectLineRegex = new RegExp(`Project\\(\"${guidRegex}\"\\) = \"(.+)\", \"(.+)\", \"${guidRegex}\"`);

        let lines = fs
            .readFileSync(solutionFile)
            .toString()
            .replace('\r', '')
            .split('\n');

        let projects = new Array<ProjectFile>();

        for(let line of lines) {
            let match = projectLineRegex.exec(line);
            if(!match || match.length < 3)
                continue;

            projects.push({
                filePath: join(
                    dirname(solutionFile),
                    match[2]),
                name: match[1]
            });
        }

        return projects;
    }
}