import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient } from "abap-adt-api";

export class FeedHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'feeds',
                description: 'Retrieves a list of system feeds and notifications from the SAP system. This includes system messages, alerts, and various feed sources that provide real-time information about system status, events, and notifications. Useful for monitoring system health and getting updates about system activities.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'dumps',
                description: 'Retrieves a list of ABAP runtime dumps (short dumps) from the SAP system. Short dumps contain detailed information about runtime errors, including error messages, call stack, variable values, and system state at the time of the error. Essential for debugging runtime issues and understanding error patterns in the system.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'An optional query string to filter the dumps. Can be used to search for specific dump types, error messages, or programs. Examples: "ABAP_EXCEPTION", "ZSALES_REPORT", "RUNTIME_ERROR_*". Leave empty to get all recent dumps.',
                            optional: true
                        }
                    }
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'feeds':
                return this.handleFeeds(args);
            case 'dumps':
                return this.handleDumps(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown feed tool: ${toolName}`);
        }
    }

    async handleFeeds(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const feeds = await this.adtclient.feeds();
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            feeds
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get feeds: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDumps(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const dumps = await this.adtclient.dumps(args.query);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            dumps
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get dumps: ${error.message || 'Unknown error'}`
            );
        }
    }
}
