import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { DebuggingMode, DebuggerScope, DebugBreakpoint, DebugSettings } from 'abap-adt-api';

export class DebugHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'debuggerListeners',
                description: 'Retrieves a list of active debugger listeners in the SAP system. Debugger listeners are processes that wait for debugging events and breakpoint hits. This tool shows which debugging sessions are active and helps manage concurrent debugging scenarios.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        debuggingMode: {
                            type: 'string',
                            description: 'The debugging mode to check. Examples: "USER" for user debugging, "SYSTEM" for system debugging, "HTTP" for HTTP debugging.'
                        },
                        terminalId: {
                            type: 'string',
                            description: 'The terminal ID associated with the debugging session. This is typically a unique identifier for the client terminal or session.'
                        },
                        ideId: {
                            type: 'string',
                            description: 'The IDE identifier for the debugging session. This identifies the development environment or tool that initiated the debugging session.'
                        },
                        user: {
                            type: 'string',
                            description: 'The user ID for the debugging session. Examples: "DEVELOPER", "JOHN.DOE".'
                        },
                        checkConflict: {
                            type: 'boolean',
                            description: 'Whether to check for debugging conflicts. Set to true to verify if multiple debugging sessions might interfere with each other.',
                            optional: true
                        }
                    },
                    required: ['debuggingMode', 'terminalId', 'ideId', 'user']
                }
            },
            {
                name: 'debuggerListen',
                description: 'Starts a debugger listener to wait for debugging events and breakpoint hits. This establishes a debugging session that can intercept program execution when breakpoints are encountered. Essential for interactive debugging of ABAP programs.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        debuggingMode: {
                            type: 'string',
                            description: 'The debugging mode to use. Examples: "USER" for user debugging, "SYSTEM" for system debugging, "HTTP" for HTTP debugging.'
                        },
                        terminalId: {
                            type: 'string',
                            description: 'The terminal ID for the debugging session. This is typically a unique identifier for the client terminal or session.'
                        },
                        ideId: {
                            type: 'string',
                            description: 'The IDE identifier for the debugging session. This identifies the development environment or tool that initiated the debugging session.'
                        },
                        user: {
                            type: 'string',
                            description: 'The user ID for the debugging session. Examples: "DEVELOPER", "JOHN.DOE".'
                        },
                        checkConflict: {
                            type: 'boolean',
                            description: 'Whether to check for debugging conflicts before starting the listener. Set to true to verify if multiple debugging sessions might interfere with each other.',
                            optional: true
                        },
                        isNotifiedOnConflict: {
                            type: 'boolean',
                            description: 'Whether to receive notifications when debugging conflicts occur. Set to true to be alerted about conflicting debugging sessions.',
                            optional: true
                        }
                    },
                    required: ['debuggingMode', 'terminalId', 'ideId', 'user']
                }
            },
            {
                name: 'debuggerDeleteListener',
                description: 'Stops a debug listener.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        debuggingMode: {
                            type: 'string',
                            description: 'The debugging mode.'
                        },
                        terminalId: {
                            type: 'string',
                            description: 'The terminal ID.'
                        },
                        ideId: {
                            type: 'string',
                            description: 'The IDE ID.'
                        },
                        user: {
                            type: 'string',
                            description: 'The user.'
                        }
                    },
                    required: ['debuggingMode', 'terminalId', 'ideId', 'user']
                }
            },
            {
                name: 'debuggerSetBreakpoints',
                description: 'Sets breakpoints in ABAP programs for debugging. Breakpoints pause program execution at specific lines, allowing developers to inspect variable values, step through code, and analyze program flow. This is a fundamental debugging tool for troubleshooting and understanding program behavior.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        debuggingMode: {
                            type: 'string',
                            description: 'The debugging mode to use. Examples: "USER" for user debugging, "SYSTEM" for system debugging, "HTTP" for HTTP debugging.'
                        },
                        terminalId: {
                            type: 'string',
                            description: 'The terminal ID for the debugging session. This is typically a unique identifier for the client terminal or session.'
                        },
                        ideId: {
                            type: 'string',
                            description: 'The IDE identifier for the debugging session. This identifies the development environment or tool that initiated the debugging session.'
                        },
                        clientId: {
                            type: 'string',
                            description: 'The client ID for the debugging session. This identifies the specific client instance within the IDE.'
                        },
                        breakpoints: {
                            type: 'array',
                            description: 'An array of breakpoint objects. Each breakpoint should specify the program/object URI, line number, and optionally conditions or hit counts.'
                        },
                        user: {
                            type: 'string',
                            description: 'The user ID for the debugging session. Examples: "DEVELOPER", "JOHN.DOE".'
                        },
                        scope: {
                            type: 'string',
                            description: 'The debugger scope that determines where breakpoints are active. Examples: "SESSION", "USER", "SYSTEM".',
                            optional: true
                        },
                        systemDebugging: {
                            type: 'boolean',
                            description: 'Whether to enable system debugging. Set to true to debug system-level code and framework calls.',
                            optional: true
                        },
                        deactivated: {
                            type: 'boolean',
                            description: 'Whether to create the breakpoints in deactivated state. Set to true to define breakpoints without immediately activating them.',
                            optional: true
                        },
                        syncScupeUrl: {
                            type: 'string',
                            description: 'The URL for scope synchronization when working with distributed debugging scenarios.',
                            optional: true
                        }
                    },
                    required: ['debuggingMode', 'terminalId', 'ideId', 'clientId', 'breakpoints', 'user']
                }
            },
            {
                name: 'debuggerDeleteBreakpoints',
                description: 'Deletes breakpoints.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        breakpoint: {
                            type: 'object',
                            description: 'The breakpoint to delete.'
                        },
                        debuggingMode: {
                            type: 'string',
                            description: 'The debugging mode.'
                        },
                        terminalId: {
                            type: 'string',
                            description: 'The terminal ID.'
                        },
                        ideId: {
                            type: 'string',
                            description: 'The IDE ID.'
                        },
                        requestUser: {
                            type: 'string',
                            description: 'The requesting user.'
                        },
                        scope: {
                            type: 'string',
                            description: 'The debugger scope.',
                            optional: true
                        }
                    },
                    required: ['breakpoint', 'debuggingMode', 'terminalId', 'ideId', 'requestUser']
                }
            },
            {
                name: 'debuggerAttach',
                description: 'Attaches the debugger.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        debuggingMode: {
                            type: 'string',
                            description: 'The debugging mode.'
                        },
                        debuggeeId: {
                            type: 'string',
                            description: 'The ID of the debuggee.'
                        },
                        user: {
                            type: 'string',
                            description: 'The user.'
                        },
                        dynproDebugging: {
                            type: 'boolean',
                            description: 'Whether to enable Dynpro debugging.',
                            optional: true
                        }
                    },
                    required: ['debuggingMode', 'debuggeeId', 'user']
                }
            },
            {
                name: 'debuggerSaveSettings',
                description: 'Saves debugger settings.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        settings: {
                            type: 'string',
                            description: 'The debugger settings.'
                        }
                    },
                    required: ['settings']
                }
            },
            {
                name: 'debuggerStackTrace',
                description: 'Retrieves the debugger stack trace.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        semanticURIs: {
                            type: 'boolean',
                            description: 'Whether to use semantic URIs.',
                            optional: true
                        }
                    }
                }
            },
            {
                name: 'debuggerVariables',
                description: 'Retrieves variable values and information during debugging sessions. This shows the current values of variables, their types, and structure at the point where execution is paused. Essential for understanding program state and troubleshooting issues.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        parents: {
                            type: 'array',
                            description: 'An array of parent variable names to get variables for. Use empty array to get top-level variables, or specify parent structure/table names to get child variables.'
                        }
                    },
                    required: ['parents']
                }
            },
            {
                name: 'debuggerChildVariables',
                description: 'Retrieves child variables of a debugger variable.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        parent: {
                            type: 'array',
                            description: 'The parent variable name.',
                            optional: true
                        }
                    }
                }
            },
            {
                name: 'debuggerStep',
                description: 'Performs a debugging step operation when execution is paused at a breakpoint. This controls program execution flow during debugging, allowing developers to step through code line by line, step into method calls, or continue execution to specific points.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        steptype: {
                            type: 'string',
                            description: 'The type of step to perform. Examples: "stepInto" (step into method calls), "stepOver" (step over method calls), "stepOut" (step out of current method), "stepContinue" (continue execution), "stepRunToLine" (run to specific line), "stepJumpToLine" (jump to specific line).'
                        },
                        url: {
                            type: 'string',
                            description: 'The URL for step types "stepRunToLine" or "stepJumpToLine". This should be the ADT URL of the target line where execution should continue or jump to.',
                            optional: true
                        }
                    },
                    required: ['steptype']
                }
            },
            {
                name: 'debuggerGoToStack',
                description: 'Navigates to a specific stack entry in the debugger.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        urlOrPosition: {
                            type: 'string',
                            description: 'The URL or position of the stack entry.'
                        }
                    },
                    required: ['urlOrPosition']
                }
            },
            {
                name: 'debuggerSetVariableValue',
                description: 'Sets the value of a debugger variable.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        variableName: {
                            type: 'string',
                            description: 'The name of the variable.'
                        },
                        value: {
                            type: 'string',
                            description: 'The new value of the variable.'
                        }
                    },
                    required: ['variableName', 'value']
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'debuggerListeners':
                return this.handleDebuggerListeners(args);
            case 'debuggerListen':
                return this.handleDebuggerListen(args);
            case 'debuggerDeleteListener':
                return this.handleDebuggerDeleteListener(args);
            case 'debuggerSetBreakpoints':
                return this.handleDebuggerSetBreakpoints(args);
            case 'debuggerDeleteBreakpoints':
                return this.handleDebuggerDeleteBreakpoints(args);
            case 'debuggerAttach':
                return this.handleDebuggerAttach(args);
            case 'debuggerSaveSettings':
                return this.handleDebuggerSaveSettings(args);
            case 'debuggerStackTrace':
                return this.handleDebuggerStackTrace(args);
            case 'debuggerVariables':
                return this.handleDebuggerVariables(args);
            case 'debuggerChildVariables':
                return this.handleDebuggerChildVariables(args);
            case 'debuggerStep':
                return this.handleDebuggerStep(args);
            case 'debuggerGoToStack':
                return this.handleDebuggerGoToStack(args);
            case 'debuggerSetVariableValue':
                return this.handleDebuggerSetVariableValue(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown debug tool: ${toolName}`);
        }
    }

    async handleDebuggerListeners(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerListeners(
                args.debuggingMode,
                args.terminalId,
                args.ideId,
                args.user,
                args.checkConflict
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
                `Failed to get debugger listeners: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerListen(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerListen(
                args.debuggingMode,
                args.terminalId,
                args.ideId,
                args.user,
                args.checkConflict,
                args.isNotifiedOnConflict
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
                `Failed to start debugger listener: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerDeleteListener(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerDeleteListener(
                args.debuggingMode,
                args.terminalId,
                args.ideId,
                args.user
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
                `Failed to delete debugger listener: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerSetBreakpoints(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerSetBreakpoints(
                args.debuggingMode,
                args.terminalId,
                args.ideId,
                args.clientId,
                args.breakpoints,
                args.user,
                args.scope,
                args.systemDebugging,
                args.deactivated,
                args.syncScupeUrl
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
                `Failed to set breakpoints: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerDeleteBreakpoints(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerDeleteBreakpoints(
                args.breakpoint,
                args.debuggingMode,
                args.terminalId,
                args.ideId,
                args.requestUser,
                args.scope
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
                `Failed to delete breakpoints: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerAttach(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerAttach(
                args.debuggingMode,
                args.debuggeeId,
                args.user,
                args.dynproDebugging
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
                `Failed to attach debugger: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerSaveSettings(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerSaveSettings(args.settings);
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
                `Failed to save debugger settings: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerStackTrace(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerStackTrace(args.semanticURIs);
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
                `Failed to get stack trace: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerVariables(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerVariables(args.parents);
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
                `Failed to get variables: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerChildVariables(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerChildVariables(args.parent);
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
                `Failed to get child variables: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerStep(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerStep(args.steptype, args.url);
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
                `Failed to perform debug step: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerGoToStack(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerGoToStack(args.urlOrPosition);
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
                `Failed to go to stack position: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleDebuggerSetVariableValue(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.debuggerSetVariableValue(args.variableName, args.value);
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
                `Failed to set variable value: ${error.message || 'Unknown error'}`
            );
        }
    }
}
