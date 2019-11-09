import xml2js from 'xml2js';
import fs from 'fs';

export interface Project {

}

export default class ProjectFileParser {
    static async readProject(filePath: string) {
        var fileContents = fs.readFileSync(filePath);
        console.log('read project file', filePath, filePath);

        var xml = await xml2js.parseStringPromise(fileContents);
        console.log('parsed project file', filePath, xml);

        return {} as Project;
    }
}