import xml2js from 'xml2js';
import fs from 'fs';

export type StringBoolean = 'true' | 'false';
export type TestSdkString = 'Microsoft.NET.Test.Sdk' | string;
export type SdkString =
    'Microsoft.NET.Sdk' |
    TestSdkString |
    string;

export interface ProjectFileXmlNode {
    Project: {
        $: {
            Sdk: SdkString
        },
        PropertyGroup: Array<{
            TargetFramework: ['netstandard2.0'],
            IsPackable: [StringBoolean]
        }>,
        ItemGroup: Array<{
            PackageReference: Array<{
                $: {
                    Include: SdkString | string,
                    Version: string
                }
            }>
        }>
    }
}

export interface PackageReference {
    name: SdkString | string;
    version: string;
}

export interface Project {
    xmlNode: ProjectFileXmlNode;
    isTestProject: boolean;
    packageReferences: PackageReference[];
}

export default class ProjectFileParser {
    static async readProject(filePath: string): Promise<Project> {
        let fileContents = fs.readFileSync(filePath);
        console.log('read project file', filePath, filePath);

        let xml: ProjectFileXmlNode = await xml2js.parseStringPromise(fileContents);
        console.log('parsed project file', filePath, JSON.stringify(xml));

        let knownTestSdkStrings = new Array<TestSdkString>();
        knownTestSdkStrings.push('Microsoft.NET.Test.Sdk');

        let packageReferences = new Array<PackageReference>();

        if(xml.Project.ItemGroup) {

            for (let itemGroupElement of xml.Project.ItemGroup) {
                if(!itemGroupElement.PackageReference)
                    continue;

                for (let packageReferenceElement of itemGroupElement.PackageReference) {
                    packageReferences.push({
                        name: packageReferenceElement.$.Include,
                        version: packageReferenceElement.$.Version
                    });
                }
            }

        }

        let isTestProject = packageReferences.findIndex(
            p => knownTestSdkStrings.indexOf(p.name) > -1) > -1;

        return {
            xmlNode: xml,
            isTestProject,
            packageReferences
        };
    }
}