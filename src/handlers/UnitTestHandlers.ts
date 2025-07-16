import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient, UnitTestRunFlags } from 'abap-adt-api';

export class UnitTestHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'unitTestRun',
                description: 'Runs unit tests for ABAP objects and returns test results with test classes, methods, and alerts. Returns array with test results including failures, alerts, and stack traces. Use this to validate code quality and functionality. Example: unitTestRun("/sap/bc/adt/programs/programs/zapiadtunitcases") returns test results with success/failure status.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The URL of the object to test. Can be program, class, or other testable objects. Examples: "/sap/bc/adt/programs/programs/zapiadtunitcases", "/sap/bc/adt/oo/classes/zcl_example/source/main"'
                        },
                        flags: {
                            type: 'string',
                            description: 'Flags for the unit test run. Optional test execution flags to control test behavior. Usually not needed for standard test runs.',
                            optional: true
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'unitTestEvaluation',
                description: 'Evaluates unit test results for a specific test class. Returns detailed information about test methods and their execution results. Use this to get detailed analysis of test class performance. Typically used after unitTestRun to get more details about specific test classes.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        clas: {
                            type: 'string',
                            description: 'The test class object to evaluate. Usually obtained from unitTestRun results. Should be a test class object with adtcore:name property.'
                        },
                        flags: {
                            type: 'string',
                            description: 'Flags for the unit test evaluation. Optional evaluation flags to control analysis behavior.',
                            optional: true
                        }
                    },
                    required: ['clas']
                }
            },
            {
                name: 'unitTestOccurrenceMarkers',
                description: 'Retrieves unit test occurrence markers for source code highlighting and navigation. Returns markers with location information for test coverage and debugging. Use this to show test execution points in source code. Helps identify which lines were executed during tests.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The URL of the test method or object. Usually obtained from test results navigation URIs. Examples: test method navigationUri from unitTestRun results'
                        },
                        source: {
                            type: 'string',
                            description: 'The source code of the test object. Complete source code where markers should be applied. Usually obtained from getObjectSource.'
                        }
                    },
                    required: ['url', 'source']
                }
            },
            {
                name: 'createTestInclude',
                description: 'Creates a test include for a class if it does not exist. Initializes the testclasses include with basic test class structure and framework setup. REQUIRES class to be locked first. Use this to add unit testing capability to existing classes.',
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
            case 'unitTestRun':
                return this.handleUnitTestRun(args);
            case 'unitTestEvaluation':
                return this.handleUnitTestEvaluation(args);
            case 'unitTestOccurrenceMarkers':
                return this.handleUnitTestOccurrenceMarkers(args);
            case 'createTestInclude':
                return this.handleCreateTestInclude(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown unit test tool: ${toolName}`);
        }
    }

    async handleUnitTestRun(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.unitTestRun(args.url, args.flags);
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
                `Failed to run unit test: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleUnitTestEvaluation(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.unitTestEvaluation(args.clas, args.flags);
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
                `Failed to evaluate unit test: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleUnitTestOccurrenceMarkers(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const markers = await this.adtclient.unitTestOccurrenceMarkers(args.url, args.source);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            markers
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get unit test markers: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleCreateTestInclude(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.createTestInclude(args.clas, args.lockHandle, args.transport);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            result,
                            message: 'Test include created successfully'
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
