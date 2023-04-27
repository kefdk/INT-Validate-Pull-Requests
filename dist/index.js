const core = require('@actions/core');
const github = require('@actions/github');

const validEvents = ['pull_request', 'push'];

function getBranchName(eventName, payload, base = false) {
    let branchName;

    if (base) {
        switch (eventName) {
            case 'pull_request':
                branchName = payload.pull_request.base.ref;
                break;
            default:
                throw new Error('Unsupported event: ${eventName}');
        } 
    } else {
        switch (eventName) {
            case 'pull_request':
                branchName = payload.pull_request.head.ref;
                break;
            default:
                throw new Error('Unsupported event: ${eventName}');
        }
    }

    return branchName;
}

async function runValidation() {
    try {
        const eventName = github.context.eventName;
        const payload = github.context.payload;
        const headBranchName = getBranchName(eventName, payload, false);
        const baseBranchName = getBranchName(eventName, payload, true);
        
        // Get inputs
        const branchMain = core.getInput('branch_main');
        const branchDevelop = core.getInput('branch_develop');
        const prefixFeature = core.getInput('prefix_feature');
        const prefixHotfix = core.getInput('prefix_hotfix');
        const prefixAlign = core.getInput('prefix_align');

        // If not main or develop branch
        if (headBranchName != branchMain && headBranchName != branchDevelop) {
            // Check if the branch starts with a valid prefix
            core.info(`Validating prefixes of branch. Allowed prefixes: ${prefixFeature}, ${prefixHotfix}, ${prefixAlign}`);
            if (!headBranchName.startsWith(prefixFeature) && !headBranchName.startsWith(prefixHotfix) && !headBranchName.startsWith(prefixAlign)) {
                core.setFailed(`Branch ${headBranchName} is not valid. Did not match any of the allowed prefixes: ${prefixFeature}, ${prefixHotfix}, ${prefixAlign}`);
                return;
            }

            // Check if branch is heading in the right direction
            switch(baseBranchName) {
                case branchDevelop: // if towards develop branch
                    core.info(`Validating rules for base branch: ${branchDevelop}`)
                    if (!headBranchName.startsWith(prefixFeature) && !headBranchName.startsWith(prefixAlign)) {
                        core.setFailed(`Pull request from ${headBranchName} to ${branchDevelop} denied. Reason: Invalid branch prefix. Allowed prefixes: ${prefixFeature}, ${prefixAlign}`);
                        return;
                    }
                    break;
                case branchMain: // if towards main branch
                    core.info(`Validating rules for base branch: ${branchMain}`)
                    if (headBranchName != branchDevelop && !headBranchName.startsWith(prefixHotfix)) {
                        core.setFailed(`Pull request from ${headBranchName} to ${branchMain} denied. Reason: Invalid branch prefix. Allowed prefixes: ${prefixHotfix}`);
                        return;
                    }
                    break;
                default:
                    core.info(`Pull request not going to ${branchMain} or ${branchDevelop}, so everything is good.`);
            }
        }
        else if (headBranchName == branchDevelop) { // head branch is the develop branch
            core.info(`Validating rules for using ${branchDevelop} as head branch.`)
            if (baseBranchName != branchMain) {
                core.setFailed(`Pull request from ${headBranchName} is only allowed to ${branchMain}.`);
                return;
            }
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

runValidation();