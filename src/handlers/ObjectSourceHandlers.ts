import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler';
import type { ToolDefinition } from '../types/tools';

export class ObjectSourceHandlers extends BaseHandler {
  getTools(): ToolDefinition[] {
    return [
      {
        name: 'getObjectSource',
        description: 'Retrieves source code for ABAP objects. Returns the complete source code as string. Supports pagination for large objects. IMPORTANT: Always use "/source/main" suffix for the URL. Example: getObjectSource("/sap/bc/adt/programs/programs/ztest/source/main")',
        inputSchema: {
          type: 'object',
          properties: {
            objectSourceUrl: { 
              type: 'string',
              description: 'URL of the object source. MUST include "/source/main" suffix. Examples: "/sap/bc/adt/programs/programs/ztest/source/main", "/sap/bc/adt/oo/classes/zcl_example/source/main"'
            },
            discardLines: { 
              type: 'number', 
              optional: true,
              description: 'Number of lines to discard from the beginning. Used for pagination of large objects. Example: 100 to skip first 100 lines.'
            },
            maxLines: { 
              type: 'number', 
              optional: true,
              description: 'Maximum number of lines to retrieve. Used for pagination. Example: 800 to get maximum 800 lines. If not specified, returns all lines.'
            },
            options: { 
              type: 'string',
              description: 'Additional options for source retrieval. Usually empty string.'
            }
          },
          required: ['objectSourceUrl']
        }
      },
      {
        name: 'setObjectSource',
        description: 'Sets source code for ABAP objects. REQUIRES object to be locked first using lock tool. IMPORTANT: Always use "/source/main" suffix for the URL. Must provide valid transport request. Example workflow: 1) lock object, 2) setObjectSource, 3) unlock object, 4) activate object.',
        inputSchema: {
          type: 'object',
          properties: {
            objectSourceUrl: { 
              type: 'string',
              description: 'URL of the object source. MUST include "/source/main" suffix. Examples: "/sap/bc/adt/programs/programs/ztest/source/main", "/sap/bc/adt/oo/classes/zcl_example/source/main"'
            },
            source: { 
              type: 'string',
              description: 'Complete source code to set. Must be the full source code of the object, not just changes.'
            },
            lockHandle: { 
              type: 'string',
              description: 'Lock handle obtained from lock tool. Format: "LOCK_HANDLE" property from lock response. REQUIRED - object must be locked before setting source.'
            },
            transport: { 
              type: 'string',
              description: 'Transport request number. Format: "SYSTEMK123456" or similar. Can be obtained from transportInfo tool. Required for transportable objects.',
              optional: true
            }
          },
          required: ['objectSourceUrl', 'source', 'lockHandle']
        }
      }
    ];
  }

  async handle(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'getObjectSource':
        return this.handleGetObjectSource(args);
      case 'setObjectSource':
        return this.handleSetObjectSource(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown object source tool: ${toolName}`);
    }
  }

  async handleGetObjectSource(args: any): Promise<any> {
    
    const startTime = performance.now();
    try {
      const source = await this.adtclient.getObjectSource(args.objectSourceUrl, args.options);

      const { maxLines, discardLines }: { maxLines: number, discardLines: number } = args

      let sourcePage: string

      if ( maxLines || discardLines ){
        const newLine = '\n'
        sourcePage =
          source
            .split(newLine)
            .slice(discardLines, maxLines ? maxLines + discardLines : undefined)
            .join(newLine)
      } else {
        sourcePage = source
      }

      this.trackRequest(startTime, true);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              sourcePage
            })
          }
        ]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get object source: ${error.message || 'Unknown error'}`
      );
    }
  }

  async handleSetObjectSource(args: any): Promise<any> {    
    const startTime = performance.now();
    try {
      await this.adtclient.setObjectSource(
        args.objectSourceUrl,
        args.source,
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
              updated: true
            })
          }
        ]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to set object source: ${error.message || 'Unknown error'}`
      );
    }
  }
}
