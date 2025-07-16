import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient, RenameRefactoringProposal, RenameRefactoring } from 'abap-adt-api';

export class RenameHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'renameEvaluate',
                description: 'Evaluates the feasibility of a rename refactoring operation for a symbol at a specific location. This analyzes the selected symbol to determine if it can be safely renamed, identifying all references across the codebase and checking for potential conflicts or naming violations. Returns a proposal with the symbol information and impact analysis.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        uri: {
                            type: 'string',
                            description: 'The URI of the ABAP object containing the symbol to rename. Examples: "/sap/bc/adt/oo/classes/zcl_customer_api", "/sap/bc/adt/programs/zsales_report". Use complete ADT object URIs.'
                        },
                        line: {
                            type: 'number',
                            description: 'The line number where the symbol to rename is located. Use 1-based line numbering (first line is 1).'
                        },
                        startColumn: {
                            type: 'number',
                            description: 'The starting column position of the symbol to rename. Use 1-based column numbering (first column is 1).'
                        },
                        endColumn: {
                            type: 'number',
                            description: 'The ending column position of the symbol to rename. Use 1-based column numbering. Should be startColumn + symbol_length.'
                        }
                    },
                    required: ['uri', 'line', 'startColumn', 'endColumn']
                }
            },
            {
                name: 'renamePreview',
                description: 'Previews the changes that will be made by a rename refactoring operation. Shows all locations where the symbol will be renamed, including the old and new names, and identifies all affected files. This allows you to review the scope of changes before applying the refactoring.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        renameRefactoring: {
                            type: 'object',
                            description: 'The rename refactoring proposal object returned by renameEvaluate. This contains the symbol information, proposed new name, and all references to be updated.'
                        },
                        transport: {
                            type: 'string',
                            description: 'The transport request number to use for the rename operation. Required when the rename affects objects that need to be transported. Examples: "DEVK900001", "DEVK900123".',
                            optional: true
                        }
                    },
                    required: ['renameRefactoring']
                }
            },
            {
                name: 'renameExecute',
                description: 'Executes the rename refactoring operation, applying all changes to the affected objects. This updates the symbol name across all references in the codebase. The operation is atomic - either all changes are applied successfully or none are applied. Objects may need to be locked and activated after the rename.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        refactoring: {
                            type: 'object',
                            description: 'The rename refactoring object containing the finalized parameters for the rename operation. This should be obtained from the preview step and contains the new symbol name and all locations to be updated.'
                        }
                    },
                    required: ['refactoring']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'renameEvaluate':
                return this.handleRenameEvaluate(args);
            case 'renamePreview':
                return this.handleRenamePreview(args);
            case 'renameExecute':
                return this.handleRenameExecute(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown rename tool: ${toolName}`);
        }
    }

    async handleRenameEvaluate(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.renameEvaluate(
                args.uri,
                args.line,
                args.startColumn,
                args.endColumn
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
                `Failed to evaluate rename: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleRenamePreview(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.renamePreview(
                args.renameRefactoring,
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
                `Failed to preview rename: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleRenameExecute(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.renameExecute(args.refactoring);
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
                `Failed to execute rename: ${error.message || 'Unknown error'}`
            );
        }
    }
}
