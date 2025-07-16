import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient } from "abap-adt-api";

export class PrettyPrinterHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'prettyPrinterSetting',
                description: 'Retrieves the current pretty printer settings from the SAP system. These settings control how ABAP code is formatted including indentation style, keyword casing, spacing, and other formatting preferences. Use this to understand the current formatting configuration before making changes.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'setPrettyPrinterSetting',
                description: 'Updates the pretty printer settings in the SAP system. This configures how ABAP code will be formatted by the pretty printer, including indentation rules, keyword formatting, and spacing preferences. Changes affect all subsequent pretty printer operations.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        indent: {
                            type: 'boolean',
                            description: 'Whether to enable automatic indentation of ABAP code. Set to true for structured, hierarchical code formatting with proper nesting levels. Set to false for minimal formatting changes.'
                        },
                        style: {
                            type: 'string',
                            description: 'The pretty printer style to use. Common values include "UPPER" for uppercase keywords, "LOWER" for lowercase keywords, "MIXED" for mixed case, and "DEFAULT" for system default formatting.'
                        }
                    },
                    required: ['indent', 'style']
                }
            },
            {
                name: 'prettyPrinter',
                description: 'Formats ABAP source code using the SAP pretty printer. This tool applies consistent formatting including proper indentation, keyword casing, spacing, and alignment according to the current pretty printer settings. Essential for code standardization, readability improvement, and maintaining consistent code style across development teams.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        source: {
                            type: 'string',
                            description: 'The ABAP source code to format. Can be a complete program, class, method, or code fragment. The pretty printer will apply formatting rules while preserving the code logic and structure.'
                        }
                    },
                    required: ['source']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'prettyPrinterSetting':
                return this.handlePrettyPrinterSetting(args);
            case 'setPrettyPrinterSetting':
                return this.handleSetPrettyPrinterSetting(args);
            case 'prettyPrinter':
                return this.handlePrettyPrinter(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown pretty printer tool: ${toolName}`);
        }
    }

    async handlePrettyPrinterSetting(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const settings = await this.adtclient.prettyPrinterSetting();
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            settings
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get pretty printer settings: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleSetPrettyPrinterSetting(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.setPrettyPrinterSetting(args.indent, args.style);
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
                `Failed to set pretty printer settings: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handlePrettyPrinter(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const source = await this.adtclient.prettyPrinter(args.source);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            source
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to format ABAP code: ${error.message || 'Unknown error'}`
            );
        }
    }
}
