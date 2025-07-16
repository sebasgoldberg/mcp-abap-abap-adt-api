import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';

export class DiscoveryHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'featureDetails',
                description: 'Retrieves detailed information about a specific ADT feature. This returns comprehensive metadata about the feature including its capabilities, configuration options, and usage requirements. Use this to understand what functionality is available and how to use specific ADT features.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'The title of the feature to get details for. Examples: "ABAP_EDITOR", "DDIC_ACTIVATION", "TRANSPORT_MANAGEMENT". Use the exact feature name as exposed by the ADT discovery services.'
                        }
                    },
                    required: ['title']
                }
            },
            {
                name: 'collectionFeatureDetails',
                description: 'Retrieves detailed information about a collection feature from ADT. Collection features are groups of related functionality that are exposed as collections in the ADT API. This provides metadata about the collection including available operations, supported types, and configuration.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The URL of the collection feature to get details for. Examples: "/sap/bc/adt/repository/collections/classes", "/sap/bc/adt/repository/collections/programs". Use URLs obtained from discovery services.'
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'findCollectionByUrl',
                description: 'Finds and retrieves a collection by its URL. Collections in ADT represent groups of related objects or functionality. This tool helps locate specific collections and understand their structure and contents.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The URL of the collection to find. Examples: "/sap/bc/adt/repository/collections/ddic", "/sap/bc/adt/repository/collections/transports". Use complete ADT URLs.'
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'loadTypes',
                description: 'Loads and retrieves all available object types in the ADT system. This returns a comprehensive list of ABAP object types that can be created, modified, or accessed through ADT including classes, programs, includes, function groups, and DDIC objects. Essential for understanding what types of objects are available.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'adtDiscovery',
                description: 'Performs ADT discovery to retrieve available services and capabilities. This returns information about all ADT services, their endpoints, supported operations, and feature availability. Use this to understand what ADT functionality is available in the connected SAP system.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'adtCoreDiscovery',
                description: 'Performs ADT core discovery to retrieve fundamental ADT services and capabilities. This focuses on core ADT functionality including basic object operations, repository services, and essential development tools. More focused than full ADT discovery.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'adtCompatibiliyGraph',
                description: 'Retrieves the ADT compatibility graph which shows version compatibility information between different ADT components and the SAP system. This helps understand which ADT features are available and supported in the current system version.',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'featureDetails':
                return this.handleFeatureDetails(args);
            case 'collectionFeatureDetails':
                return this.handleCollectionFeatureDetails(args);
            case 'findCollectionByUrl':
                return this.handleFindCollectionByUrl(args);
            case 'loadTypes':
                return this.handleLoadTypes(args);
            case 'adtDiscovery':
                return this.handleAdtDiscovery(args);
            case 'adtCoreDiscovery':
                return this.handleAdtCoreDiscovery(args);
            case 'adtCompatibiliyGraph':
                return this.handleAdtCompatibilityGraph(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown discovery tool: ${toolName}`);
        }
    }

    async handleFeatureDetails(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const details = await this.adtclient.featureDetails(args.title);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            details
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get feature details: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleCollectionFeatureDetails(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const details = await this.adtclient.collectionFeatureDetails(args.url);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            details
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get collection feature details: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleFindCollectionByUrl(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const collection = await this.adtclient.findCollectionByUrl(args.url);
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            collection
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to find collection by URL: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleLoadTypes(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const types = await this.adtclient.loadTypes();
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            types
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to load types: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleAdtDiscovery(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const discovery = await this.adtclient.adtDiscovery();
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            discovery
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to perform ADT discovery: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleAdtCoreDiscovery(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const discovery = await this.adtclient.adtCoreDiscovery();
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            discovery
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to perform ADT core discovery: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleAdtCompatibilityGraph(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const graph = await this.adtclient.adtCompatibiliyGraph();
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            graph
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get ADT compatibility graph: ${error.message || 'Unknown error'}`
            );
        }
    }
}
