"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('solution-file-parser.ts');
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const project_file_parser_1 = __importDefault(require("./project-file-parser"));
class SolutionFileParser {
    static async getProjects(solutionFile) {
        let guidRegex = `\\{[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}\\}`;
        let projectLineRegex = new RegExp(`Project\\(\"${guidRegex}\"\\) = \"(.+)\", \"(.+)\", \"${guidRegex}\"`);
        let lines = fs_1.default
            .readFileSync(solutionFile)
            .toString()
            .replace('\r', '')
            .split('\n');
        let projects = new Array();
        for (let line of lines) {
            let match = projectLineRegex.exec(line);
            if (!match || match.length < 3)
                continue;
            console.log('detected project from solution file', solutionFile, match);
            let projectFilePath = path_1.join(path_1.dirname(solutionFile), match[2]).replace(/\\/g, path_1.sep);
            projects.push(await project_file_parser_1.default.readProject(projectFilePath));
        }
        return projects;
    }
}
exports.default = SolutionFileParser;
