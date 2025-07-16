import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient, ServiceBinding } from "abap-adt-api";

export class ServiceBindingHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'publishServiceBinding',
                description: 'Publishes a service binding to make it available for consumption. This activates the service binding and enables external access to the underlying service definition. Essential for exposing OData services, REST APIs, or other service interfaces to consumers. The service binding must be properly configured before publishing.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'The name of the service binding to publish. Examples: "ZCL_CUSTOMER_API", "ZSRV_SALES_ORDER". Use the exact service binding name as defined in the system.'
                        },
                        version: {
                            type: 'string',
                            description: 'The version of the service binding to publish. Examples: "0001", "1.0", "ACTIVE". This ensures the correct version is activated.'
                        }
                    },
                    required: ['name', 'version']
                }
            },
            {
                name: 'unPublishServiceBinding',
                description: 'Unpublishes a service binding to disable external access. This deactivates the service binding and prevents consumers from accessing the service. Use this for maintenance, updates, or when the service is no longer needed. The service binding remains in the system but becomes unavailable to external consumers.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'The name of the service binding to unpublish. Examples: "ZCL_CUSTOMER_API", "ZSRV_SALES_ORDER". Use the exact service binding name as defined in the system.'
                        },
                        version: {
                            type: 'string',
                            description: 'The version of the service binding to unpublish. Examples: "0001", "1.0", "ACTIVE". This ensures the correct version is deactivated.'
                        }
                    },
                    required: ['name', 'version']
                }
            },
            {
                name: 'bindingDetails',
                description: 'Retrieves detailed information about a service binding including its configuration, endpoints, status, and associated service definitions. This provides comprehensive metadata about the service binding useful for debugging, monitoring, and configuration validation. Returns service URLs, authentication details, and runtime status.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        binding: {
                            type: 'object',
                            description: 'The service binding object obtained from a previous query or service binding list. This should contain at least the binding name and basic metadata.'
                        },
                        index: {
                            type: 'number',
                            description: 'The index of the specific service binding when multiple bindings exist. Use 0 for the first binding, 1 for the second, etc. Optional when working with a single binding.',
                            optional: true
                        }
                    },
                    required: ['binding']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'publishServiceBinding':
                return this.handlePublishServiceBinding(args);
            case 'unPublishServiceBinding':
                return this.handleUnPublishServiceBinding(args);
            case 'bindingDetails':
                return this.handleBindingDetails(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown service binding tool: ${toolName}`);
        }
    }

    async handlePublishServiceBinding(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.publishServiceBinding(args.name, args.version);
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
                `Failed to publish service binding: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleUnPublishServiceBinding(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.unPublishServiceBinding(args.name, args.version);
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
                `Failed to unpublish service binding: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleBindingDetails(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const details = await this.adtclient.bindingDetails(args.binding, args.index);
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
                `Failed to get binding details: ${error.message || 'Unknown error'}`
            );
        }
    }
}
