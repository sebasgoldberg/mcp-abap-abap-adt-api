import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { AbapObjectStructure, classIncludes } from 'abap-adt-api';

export class RevisionHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'revisions',
                description: 'Retrieves the revision history for an ABAP object. This returns a chronological list of all changes made to the object including timestamps, author information, change descriptions, and version details. Essential for understanding object evolution, tracking changes, and performing version comparisons. Can be used for audit trails and change analysis.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        objectUrl: {
                            type: 'string',
                            description: 'The URL of the ABAP object to get revisions for. Examples: "/sap/bc/adt/oo/classes/zcl_customer_api", "/sap/bc/adt/programs/zsales_report", "/sap/bc/adt/functions/groups/zfg_utilities". Use complete ADT object URLs.'
                        },
                        clsInclude: {
                            type: 'string',
                            description: 'For class objects, specify the class include to get revisions for a specific part of the class. Examples: "definitions", "implementations", "testclasses", "locals_def", "locals_imp". Leave empty to get revisions for the entire class.',
                            optional: true
                        }
                    },
                    required: ['objectUrl']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'revisions':
                return this.handleRevisions(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown revision tool: ${toolName}`);
        }
    }

    async handleRevisions(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const revisions = await this.adtclient.revisions(args.objectUrl, args.clsInclude);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            revisions
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get revisions: ${error.message || 'Unknown error'}`
            );
        }
    }
}
