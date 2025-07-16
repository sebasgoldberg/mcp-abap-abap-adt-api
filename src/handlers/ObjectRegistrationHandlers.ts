import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler';
import type { ToolDefinition } from '../types/tools';

export class ObjectRegistrationHandlers extends BaseHandler {
  getTools(): ToolDefinition[] {
    return [
      {
        name: 'objectRegistrationInfo',
        description: 'Retrieves registration information for an ABAP object including its metadata, owner, package assignment, and transport details. This provides comprehensive information about the object registration status, which is essential for understanding object lifecycle and dependencies.',
        inputSchema: {
          type: 'object',
          properties: {
            objectUrl: { 
              type: 'string',
              description: 'The URL of the ABAP object to get registration information for. Examples: "/sap/bc/adt/oo/classes/zcl_customer_api", "/sap/bc/adt/programs/zsales_report". Use complete ADT object URLs.'
            }
          },
          required: ['objectUrl']
        }
      },
      {
        name: 'validateNewObject',
        description: 'Validates parameters for creating a new ABAP object before actual creation. This performs validation checks including name uniqueness, naming conventions, package permissions, and transport requirements. Use this to ensure object creation will succeed before attempting to create the object.',
        inputSchema: {
          type: 'object',
          properties: {
            options: { 
              type: 'string',
              description: 'A JSON string containing the validation options including object type, name, parent package, and other creation parameters. Example: \'{"objtype": "CLAS", "name": "ZCL_NEW_CLASS", "parentName": "ZPACKAGE", "description": "New test class"}\'.'
            }
          },
          required: ['options']
        }
      },
      {
        name: 'createObject',
        description: 'Creates a new ABAP object in the SAP system. This operation creates the object with the specified parameters and registers it in the repository. The object is created in inactive state and needs to be activated after creation. Requires appropriate authorization and transport handling.',
        inputSchema: {
          type: 'object',
          properties: {
            objtype: { 
              type: 'string',
              description: 'The type of ABAP object to create. Examples: "CLAS" for classes, "PROG" for programs, "FUGR" for function groups, "DDLS" for CDS views, "INTF" for interfaces, "DEVC" for packages.'
            },
            name: { 
              type: 'string',
              description: 'The name of the new object. Must follow ABAP naming conventions and be unique within the system. Examples: "ZCL_CUSTOMER_API", "ZSALES_REPORT", "ZFG_UTILITIES".'
            },
            parentName: { 
              type: 'string',
              description: 'The name of the parent package where the object will be created. Examples: "ZPACKAGE", "ZFIN_PACKAGE", "$TMP" for temporary objects.'
            },
            description: { 
              type: 'string',
              description: 'A descriptive text for the object that explains its purpose. Examples: "Customer API for external integrations", "Sales report for monthly analysis".'
            },
            parentPath: { 
              type: 'string',
              description: 'The path to the parent package in the repository tree. Examples: "/sap/bc/adt/packages/zpackage", "/sap/bc/adt/packages/$tmp".'
            },
            responsible: { 
              type: 'string',
              description: 'The user ID responsible for the object. Usually the current user. Examples: "DEVELOPER", "JOHN.DOE". Leave empty to use current user.',
              optional: true
            },
            transport: { 
              type: 'string',
              description: 'The transport request number to record the object creation. Required for transportable objects. Examples: "DEVK900001", "DEVK900123". Leave empty for local objects.',
              optional: true
            }
          },
          required: ['objtype', 'name', 'parentName', 'description', 'parentPath']
        }
      }
    ];
  }

  async handle(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'objectRegistrationInfo':
        return this.handleObjectRegistrationInfo(args);
      case 'validateNewObject':
        return this.handleValidateNewObject(args);
      case 'createObject':
        return this.handleCreateObject(args);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown object registration tool: ${toolName}`);
    }
  }

  async handleObjectRegistrationInfo(args: any): Promise<any> {
    const startTime = performance.now();
    try {
      const info = await this.adtclient.objectRegistrationInfo(args.objectUrl);
      this.trackRequest(startTime, true);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            info
          })
        }]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get registration info: ${error.message || 'Unknown error'}`
      );
    }
  }

  async handleValidateNewObject(args: any): Promise<any> {
    const startTime = performance.now();
    try {
      const result = await this.adtclient.validateNewObject(args.options);
      this.trackRequest(startTime, true);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            result
          })
        }]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to validate new object: ${error.message || 'Unknown error'}`
      );
    }
  }

  async handleCreateObject(args: any): Promise<any> {    
    const startTime = performance.now();
    try {
      const result = await this.adtclient.createObject(
        args.objtype,
        args.name,
        args.parentName,
        args.description,
        args.parentPath,
        args.responsible,
        args.transport
      );
      this.trackRequest(startTime, true);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            result
          })
        }]
      };
    } catch (error: any) {
      this.trackRequest(startTime, false);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create object: ${error.message || 'Unknown error'}`
      );
    }
  }
}
