import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient } from "abap-adt-api";

export class ObjectHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'objectStructure',
                description: 'Get object structure details including links and includes information. Returns main include path and class includes (definitions, implementations, testclasses) for class objects. Example: objectStructure("/sap/bc/adt/oo/classes/zcl_example") returns structure with links array and includes for classes.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        objectUrl: {
                            type: 'string',
                            description: 'URL of the object. Examples: "/sap/bc/adt/oo/classes/zcl_example", "/sap/bc/adt/programs/programs/zprogram", "/sap/bc/adt/functions/groups/zfuncgroup"'
                        },
                        version: {
                            type: 'string',
                            description: 'Version of the object (optional). Used for version-specific structure queries.',
                            optional: true
                        }
                    },
                    required: ['objectUrl']
                }
            },
            {
                name: 'searchObject',
                description: 'Search for ABAP objects in the system. Returns array with object details including adtcore:name, adtcore:type, adtcore:description, and adtcore:uri. Example: searchObject("ZABAP*", "PROG/P") finds all programs starting with ZABAP.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query string. Supports wildcards (*). Examples: "ZABAP*", "ZCL_*", "ZTEST_CLASS"'
                        },
                        objType: {
                            type: 'string',
                            description: 'Object type filter to restrict search. Examples: "PROG/P" (programs), "CLAS/OC" (classes), "INTF/OI" (interfaces), "FUGR/F" (function groups). Leave empty to search all types.',
                            optional: true
                        },
                        max: {
                            type: 'number',
                            description: 'Maximum number of results to return. Default is system limit. Example: 10 for first 10 results.',
                            optional: true
                        }
                    },
                    required: ['query']
                }
            },
            {
                name: 'findObjectPath',
                description: 'Find the complete hierarchical path of an object in the package tree. Returns array with parent packages from root to object. Example: findObjectPath("/sap/bc/adt/programs/programs/ztest") returns path like [$TMP, ZPACKAGE, ZTEST].',
                inputSchema: {
                    type: 'object',
                    properties: {
                        objectUrl: {
                            type: 'string',
                            description: 'URL of the object to find path for. Examples: "/sap/bc/adt/programs/programs/ztest", "/sap/bc/adt/oo/classes/zcl_example"'
                        }
                    },
                    required: ['objectUrl']
                }
            },
            {
                name: 'objectTypes',
                description: 'Retrieves all available object types in the system. Returns array with type definitions including internal type codes and names. Example: returns types like {"type": "PROG/P", "name": "PROG"} for programs.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'reentranceTicket',
                description: 'Retrieves a reentrance ticket for SSO authentication. Returns base64-encoded ticket that can be used for system re-entry. Used for SSO scenarios and external system integration.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'objectStructure':
                return this.handleObjectStructure(args);
            case 'findObjectPath':
                return this.handleFindObjectPath(args);
            case 'searchObject':
                return this.handleSearchObject(args);
            case 'objectTypes':
                return this.handleObjectTypes(args);
            case 'reentranceTicket':
                return this.handleReentranceTicket(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown object tool: ${toolName}`);
        }
    }

    async handleObjectStructure(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const structure = await this.adtclient.objectStructure(args.objectUrl, args.version);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            structure,
                            message: 'Object structure retrieved successfully'
                        }, null, 2)
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            const errorMessage = error.message || 'Unknown error';
            const detailedError = error.response?.data?.message || errorMessage;
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get object structure: ${detailedError}`
            );
        }
    }

    async handleFindObjectPath(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const path = await this.adtclient.findObjectPath(args.objectUrl);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            path,
                            message: 'Object path found successfully'
                        }, null, 2)
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            const errorMessage = error.message || 'Unknown error';
            const detailedError = error.response?.data?.message || errorMessage;
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to find object path: ${detailedError}`
            );
        }
    }

    async handleSearchObject(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const results = await this.adtclient.searchObject(
                args.query,
                args.objType,
                args.max
            );
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            results,
                            message: 'Object search completed successfully'
                        }, null, 2)
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            const errorMessage = error.message || 'Unknown error';
            const detailedError = error.response?.data?.message || errorMessage;
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to search objects: ${detailedError}`
            );
        }
    }

    async handleObjectTypes(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const types = await this.adtclient.objectTypes();
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            types,
                            message: 'Object types retrieved successfully'
                        }, null, 2)
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            const errorMessage = error.message || 'Unknown error';
            const detailedError = error.response?.data?.message || errorMessage;
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get object types: ${detailedError}`
            );
        }
    }

    async handleReentranceTicket(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const ticket = await this.adtclient.reentranceTicket();
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            ticket,
                            message: 'Reentrance ticket retrieved successfully'
                        }, null, 2)
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            const errorMessage = error.message || 'Unknown error';
            const detailedError = error.response?.data?.message || errorMessage;
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get reentrance ticket: ${detailedError}`
            );
        }
    }
}
