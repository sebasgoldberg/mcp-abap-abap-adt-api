import { ADTClient } from 'abap-adt-api';
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { AtcProposal } from 'abap-adt-api';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export class AtcHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'atcCustomizing',
                description: 'Retrieves ATC (ABAP Test Cockpit) customizing information and configuration settings. This returns the configured check variants, system-wide ATC settings, and available analysis options. Essential for determining which ATC variant to use for code quality checks.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    additionalProperties: false
                }
            },
            {
                name: 'atcCheckVariant',
                description: 'Retrieves detailed information about a specific ATC check variant. Returns the configuration of checks, their priorities, and settings. The variant name can be obtained from atcCustomizing() by looking for the "systemCheckVariant" property.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        variant: {
                            type: 'string',
                            description: 'The name of the ATC check variant (e.g., "DEFAULT", "EXTENDED"). Use atcCustomizing() to find available variants.'
                        }
                    },
                    required: ['variant'],
                    additionalProperties: false
                }
            },
            {
                name: 'createAtcRun',
                description: 'Creates and executes an ATC (ABAP Test Cockpit) run to analyze code quality. Returns a run ID that can be used to retrieve findings with atcWorklists(). This is the main entry point for running code quality checks.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        variant: {
                            type: 'string',
                            description: 'The ATC check variant to use (obtain from atcCheckVariant). Example: "DEFAULT"'
                        },
                        mainUrl: {
                            type: 'string',
                            description: 'The URL of the ABAP object to analyze. Example: "/sap/bc/adt/oo/classes/zcl_my_class/source/main"'
                        },
                        maxResults: {
                            type: 'number',
                            description: 'Maximum number of findings to return. Default is system-defined limit.',
                            optional: true
                        }
                    },
                    required: ['variant', 'mainUrl'],
                    additionalProperties: false
                }
            },
            {
                name: 'atcWorklists',
                description: 'Retrieves ATC findings (worklists) from a completed ATC run. Returns all code quality issues found during the analysis, including their severity, location, and exemption status. This is typically called after createAtcRun() to get the actual findings.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        runResultId: {
                            type: 'string',
                            description: 'The ID returned from createAtcRun(). This identifies which ATC run to retrieve findings from.'
                        },
                        timestamp: {
                            type: 'number',
                            description: 'Filter findings by timestamp (Unix timestamp). Use run.timestamp from createAtcRun() result.',
                            optional: true
                        },
                        usedObjectSet: {
                            type: 'string',
                            description: 'Object set filter (e.g., "LAST_RUN"). Can be obtained from previous atcWorklists() call.',
                            optional: true
                        },
                        includeExempted: {
                            type: 'boolean',
                            description: 'Whether to include findings that have been exempted/suppressed. Default: false',
                            optional: true
                        }
                    },
                    required: ['runResultId'],
                    additionalProperties: false
                }
            },
            {
                name: 'atcUsers',
                description: 'Retrieves a list of users who can approve ATC exemptions. These users have the necessary authorizations to approve exemption requests for ATC findings.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    additionalProperties: false
                }
            },
            {
                name: 'atcExemptProposal',
                description: 'Retrieves an ATC exemption proposal template for a specific finding. This returns a pre-filled exemption request that can be modified and submitted via atcRequestExemption(). Use this to suppress specific ATC findings that are intentional or false positives.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        markerId: {
                            type: 'string',
                            description: 'The marker ID (quickfixInfo) from an ATC finding obtained via atcWorklists().'
                        }
                    },
                    required: ['markerId'],
                    additionalProperties: false
                }
            },
            {
                name: 'atcRequestExemption',
                description: 'Submits an ATC exemption request to suppress a specific finding. The proposal must be obtained from atcExemptProposal() and modified with justification, reason, and approver information. This creates a formal request to exclude the finding from future ATC runs.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        proposal: {
                            type: 'object',
                            description: 'The ATC exemption proposal from atcExemptProposal(), modified with justification, reason ("FPOS", "OTHR", etc.), and approver information.'
                        }
                    },
                    required: ['proposal'],
                    additionalProperties: false
                }
            },
            {
                name: 'isProposalMessage',
                description: 'Checks if the response from atcExemptProposal() is an error message rather than a valid exemption proposal. Returns true if the proposal contains an error message (e.g., finding already exempted), false if it\'s a valid proposal that can be submitted.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        proposal: {
                            type: 'object',
                            description: 'The response object from atcExemptProposal() to check for error messages.'
                        }
                    },
                    required: ['proposal'],
                    additionalProperties: false
                }
            },
            {
                name: 'atcContactUri',
                description: 'Retrieves the contact URI for an ATC finding, which can be used to change the responsible person for the finding via atcChangeContact(). This is useful for assigning ownership of findings to specific developers.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        findingUri: {
                            type: 'string',
                            description: 'The URI of the ATC finding obtained from atcWorklists() result (finding.uri property).'
                        }
                    },
                    required: ['findingUri'],
                    additionalProperties: false
                }
            },
            {
                name: 'atcChangeContact',
                description: 'Changes the responsible person (contact) for an ATC finding. This assigns ownership of the finding to a specific user, useful for distributing responsibility for resolving code quality issues among team members.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemUri: {
                            type: 'string',
                            description: 'The contact URI obtained from atcContactUri() for the specific finding.'
                        },
                        userId: {
                            type: 'string',
                            description: 'The SAP user ID of the person to assign as responsible for this finding.'
                        }
                    },
                    required: ['itemUri', 'userId'],
                    additionalProperties: false
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'atcCustomizing':
                return this.handleAtcCustomizing(args);
            case 'atcCheckVariant':
                return this.handleAtcCheckVariant(args);
            case 'createAtcRun':
                return this.handleCreateAtcRun(args);
            case 'atcWorklists':
                return this.handleAtcWorklists(args);
            case 'atcUsers':
                return this.handleAtcUsers(args);
            case 'atcExemptProposal':
                return this.handleAtcExemptProposal(args);
            case 'atcRequestExemption':
                return this.handleAtcRequestExemption(args);
            case 'isProposalMessage':
                return this.handleIsProposalMessage(args);
            case 'atcContactUri':
                return this.handleAtcContactUri(args);
            case 'atcChangeContact':
                return this.handleAtcChangeContact(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown ATC tool: ${toolName}`);
        }
    }

    async handleAtcCustomizing(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.atcCustomizing();
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
                `Failed to get ATC customizing: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleAtcCheckVariant(args: { variant: string }): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.atcCheckVariant(args.variant);
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
                `Failed to get ATC check variant: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleCreateAtcRun(args: { variant: string, mainUrl: string, maxResults?: number }): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.createAtcRun(args.variant, args.mainUrl, args.maxResults);
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
                `Failed to create ATC run: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleAtcWorklists(args: { runResultId: string, timestamp?: number, usedObjectSet?: string, includeExempted?: boolean }): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.atcWorklists(args.runResultId, args.timestamp || 0, args.usedObjectSet || "", args.includeExempted);
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
                `Failed to get ATC worklists: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleAtcUsers(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.atcUsers();
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
                `Failed to get ATC users: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleAtcExemptProposal(args: { markerId: string }): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.atcExemptProposal(args.markerId);
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
                `Failed to get ATC exempt proposal: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleAtcRequestExemption(args: { proposal: AtcProposal }): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.atcRequestExemption(args.proposal);
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
                `Failed to request ATC exemption: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleIsProposalMessage(args: { proposal: AtcProposal }): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.isProposalMessage(args.proposal);
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
                `Failed to check if proposal message: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleAtcContactUri(args: { findingUri: string }): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.atcContactUri(args.findingUri);
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
                `Failed to get ATC contact URI: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleAtcChangeContact(args: { itemUri: string, userId: string }): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.atcChangeContact(args.itemUri, args.userId);
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
                `Failed to change ATC contact: ${error.message || 'Unknown error'}`
            );
        }
    }
}
