import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient } from 'abap-adt-api';

export class ClassHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'classIncludes',
                description: 'Get class includes structure with include types and URLs. Returns Map with include types (definitions, implementations, testclasses) and their corresponding URLs. Used to navigate class structure and access specific includes. Example: classIncludes("ZAPIADT_TESTCASE_CLASS1") returns includes map.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        clas: {
                            type: 'string',
                            description: 'The class name (without CL_ prefix). Examples: "ZAPIADT_TESTCASE_CLASS1", "ZCL_EXAMPLE" (use "ZCL_EXAMPLE", not "CL_ZCL_EXAMPLE")'
                        }
                    },
                    required: ['clas']
                }
            },
            {
                name: 'classComponents',
                description: 'List class components including methods, attributes, types, and events. Returns detailed structure with component names, types, visibility, and navigation links. Use this to explore class structure and find specific components. Example: classComponents("/sap/bc/adt/oo/classes/zapiadt_testcase_class1") returns all class components.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The URL of the class (without /source/main suffix). Examples: "/sap/bc/adt/oo/classes/zapiadt_testcase_class1", "/sap/bc/adt/oo/classes/zcl_example"'
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'createTestInclude',
                description: 'Create test include for class if it does not exist. Creates the testclasses include and initializes it with basic test class structure. REQUIRES class to be locked first. Returns success status. Use this to add unit tests to existing classes.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        clas: {
                            type: 'string',
                            description: 'The class name (without CL_ prefix). Examples: "ZAPIADT_TESTCASE_CLASS1", "ZCL_EXAMPLE"'
                        },
                        lockHandle: {
                            type: 'string',
                            description: 'The lock handle from lock operation. Class must be locked before creating test include.'
                        },
                        transport: {
                            type: 'string',
                            description: 'The transport request number. Required for transportable classes. Format: "SYSTEMK123456"',
                            optional: true
                        }
                    },
                    required: ['clas', 'lockHandle']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'classIncludes':
                return this.handleClassIncludes(args);
            case 'classComponents':
                return this.handleClassComponents(args);
            case 'createTestInclude':
                return this.handleCreateTestInclude(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown class tool: ${toolName}`);
        }
    }

    async handleClassIncludes(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await ADTClient.classIncludes(args.clas);
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
                `Failed to get class includes: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleClassComponents(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.classComponents(args.url);
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
                `Failed to get class components: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleCreateTestInclude(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.createTestInclude(
                args.clas,
                args.lockHandle,
                args.transport
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
                `Failed to create test include: ${error.message || 'Unknown error'}`
            );
        }
    }
}
