import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient } from "abap-adt-api";

export class ObjectDeletionHandlers extends BaseHandler {
  getTools(): ToolDefinition[] {
    return [
      {
        name: 'deleteObject',
        description: 'Deletes an ABAP object from the SAP system permanently. This operation removes the object from the repository and all its associated metadata. The object must be locked before deletion and may require transport authorization. Use with extreme caution as this operation cannot be undone. Consider deactivating objects instead of deleting them for safety.',
        inputSchema: {
          type: 'object',
          properties: {
            objectUrl: { 
              type: 'string',
              description: 'The URL of the ABAP object to delete. Examples: "/sap/bc/adt/oo/classes/zcl_test_class", "/sap/bc/adt/programs/ztest_program", "/sap/bc/adt/functions/groups/zfg_test". Use complete ADT object URLs obtained from search operations.'
            },
            lockHandle: { 
              type: 'string',
              description: 'The lock handle obtained from a previous lock operation. This ensures exclusive access to the object during deletion and prevents concurrent modifications. Required for all delete operations.'
            },
            transport: { 
              type: 'string',
              description: 'The transport request number to record the deletion. Required when the object needs to be transported to other systems. Examples: "DEVK900001", "DEVK900123". Leave empty for local objects.',
              optional: true
            }
          },
          required: ['objectUrl', 'lockHandle']
        }
      }
    ];
  }

  async handle(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'deleteObject':
        return this.handleDeleteObject(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown object deletion tool: ${toolName}`);
    }
  }

  async handleDeleteObject(args: any): Promise<any> {
    const startTime = performance.now();
    try {
      const result = await this.adtclient.deleteObject(
        args.objectUrl,
        args.lockHandle,
        args.transport
      );
      this.trackRequest(startTime, true);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              result,
              message: 'Object deleted successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      const errorMessage = error.message || 'Unknown error';
      const detailedError = error.response?.data?.message || errorMessage;
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete object: ${detailedError}`
      );
    }
  }
}
