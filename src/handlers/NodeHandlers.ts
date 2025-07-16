import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { NodeParents, NodeStructure } from "abap-adt-api";

export class NodeHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'nodeContents',
                description: 'Retrieves the contents of a node in the ABAP repository tree. Returns nodes array with objects and objectTypes array. Use this to navigate package contents and object hierarchies. Example: nodeContents("DEVC/K", "BASIS") returns all objects in BASIS package.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        parent_type: {
                            type: 'string',
                            description: 'The type of the parent node. Examples: "DEVC/K" (package), "FUGR/F" (function group), "PROG/P" (program), "PROG/PI" (program include)'
                        },
                        parent_name: {
                            type: 'string',
                            description: 'The name of the parent node. Examples: "BASIS", "ZAPIDUMMY", "ZFUNCGROUP"',
                            optional: true
                        },
                        user_name: {
                            type: 'string',
                            description: 'The user name for filtering user-specific objects. Usually not needed for standard navigation.',
                            optional: true
                        },
                        parent_tech_name: {
                            type: 'string',
                            description: 'The technical name of the parent node. Alternative to parent_name for technical contexts.',
                            optional: true
                        },
                        rebuild_tree: {
                            type: 'boolean',
                            description: 'Whether to rebuild the tree structure. Set to true to refresh cached tree information.',
                            optional: true
                        },
                        parentnodes: {
                            type: 'array',
                            description: 'An array of parent node IDs for hierarchical navigation. Used for expanding specific tree branches. Example: [0] for root level.',
                            optional: true
                        },
                    },
                    required: ['parent_type']
                }
            },
            {
                name: 'mainPrograms',
                description: 'Retrieves the main programs that use a given include. Returns array with adtcore:name and other properties. Use this to find which main programs include a specific include file. Example: mainPrograms("/sap/bc/adt/programs/includes/zadttestincludeinc") returns programs that include this include.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        includeUrl: {
                            type: 'string',
                            description: 'The URL of the include program. Examples: "/sap/bc/adt/programs/includes/zadttestincludeinc", "/sap/bc/adt/programs/includes/ztop"'
                        }
                    },
                    required: ['includeUrl']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'nodeContents':
                return this.handleNodeContents(args);
            case 'mainPrograms':
                return this.handleMainPrograms(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown node tool: ${toolName}`);
        }
    }

    async handleNodeContents(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const nodeContents = await this.adtclient.nodeContents(
                args.parent_type,
                args.parent_name,
                args.user_name,
                args.parent_tech_name,
                args.rebuild_tree,
                args.parentnodes
            );
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            nodeContents
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get node contents: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleMainPrograms(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const mainPrograms = await this.adtclient.mainPrograms(args.includeUrl);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            mainPrograms
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get main programs: ${error.message || 'Unknown error'}`
            );
        }
    }
}
