import { ADTClient } from 'abap-adt-api';
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';

export class QueryHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'tableContents',
                description: 'Retrieves the contents of an ABAP table or view from the SAP database. This tool provides direct access to table data with optional filtering and decoding capabilities. Essential for data analysis, debugging, and understanding table structures. Use with caution on large tables - always limit the number of rows to avoid performance issues.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        ddicEntityName: {
                            type: 'string',
                            description: 'The name of the DDIC entity (table or view) to query. Examples: "MARA" (Material Master), "VBAK" (Sales Document Header), "T001" (Company Codes). Use uppercase for standard SAP tables.'
                        },
                        rowNumber: {
                            type: 'number',
                            description: 'The maximum number of rows to retrieve. Default is system-dependent (usually 200). For large tables, start with small values like 10-50 to avoid timeouts. Maximum recommended: 1000.',
                            optional: true
                        },
                        decode: {
                            type: 'boolean',
                            description: 'Whether to decode the data using conversion exits and domain values. Set to true to get human-readable values (e.g., "Active" instead of "A"). False returns raw database values.',
                            optional: true
                        },
                        sqlQuery: {
                            type: 'string',
                            description: 'An optional SQL WHERE clause to filter the data. Examples: "CLIENT = \'001\'", "MATNR LIKE \'Z%\'", "ERDAT >= \'20240101\'". Do not include the WHERE keyword.',
                            optional: true
                        }
                    },
                    required: ['ddicEntityName']
                }
            },
            {
                name: 'runQuery',
                description: 'Executes a custom SQL query on the SAP database. Provides full SQL capabilities including SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY clauses. Use this for complex queries, data analysis, and custom reporting. Always include appropriate WHERE clauses to limit result sets and avoid performance issues.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sqlQuery: {
                            type: 'string',
                            description: 'The complete SQL query to execute. Examples: "SELECT MATNR, MAKTX FROM MARA INNER JOIN MAKT ON MARA~MATNR = MAKT~MATNR WHERE MARA~MTART = \'FERT\'", "SELECT COUNT(*) FROM VBAK WHERE ERDAT >= \'20240101\'". Use ABAP SQL syntax with ~ for table aliases.'
                        },
                        rowNumber: {
                            type: 'number',
                            description: 'The maximum number of rows to retrieve. Default is system-dependent. For performance, always specify a reasonable limit. Start with 100-500 for data exploration.',
                            optional: true
                        },
                        decode: {
                            type: 'boolean',
                            description: 'Whether to decode the data using conversion exits and domain values. Set to true for human-readable output, false for raw database values.',
                            optional: true
                        }
                    },
                    required: ['sqlQuery']
                }
            }
        ];
    }

    async handle(toolName: string, arguments_: any): Promise<any> {
        switch (toolName) {
            case 'tableContents':
                return this.handleTableContents(arguments_);
            case 'runQuery':
                return this.handleRunQuery(arguments_);
            default:
                throw new Error(`Tool ${toolName} not implemented in QueryHandlers`);
        }
    }

    async handleTableContents(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.tableContents(
                args.ddicEntityName,
                args.rowNumber,
                args.decode,
                args.sqlQuery
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
            throw new Error(`Failed to retrieve table contents: ${error.message || 'Unknown error'}`);
        }
    }

    async handleRunQuery(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.runQuery(
                args.sqlQuery,
                args.rowNumber,
                args.decode
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
            throw new Error(`Failed to run query: ${error.message || 'Unknown error'}`);
        }
    }
}
