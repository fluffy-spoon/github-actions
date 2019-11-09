"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('project-file-parser.ts');
const xml2js_1 = __importDefault(require("xml2js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
;
class ProjectFileParser {
    static async readProject(filePath) {
        let fileContents = fs_1.default.readFileSync(filePath);
        console.log('read project file', filePath, filePath);
        let xml = await xml2js_1.default.parseStringPromise(fileContents);
        console.log('parsed project file', filePath, JSON.stringify(xml));
        let knownTestSdkStrings = new Array();
        knownTestSdkStrings.push('Microsoft.NET.Test.Sdk');
        let packageReferences = new Array();
        if (xml.Project.ItemGroup) {
            for (let itemGroupElement of xml.Project.ItemGroup) {
                if (!itemGroupElement.PackageReference)
                    continue;
                for (let packageReferenceElement of itemGroupElement.PackageReference) {
                    packageReferences.push({
                        name: packageReferenceElement.$.Include,
                        version: packageReferenceElement.$.Version
                    });
                }
            }
        }
        let properties = new Array();
        if (xml.Project.PropertyGroup) {
            for (let propertyGroupElement of xml.Project.PropertyGroup) {
                properties.push(propertyGroupElement);
            }
        }
        let isTestProject = packageReferences.findIndex(p => knownTestSdkStrings.indexOf(p.name) > -1) > -1;
        let directoryPath = path_1.dirname(filePath);
        let name = path_1.basename(filePath, path_1.extname(filePath));
        let nuspecFilePath = properties.map(p => p.NuspecFile).find(p => !!p) ||
            path_1.join(directoryPath, `${name}.nuspec`);
        return {
            xmlNode: xml,
            isTestProject,
            packageReferences,
            csprojFilePath: filePath,
            nuspecFilePath,
            name,
            directoryPath
        };
    }
}
exports.default = ProjectFileParser;
