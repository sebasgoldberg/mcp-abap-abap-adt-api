import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { ADTClient } from "abap-adt-api";

export class ObjectLockHandlers extends BaseHandler {
  getTools(): ToolDefinition[] {
    return [{
      name: 'lock',
      description: 'Lock an ABAP object for editing. REQUIRES stateful session (set stateful=true). Returns lock handle that must be used for setObjectSource and unLock operations. Objects must be locked before modification. Example: lock("/sap/bc/adt/programs/programs/ztest") returns {LOCK_HANDLE: "..."}',
      inputSchema: {
        type: 'object',
        properties: {
          objectUrl: { 
            type: 'string',
            description: 'URL of the object to lock. Do NOT include "/source/main" suffix here. Examples: "/sap/bc/adt/programs/programs/ztest", "/sap/bc/adt/oo/classes/zcl_example", "/sap/bc/adt/ddic/tables/ztable"'
          },
          accessMode: { 
            type: 'string',
            description: 'Access mode for the lock. Usually not needed (defaults to MODIFY). Examples: "MODIFY", "READ"',
            optional: true 
          }
        },
        required: ['objectUrl']
      }
    }, {
      name: 'unLock',
      description: 'Unlock a previously locked ABAP object. MUST be called after object modification is complete. Always use with dropSession() to clean up properly. Example: unLock("/sap/bc/adt/programs/programs/ztest", "LOCK_HANDLE_123")',
      inputSchema: {
        type: 'object',
        properties: {
          objectUrl: { 
            type: 'string',
            description: 'URL of the object to unlock. Must be exactly the same URL used in lock operation. Examples: "/sap/bc/adt/programs/programs/ztest", "/sap/bc/adt/oo/classes/zcl_example"'
          },
          lockHandle: { 
            type: 'string',
            description: 'Lock handle obtained from previous lock operation. Format: "LOCK_HANDLE" property from lock response. REQUIRED - must match the handle returned by lock.'
          }
        },
        required: ['objectUrl', 'lockHandle']
      }
    }];
  }
  async handle(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'lock':
        return this.handleLock(args);
      case 'unLock':
        return this.handleUnlock(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown object lock tool: ${toolName}`);
    }
  }

  async handleLock(args: any): Promise<any> {
    const startTime = performance.now();
    try {
      const lockResult = await this.adtclient.lock(args.objectUrl, args.accessMode);
      this.trackRequest(startTime, true);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              lockHandle: lockResult.LOCK_HANDLE,
              message: 'Object locked successfully'
            })
          }
        ]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to lock object: ${error.message || 'Unknown error'}`
      );
    }
  }

  async handleUnlock(args: any): Promise<any> {
    const startTime = performance.now();
    try {
      await this.adtclient.unLock(args.objectUrl, args.lockHandle);
      this.trackRequest(startTime, true);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              message: 'Object unlocked successfully'
            })
          }
        ]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to unlock object: ${error.message || 'Unknown error'}`
      );
    }
  }
}
