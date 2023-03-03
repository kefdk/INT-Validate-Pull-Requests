const core = require('@actions/core');
const github = require('@actions/github');

const validEvents = ['pull_request', 'push'];

function getBranchName(eventName, payload) {
    let branchName;

    switch (eventName) {
        case 'pull_request':
            branchName = payload.pull_request.head.ref;
            break;
        case 'push':
            branchName = payload.ref.replace('refs/heads/', '');
            break;
        default:
            throw new Error('Unsupported event: ${eventName}');
    }

    return branchName;
}

async function runValidation() {
    try {
        const eventName = github.context.eventName;
        const payload = github.context.payload;
        const branchName = getBranchName(eventName, github.context.payload);
        
        // Get inputs
        const branchMain = core.getInput('branch_main');
        const branchDevelop = core.getInput('branch_develop');
        const prefixFeature = core.getInput('prefix_feature');
        const prefixHotfix = core.getInput('prefix_hotfix');
        const prefixAlign = core.getInput('prefix_align');

        // If not main or develop branch
        if (branchName != branchMain && branchName != branchDevelop) {
            // Check if the branch starts with a valid prefix
            core.info(`Validating prefixes of branch. Allowed prefixes: ${prefixFeature}, ${prefixHotfix}, ${prefixAlign}`);
            if (!branchName.startsWith(prefixFeature) && !branchName.startsWith(prefixHotfix) && !branchName.startsWith(prefixAlign)) {
                core.setFailed(`Branch ${branchName} is not valid. Did not match any of the allowed prefixes: ${prefixFeature}, ${prefixHotfix}, ${prefixAlign}`);
                return;
            }

            // Check if branch is heading in the right direction
            switch(payload.base.ref) {
                case branchDevelop: // if towards develop branch
                    core.info(`Validating rules for base branch: ${branchDevelop}`)
                    if (!branchName.startsWith(prefixFeature) && !branchName.startsWith(prefixAlign)) {
                        core.setFailed(`Pull request from ${branchName} to ${branchDevelop} denied. Reason: Invalid branch prefix. Allowed prefixes: ${prefixFeature}, ${prefixAlign}`);
                        return;
                    }
                    break;
                case branchMain: // if towards main branch
                    core.info(`Validating rules for base branch: ${branchMain}`)
                    if (branchName != branchDevelop && !branchName.startsWith(prefixHotfix)) {
                        core.setFailed(`Pull request from ${branchName} to ${branchMain} denied. Reason: Invalid branch prefix. Allowed prefixes: ${prefixHotfix}`);
                        return;
                    }
                    break;
            }
        }
        else if (branchName == branchDevelop) { // head branch is the develop branch
            core.info(`Validating rules for using ${branchDevelop} as head branch.`)
            if (payload.base.ref != branchMain) {
                core.setFailed(`Pull request from ${branchName} is only allowed with ${branchMain} as base branch.`);
                return;
            }
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

runValidation();