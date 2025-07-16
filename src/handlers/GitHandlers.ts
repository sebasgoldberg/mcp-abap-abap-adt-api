import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { BaseHandler } from './BaseHandler.js';
import type { ToolDefinition } from '../types/tools.js';
import { GitRepo, GitStaging } from 'abap-adt-api';

export class GitHandlers extends BaseHandler {
    getTools(): ToolDefinition[] {
        return [
            {
                name: 'gitRepos',
                description: 'Retrieves a list of all Git repositories configured in the SAP system via abapGit. Returns repository information including key, associated SAP package, URL, branch, and status. This is typically the first step in any Git workflow to identify available repositories.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    additionalProperties: false
                }
            },
            {
                name: 'gitExternalRepoInfo',
                description: 'Retrieves information about an external Git repository before creating a local link. This validates the repository URL, checks accessibility, and returns available branches and other metadata. Use this to validate repository details before calling gitCreateRepo().',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repourl: {
                            type: 'string',
                            description: 'The Git repository URL (e.g., "https://github.com/user/repo.git").'
                        },
                        user: {
                            type: 'string',
                            description: 'Username for authentication (required for private repositories).',
                            optional: true
                        },
                        password: {
                            type: 'string',
                            description: 'Password or token for authentication (required for private repositories).',
                            optional: true
                        }
                    },
                    required: ['repourl'],
                    additionalProperties: false
                }
            },
            {
                name: 'gitCreateRepo',
                description: 'Creates a new Git repository link in the SAP system and performs initial pull. This establishes the connection between a SAP package and an external Git repository. The specified package must exist before calling this function.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        packageName: {
                            type: 'string',
                            description: 'The name of the existing SAP package to link with the Git repository (e.g., "$TMP", "ZPROJECT").'
                        },
                        repourl: {
                            type: 'string',
                            description: 'The Git repository URL (e.g., "https://github.com/user/repo.git").'
                        },
                        branch: {
                            type: 'string',
                            description: 'The Git branch to use (e.g., "main", "develop"). Default: repository\'s default branch.',
                            optional: true
                        },
                        transport: {
                            type: 'string',
                            description: 'Transport request number for change recording. Leave empty for local packages.',
                            optional: true
                        },
                        user: {
                            type: 'string',
                            description: 'Username for authentication (required for private repositories).',
                            optional: true
                        },
                        password: {
                            type: 'string',
                            description: 'Password or token for authentication (required for private repositories).',
                            optional: true
                        }
                    },
                    required: ['packageName', 'repourl'],
                    additionalProperties: false
                }
            },
            {
                name: 'gitPullRepo',
                description: 'Pulls latest changes from the Git repository into the SAP system. This synchronizes the SAP package with the remote repository, creating, updating, or deleting ABAP objects as needed. Use this to update your SAP system with the latest code from Git.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repoId: {
                            type: 'string',
                            description: 'The repository key/ID obtained from gitRepos() (repo.key property).'
                        },
                        branch: {
                            type: 'string',
                            description: 'The Git branch to pull from (e.g., "main", "develop"). Default: current branch.',
                            optional: true
                        },
                        transport: {
                            type: 'string',
                            description: 'Transport request number for change recording. Leave empty for local packages.',
                            optional: true
                        },
                        user: {
                            type: 'string',
                            description: 'Username for authentication (required for private repositories).',
                            optional: true
                        },
                        password: {
                            type: 'string',
                            description: 'Password or token for authentication (required for private repositories).',
                            optional: true
                        }
                    },
                    required: ['repoId'],
                    additionalProperties: false
                }
            },
            {
                name: 'gitUnlinkRepo',
                description: 'Unlinks (removes) a Git repository from the SAP system. This removes the connection between the SAP package and the Git repository but does not delete the ABAP objects in the package. Use this to disconnect from a Git repository while keeping the code in SAP.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repoId: {
                            type: 'string',
                            description: 'The repository key/ID obtained from gitRepos() (repo.key property).'
                        }
                    },
                    required: ['repoId'],
                    additionalProperties: false
                }
            },
            {
                name: 'stageRepo',
                description: 'Stages changes in a Git repository by comparing SAP objects with the Git repository state. This prepares changes for commit by identifying new, modified, or deleted objects. Returns staging information that can be used with pushRepo() to commit changes to Git.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repo: {
                            type: 'object',
                            description: 'The Git repository object obtained from gitRepos() containing repository metadata.'
                        },
                        user: {
                            type: 'string',
                            description: 'Username for authentication (required for private repositories).',
                            optional: true
                        },
                        password: {
                            type: 'string',
                            description: 'Password or token for authentication (required for private repositories).',
                            optional: true
                        }
                    },
                    required: ['repo'],
                    additionalProperties: false
                }
            },
            {
                name: 'pushRepo',
                description: 'Pushes staged changes to the Git repository. This commits the changes identified by stageRepo() to the remote Git repository. The staging object must contain commit information and file changes to be pushed.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repo: {
                            type: 'object',
                            description: 'The Git repository object obtained from gitRepos() containing repository metadata.'
                        },
                        staging: {
                            type: 'object',
                            description: 'The staging information object returned from stageRepo(), containing commit details and file changes.'
                        },
                        user: {
                            type: 'string',
                            description: 'Username for authentication (required for private repositories).',
                            optional: true
                        },
                        password: {
                            type: 'string',
                            description: 'Password or token for authentication (required for private repositories).',
                            optional: true
                        }
                    },
                    required: ['repo', 'staging'],
                    additionalProperties: false
                }
            },
            {
                name: 'checkRepo',
                description: 'Checks the status of a Git repository by comparing the SAP package contents with the Git repository state. This identifies differences between local SAP objects and the remote Git repository without making changes.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repo: {
                            type: 'string',
                            description: 'The repository key/ID obtained from gitRepos() (repo.key property).'
                        },
                        user: {
                            type: 'string',
                            description: 'Username for authentication (required for private repositories).',
                            optional: true
                        },
                        password: {
                            type: 'string',
                            description: 'Password or token for authentication (required for private repositories).',
                            optional: true
                        }
                    },
                    required: ['repo'],
                    additionalProperties: false
                }
            },
            {
                name: 'remoteRepoInfo',
                description: 'Retrieves information about a remote Git repository that is already linked to the SAP system. This returns current branch information, commit details, and repository metadata for an existing abapGit repository.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repo: {
                            type: 'string',
                            description: 'The repository key/ID obtained from gitRepos() (repo.key property).'
                        },
                        user: {
                            type: 'string',
                            description: 'Username for authentication (required for private repositories).',
                            optional: true
                        },
                        password: {
                            type: 'string',
                            description: 'Password or token for authentication (required for private repositories).',
                            optional: true
                        }
                    },
                    required: ['repo'],
                    additionalProperties: false
                }
            },
            {
                name: 'switchRepoBranch',
                description: 'Switches to a different branch in a Git repository. This changes the active branch for the abapGit repository link, potentially updating the SAP package contents to match the target branch. Use with caution as this can modify your ABAP objects.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        repo: {
                            type: 'string',
                            description: 'The repository key/ID obtained from gitRepos() (repo.key property).'
                        },
                        branch: {
                            type: 'string',
                            description: 'The target branch name (e.g., "main", "develop", "feature/new-feature").'
                        },
                        create: {
                            type: 'boolean',
                            description: 'Whether to create the branch locally if it doesn\'t exist remotely. Default: false.',
                            optional: true
                        },
                        user: {
                            type: 'string',
                            description: 'Username for authentication (required for private repositories).',
                            optional: true
                        },
                        password: {
                            type: 'string',
                            description: 'Password or token for authentication (required for private repositories).',
                            optional: true
                        }
                    },
                    required: ['repo', 'branch'],
                    additionalProperties: false
                }
            }
        ];
    }

    async handle(toolName: string, args: any): Promise<any> {
        switch (toolName) {
            case 'gitRepos':
                return this.handleGitRepos(args);
            case 'gitExternalRepoInfo':
                return this.handleGitExternalRepoInfo(args);
            case 'gitCreateRepo':
                return this.handleGitCreateRepo(args);
            case 'gitPullRepo':
                return this.handleGitPullRepo(args);
            case 'gitUnlinkRepo':
                return this.handleGitUnlinkRepo(args);
            case 'stageRepo':
                return this.handleStageRepo(args);
            case 'pushRepo':
                return this.handlePushRepo(args);
            case 'checkRepo':
                return this.handleCheckRepo(args);
            case 'remoteRepoInfo':
                return this.handleRemoteRepoInfo(args);
            case 'switchRepoBranch':
                return this.handleSwitchRepoBranch(args);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown git tool: ${toolName}`);
        }
    }

    async handleGitRepos(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const repos = await this.adtclient.gitRepos();
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            repos
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get git repos: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleGitExternalRepoInfo(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const repoInfo = await this.adtclient.gitExternalRepoInfo(
                args.repourl,
                args.user,
                args.password
            );
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            repoInfo
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get external repo info: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleGitCreateRepo(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.gitCreateRepo(
                args.packageName,
                args.repourl,
                args.branch,
                args.transport,
                args.user,
                args.password
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
                `Failed to create git repo: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleGitPullRepo(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.gitPullRepo(
                args.repoId,
                args.branch,
                args.transport,
                args.user,
                args.password
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
                `Failed to pull git repo: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleGitUnlinkRepo(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.gitUnlinkRepo(args.repoId);
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
                `Failed to unlink git repo: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleStageRepo(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.stageRepo(
                args.repo,
                args.user,
                args.password
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
                `Failed to stage repo: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handlePushRepo(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.pushRepo(
                args.repo,
                args.staging,
                args.user,
                args.password
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
                `Failed to push repo: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleCheckRepo(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.checkRepo(
                args.repo,
                args.user,
                args.password
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
                `Failed to check repo: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleRemoteRepoInfo(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const repoInfo = await this.adtclient.remoteRepoInfo(
                args.repo,
                args.user,
                args.password
            );
            this.trackRequest(startTime, true);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'success',
                            repoInfo
                        })
                    }
                ]
            };
        } catch (error: any) {
            this.trackRequest(startTime, false);
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to get remote repo info: ${error.message || 'Unknown error'}`
            );
        }
    }

    async handleSwitchRepoBranch(args: any): Promise<any> {
        const startTime = performance.now();
        try {
            const result = await this.adtclient.switchRepoBranch(
                args.repo,
                args.branch,
                args.create,
                args.user,
                args.password
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
                `Failed to switch repo branch: ${error.message || 'Unknown error'}`
            );
        }
    }
}
