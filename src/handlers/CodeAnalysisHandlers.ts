import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient } from 'abap-adt-api';

export class CodeAnalysisHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'syntaxCheckCode',
                description: 'Perform ABAP syntax check with source code. Returns array of syntax messages with severity (E/W/I), line numbers, and error descriptions. Use this to validate ABAP code before setting object source. Example: syntaxCheckCode("FUNCTION-POOL ztest.\\nDATA foo", "/sap/bc/adt/functions/groups/ztest", "/sap/bc/adt/functions/groups/ztest/source/main")',
                inputSchema: {
                    type: 'object',
                    properties: {
                        code: { 
                            type: 'string',
                            description: 'ABAP source code to check. Must be complete and valid ABAP code.'
                        },
                        url: { 
                            type: 'string', 
                            optional: true,
                            description: 'URL of the object (without /source/main). Examples: "/sap/bc/adt/functions/groups/ztest", "/sap/bc/adt/programs/programs/ztest"'
                        },
                        mainUrl: { 
                            type: 'string', 
                            optional: true,
                            description: 'Main URL with /source/main suffix. Examples: "/sap/bc/adt/functions/groups/ztest/source/main"'
                        },
                        mainProgram: { 
                            type: 'string', 
                            optional: true,
                            description: 'Main program context for includes. Examples: "/sap/bc/adt/programs/programs/zmain"'
                        },
                        version: { 
                            type: 'string', 
                            optional: true,
                            description: 'Version context for syntax check. Usually not needed.'
                        }
                    },
                    required: ['code']
                }
            },
            {
                name: 'syntaxCheckCdsUrl',
                description: 'Perform ABAP syntax check for CDS objects (DDL, DCL, DDLX). Returns array of syntax messages. Use this for CDS views, access controls, and metadata extensions. Example: syntaxCheckCdsUrl("/sap/bc/adt/ddic/ddl/sources/zcds_view")',
                inputSchema: {
                    type: 'object',
                    properties: {
                        cdsUrl: { 
                            type: 'string',
                            description: 'URL of the CDS object. Examples: "/sap/bc/adt/ddic/ddl/sources/zcds_view", "/sap/bc/adt/acm/dcl/sources/zcds_access", "/sap/bc/adt/ddic/ddlx/sources/zcds_metadata"'
                        }
                    },
                    required: ['cdsUrl']
                }
            },
            {
                name: 'codeCompletion',
                description: 'Get code completion suggestions at specific cursor position. Returns array of proposals with IDENTIFIER and metadata. Use this for intelligent code assistance. Example: codeCompletion("/sap/bc/adt/programs/programs/ztest/source/main", "DATA: lv_var TYPE string.\\nlv_", 2, 3)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sourceUrl: { 
                            type: 'string',
                            description: 'URL of the object source with /source/main suffix. Examples: "/sap/bc/adt/programs/programs/ztest/source/main", "/sap/bc/adt/oo/classes/zcl_test/source/main"'
                        },
                        source: { 
                            type: 'string',
                            description: 'Complete ABAP source code up to the cursor position. Include the partial word being typed.'
                        },
                        line: { 
                            type: 'number',
                            description: 'Line number where completion is requested (1-based). First line = 1.'
                        },
                        column: { 
                            type: 'number',
                            description: 'Column position where completion is requested (1-based). First column = 1.'
                        }
                    },
                    required: ['sourceUrl', 'source', 'line', 'column']
                }
            },
            {
                name: 'findDefinition',
                description: 'Find symbol definition. Use this to navigate to the definition of ABAP symbols like types, variables, methods, functions, forms, and classes. IMPORTANT USAGE NOTES: 1) The url parameter must include /source/main suffix (e.g., /sap/bc/adt/oo/classes/zcl_class/source/main). 2) The source parameter must contain the complete ABAP source code. 3) The line parameter is 1-based (first line = 1). 4) The startCol and endCol parameters are 0-based and define the exact character positions of the symbol you want to find the definition for - these must precisely match the symbol boundaries.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: { 
                            type: 'string',
                            description: 'URL of the ABAP object with /source/main suffix (e.g., /sap/bc/adt/oo/classes/zcl_class/source/main)'
                        },
                        source: { 
                            type: 'string',
                            description: 'Complete ABAP source code of the object'
                        },
                        line: { 
                            type: 'number',
                            description: 'Line number where the symbol is located (1-based)'
                        },
                        startCol: { 
                            type: 'number',
                            description: 'Starting column position of the symbol (0-based)'
                        },
                        endCol: { 
                            type: 'number',
                            description: 'Ending column position of the symbol (0-based)'
                        },
                        implementation: { 
                            type: 'boolean', 
                            optional: true,
                            description: 'For methods: true to navigate to implementation, false to navigate to declaration/signature (default: false)'
                        },
                        mainProgram: { 
                            type: 'string', 
                            optional: true,
                            description: 'Main program context when working with includes'
                        }
                    },
                    required: ['url', 'source', 'line', 'startCol', 'endCol']
                }
            },
            {
                name: 'usageReferences',
                description: 'Find symbol references',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: { type: 'string' },
                        line: { type: 'number', optional: true },
                        column: { type: 'number', optional: true }
                    },
                    required: ['url']
                }
            },
            {
                name: 'syntaxCheckTypes',
                description: 'Retrieves syntax check types.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'codeCompletionFull',
                description: 'Performs full code completion.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sourceUrl: { type: 'string' },
                        source: { type: 'string' },
                        line: { type: 'number' },
                        column: { type: 'number' },
                        patternKey: { type: 'string' }
                    },
                    required: ['sourceUrl', 'source', 'line', 'column', 'patternKey']
                }
            },
            {
                name: 'runClass',
                description: 'Runs a class.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        className: { type: 'string' }
                    },
                    required: ['className']
                }
            },
            {
                name: 'codeCompletionElement',
                description: 'Retrieves code completion element information.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sourceUrl: { type: 'string' },
                        source: { type: 'string' },
                        line: { type: 'number' },
                        column: { type: 'number' }
                    },
                    required: ['sourceUrl', 'source', 'line', 'column']
                }
            },
            {
                name: 'usageReferenceSnippets',
                description: 'Retrieves usage reference snippets.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        references: { type: 'array' }
                    },
                    required: ['references']
                }
            },
            {
                name: 'fixProposals',
                description: 'Retrieves fix proposals.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: { type: 'string' },
                        source: { type: 'string' },
                        line: { type: 'number' },
                        column: { type: 'number' }
                    },
                    required: ['url', 'source', 'line', 'column']
                }
            },
            {
                name: 'fixEdits',
                description: 'Applies fix edits.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        proposal: { type: 'string' },
                        source: { type: 'string' }
                    },
                    required: ['proposal', 'source']
                }
            },
            {
                name: 'fragmentMappings',
                description: 'Retrieves fragment mappings.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: { type: 'string' },
                        type: { type: 'string' },
                        name: { type: 'string' }
                    },
                    required: ['url', 'type', 'name']
                }
            },
            {
                name: 'abapDocumentation',
                description: 'Retrieves ABAP documentation.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        objectUri: { type: 'string' },
                        body: { type: 'string' },
                        line: { type: 'number' },
                        column: { type: 'number' },
                        language: { type: 'string', optional: true }
                    },
                    required: ['objectUri', 'body', 'line', 'column']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'syntaxCheckCode':
                return this.handleSyntaxCheckCode(args);
            case 'syntaxCheckCdsUrl':
                return this.handleSyntaxCheckCdsUrl(args);
            case 'codeCompletion':
                return this.handleCodeCompletion(args);
            case 'findDefinition':
                return this.handleFindDefinition(args);
            case 'usageReferences':
                return this.handleUsageReferences(args);
            case 'syntaxCheckTypes':
                return this.handleSyntaxCheckTypes(args);
            case 'codeCompletionFull':
                return this.handleCodeCompletionFull(args);
            case 'runClass':
                return this.handleRunClass(args);
            case 'codeCompletionElement':
                return this.handleCodeCompletionElement(args);
            case 'usageReferenceSnippets':
                return this.handleUsageReferenceSnippets(args);
            case 'fixProposals':
                return this.handleFixProposals(args);
            case 'fixEdits':
                return this.handleFixEdits(args);
            case 'fragmentMappings':
                return this.handleFragmentMappings(args);
            case 'abapDocumentation':
                return this.handleAbapDocumentation(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown code analysis tool: ${toolName}`);
        }
    }
    async handleSyntaxCheckCdsUrl(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.syntaxCheck(args.cdsUrl);
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
                `Syntax check failed: ${error.message || 'Unknown error'}`
            );
        }
    }
    async handleSyntaxCheckCode(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.syntaxCheck(args.url, args?.mainUrl, args?.code, args?.mainProgram, args?.version);
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
                `Syntax check failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleCodeCompletion(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.codeCompletion(
                args.sourceUrl,
                args.source,
                args.line,
                args.column
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
                `Code completion failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleFindDefinition(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.findDefinition(
                args.url,
                args.source,
                args.line,
                args.startCol,
                args.endCol,
                args.implementation,
                args.mainProgram
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
                `Find definition failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleUsageReferences(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.usageReferences(
                args.url,
                args.line,
                args.column
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
                `Usage references failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleSyntaxCheckTypes(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.syntaxCheckTypes();
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
                `Syntax check types failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleCodeCompletionFull(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.codeCompletionFull(args.sourceUrl, args.source, args.line, args.column, args.patternKey);
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
                `Code completion full failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleRunClass(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.runClass(args.className);
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
                `Run class failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleCodeCompletionElement(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.codeCompletionElement(args.sourceUrl, args.source, args.line, args.column);
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
                `Code completion element failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleUsageReferenceSnippets(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.usageReferenceSnippets(args.references);
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
                `Usage reference snippets failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleFixProposals(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.fixProposals(args.url, args.source, args.line, args.column);
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
                `Fix proposals failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleFixEdits(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.fixEdits(args.proposal, args.source);
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
                `Fix edits failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleFragmentMappings(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.fragmentMappings(args.url, args.type, args.name);
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
                `Fragment mappings failed: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleAbapDocumentation(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.abapDocumentation(args.objectUri, args.body, args.line, args.column, args.language);
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
                `ABAP documentation failed: ${error.message || 'Unknown error'}`
            );
        }
    }
}
