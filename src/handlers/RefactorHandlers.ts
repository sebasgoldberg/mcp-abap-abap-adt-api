import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient, Range, ExtractMethodProposal, GenericRefactoring } from 'abap-adt-api';

export class RefactorHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'extractMethodEvaluate',
                description: 'Evaluates the feasibility of an extract method refactoring operation. This analyzes the selected code range to determine if it can be safely extracted into a separate method, identifying potential issues like variable dependencies, control flow problems, or semantic conflicts. Returns a proposal with analysis results and recommended method signature.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uri: {
                            type: 'string',
                            description: 'The URI of the ABAP object containing the code to extract. Examples: "/sap/bc/adt/oo/classes/zcl_customer_service", "/sap/bc/adt/programs/zsales_report". Use complete ADT object URIs.'
                        },
                        range: {
                            type: 'string',
                            description: 'The range specification defining the code block to extract. Format: "startLine:startColumn-endLine:endColumn". Examples: "15:5-25:10", "100:1-150:45". Use zero-based line/column indexing.'
                        }
                    },
                    required: ['uri', 'range']
                }
            },
            {
                name: 'extractMethodPreview',
                description: 'Previews the changes that will be made by an extract method refactoring. Shows the original code, the extracted method, and the method call that will replace the original code. This allows you to review the refactoring before applying it, ensuring the changes are correct and desirable.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        proposal: {
                            type: 'string',
                            description: 'The extract method proposal object returned by extractMethodEvaluate. This contains the analysis results, proposed method signature, and refactoring parameters needed to generate the preview.'
                        }
                    },
                    required: ['proposal']
                }
            },
            {
                name: 'extractMethodExecute',
                description: 'Executes the extract method refactoring, applying the changes to the source code. This creates a new method with the extracted code and replaces the original code with a method call. The operation is atomic - either all changes are applied successfully or none are applied.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        refactoring: {
                            type: 'string',
                            description: 'The refactoring object containing the finalized parameters for the extract method operation. This should be obtained from the preview step and may include user modifications to the proposed method name or signature.'
                        }
                    },
                    required: ['refactoring']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'extractMethodEvaluate':
                return this.handleExtractMethodEvaluate(args);
            case 'extractMethodPreview':
                return this.handleExtractMethodPreview(args);
            case 'extractMethodExecute':
                return this.handleExtractMethodExecute(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown refactor tool: ${toolName}`);
        }
    }

    async handleExtractMethodEvaluate(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.extractMethodEvaluate(args.uri, args.range);
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
                `Failed to evaluate extract method: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleExtractMethodPreview(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.extractMethodPreview(args.proposal);
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
                `Failed to preview extract method: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleExtractMethodExecute(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.extractMethodExecute(args.refactoring);
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
                `Failed to execute extract method: ${error.message || 'Unknown error'}`
            );
        }
    }
}
