import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient, PackageValueHelpType } from 'abap-adt-api';

export class DdicHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'annotationDefinitions',
                description: 'Retrieves annotation definitions used in CDS views and other ABAP objects. Returns a list of available annotations with their definitions, parameters, and usage contexts. This is useful for understanding the annotation framework and building CDS views with proper annotations.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'ddicElement',
                description: 'Retrieves detailed information about a DDIC (ABAP Dictionary) element such as tables, views, structures, data elements, domains, and types. Returns comprehensive metadata including field definitions, data types, constraints, associations, and relationships. Essential for understanding database structures and building type-safe ABAP code.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'The path to the DDIC element. Examples: "/sap/bc/adt/ddic/tables/mara", "/sap/bc/adt/ddic/structures/bapiret2", "/sap/bc/adt/ddic/dataelements/matnr". Use searchObject to find the correct path.'
                        },
                        getTargetForAssociation: {
                            type: 'boolean',
                            description: 'Whether to retrieve target information for associations in CDS views. Set to true when analyzing CDS associations and their target entities.',
                            optional: true
                        },
                        getExtensionViews: {
                            type: 'boolean',
                            description: 'Whether to retrieve extension views information. Set to true when working with extensible CDS views to understand available extension points.',
                            optional: true
                        },
                        getSecondaryObjects: {
                            type: 'boolean',
                            description: 'Whether to retrieve secondary objects related to the main DDIC element. Set to true to get complete dependency information.',
                            optional: true
                        }
                    },
                    required: ['path']
                }
            },
            {
                name: 'ddicRepositoryAccess',
                description: 'Accesses the DDIC repository to retrieve basic information about a DDIC element. This is a lighter version of ddicElement that returns essential metadata without extended details. Use this when you need quick access to DDIC element information without full relationship data.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'The path to the DDIC element. Examples: "/sap/bc/adt/ddic/tables/vbak", "/sap/bc/adt/ddic/views/dd03l". Use searchObject to find the correct path.'
                        }
                    },
                    required: ['path']
                }
            },
            {
                name: 'packageSearchHelp',
                description: 'Performs a search help for packages in the SAP system. Returns a list of packages matching the search criteria, useful for finding development packages, understanding package hierarchies, and organizing ABAP objects. Essential for transport management and development structure analysis.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            description: 'The package value help type. Common values include "DEVCLASS" for development classes, "PACKAGE" for packages. This determines the scope and type of package search to perform.'
                        },
                        name: {
                            type: 'string',
                            description: 'The package name pattern to search for. Supports wildcards (*). Examples: "Z*", "ZFIN*", "ZTEST". Leave empty to get all packages of the specified type.',
                            optional: true
                        }
                    },
                    required: ['type']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'annotationDefinitions':
                return this.handleAnnotationDefinitions(args);
            case 'ddicElement':
                return this.handleDdicElement(args);
            case 'ddicRepositoryAccess':
                return this.handleDdicRepositoryAccess(args);
            case 'packageSearchHelp':
                return this.handlePackageSearchHelp(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown DDIC tool: ${toolName}`);
        }
    }

    async handleAnnotationDefinitions(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.annotationDefinitions();
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            result
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get annotation definitions: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDdicElement(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.ddicElement(
                args.path,
                args.getTargetForAssociation,
                args.getExtensionViews,
                args.getSecondaryObjects
            );
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            result
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get DDIC element: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDdicRepositoryAccess(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.ddicRepositoryAccess(args.path);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            result
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to access DDIC repository: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handlePackageSearchHelp(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.packageSearchHelp(args.type, args.name);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            result
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get package search help: ${error.message || 'Unknown error'}`
            );
        }
    }
}
