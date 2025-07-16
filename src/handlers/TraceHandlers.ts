import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient, TraceStatementOptions, TraceParameters, TracesCreationConfig } from 'abap-adt-api';

export class TraceHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'tracesList',
                description: 'Retrieves a list of available traces in the SAP system. Traces are used for performance analysis, debugging, and monitoring ABAP program execution. This returns information about existing traces including their status, creation time, and associated programs.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'string',
                            description: 'Filter traces by a specific user. Leave empty to get traces for all users (if authorized). Examples: "DEVELOPER", "JOHN.DOE".',
                            optional: true
                        }
                    }
                }
            },
            {
                name: 'tracesListRequests',
                description: 'Retrieves a list of trace requests that have been submitted to the system. Trace requests are pending or scheduled traces that may not have been executed yet. This helps monitor the trace queue and understand trace processing status.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'string',
                            description: 'Filter trace requests by a specific user. Leave empty to get requests for all users (if authorized). Examples: "DEVELOPER", "JOHN.DOE".',
                            optional: true
                        }
                    }
                }
            },
            {
                name: 'tracesHitList',
                description: 'Retrieves the hit list for a specific trace, showing which ABAP statements or programs were executed during the trace. This provides a summary of trace results including execution counts, timing information, and program flow analysis.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'The unique identifier of the trace to get hit list for. This ID is obtained from tracesList or trace creation operations.'
                        },
                        withSystemEvents: {
                            type: 'boolean',
                            description: 'Whether to include system events in the hit list. Set to true to get detailed system-level information including database operations and system calls.',
                            optional: true
                        }
                    },
                    required: ['id']
                }
            },
            {
                name: 'tracesDbAccess',
                description: 'Retrieves database access information for a specific trace. This shows all database operations performed during the trace including SQL statements, table access patterns, and performance metrics. Essential for database performance analysis.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'The unique identifier of the trace to get database access information for. This ID is obtained from tracesList or trace creation operations.'
                        },
                        withSystemEvents: {
                            type: 'boolean',
                            description: 'Whether to include system events in the database access report. Set to true to get comprehensive database interaction details.',
                            optional: true
                        }
                    },
                    required: ['id']
                }
            },
            {
                name: 'tracesStatements',
                description: 'Retrieves detailed statement information for a specific trace. This provides comprehensive information about individual ABAP statements executed during the trace including execution times, parameters, and context information.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'The unique identifier of the trace to get statements for. This ID is obtained from tracesList or trace creation operations.'
                        },
                        options: {
                            type: 'string',
                            description: 'Additional options for retrieving statements. This can include formatting options, filtering criteria, or aggregation settings. Use JSON format for complex options.',
                            optional: true
                        }
                    },
                    required: ['id']
                }
            },
            {
                name: 'tracesSetParameters',
                description: 'Sets global trace parameters that control how traces are collected and processed. These parameters affect trace behavior including collection scope, performance settings, and data retention policies.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        parameters: {
                            type: 'string',
                            description: 'The trace parameters as a JSON string. This should include settings like trace level, collection scope, performance thresholds, and retention settings. Example: \'{"level": "HIGH", "scope": "ALL", "retention": "7_DAYS"}\'.'
                        }
                    },
                    required: ['parameters']
                }
            },
            {
                name: 'tracesCreateConfiguration',
                description: 'Creates a new trace configuration that defines how traces should be collected for specific programs or scenarios. Trace configurations can be reused and shared across different trace sessions.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        config: {
                            type: 'string',
                            description: 'The trace configuration as a JSON string. This should include configuration name, target programs, collection settings, and filters. Example: \'{"name": "DB_TRACE_CONFIG", "programs": ["ZSALES*"], "collect_db": true, "collect_performance": true}\'.'
                        }
                    },
                    required: ['config']
                }
            },
            {
                name: 'tracesDeleteConfiguration',
                description: 'Deletes an existing trace configuration. This removes the configuration from the system and makes it unavailable for future trace sessions. Use with caution as this operation cannot be undone.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'The unique identifier of the trace configuration to delete. This ID is obtained from configuration creation or listing operations.'
                        }
                    },
                    required: ['id']
                }
            },
            {
                name: 'tracesDelete',
                description: 'Deletes a specific trace and all its associated data. This permanently removes the trace results from the system including hit lists, database access information, and statement details. Use with caution as this operation cannot be undone.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'The unique identifier of the trace to delete. This ID is obtained from tracesList or trace creation operations.'
                        }
                    },
                    required: ['id']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'tracesList':
                return this.handleTracesList(args);
            case 'tracesListRequests':
                return this.handleTracesListRequests(args);
            case 'tracesHitList':
                return this.handleTracesHitList(args);
            case 'tracesDbAccess':
                return this.handleTracesDbAccess(args);
            case 'tracesStatements':
                return this.handleTracesStatements(args);
            case 'tracesSetParameters':
                return this.handleTracesSetParameters(args);
            case 'tracesCreateConfiguration':
                return this.handleTracesCreateConfiguration(args);
            case 'tracesDeleteConfiguration':
                return this.handleTracesDeleteConfiguration(args);
            case 'tracesDelete':
                return this.handleTracesDelete(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown trace tool: ${toolName}`);
        }
    }

    async handleTracesList(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const traces = await this.adtclient.tracesList(args.user);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            traces
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get traces list: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleTracesListRequests(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const requests = await this.adtclient.tracesListRequests(args.user);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            requests
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get trace requests: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleTracesHitList(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const hitList = await this.adtclient.tracesHitList(args.id, args.withSystemEvents);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            hitList
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get trace hit list: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleTracesDbAccess(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const dbAccess = await this.adtclient.tracesDbAccess(args.id, args.withSystemEvents);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            dbAccess
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get trace DB access: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleTracesStatements(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const statements = await this.adtclient.tracesStatements(args.id, args.options);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            statements
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get trace statements: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleTracesSetParameters(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.tracesSetParameters(args.parameters);
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
                `Failed to set trace parameters: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleTracesCreateConfiguration(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.tracesCreateConfiguration(args.config);
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
                `Failed to create trace configuration: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleTracesDeleteConfiguration(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.tracesDeleteConfiguration(args.id);
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
                `Failed to delete trace configuration: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleTracesDelete(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.tracesDelete(args.id);
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
                `Failed to delete trace: ${error.message || 'Unknown error'}`
            );
        }
    }
}
