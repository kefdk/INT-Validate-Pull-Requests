# Internal tool for validating pull requests

This action will validate pull requests based on TRIMIT Groups Git Flow methodology.

## Validation
The action contains the following validations:

- Validate if naming of head branch starts with feature/, hotfix/ or align/.
- Validate that only a feature or alignment branch can only be merged into the develop branch.
- Validate that a hotfix branch can only be merged into main branch.

## Usage:
Create a file in your repository named ".github/workflows/pullrequest.yml" containing the lines below.

```
name: 'Perform TRIMIT Group Pull Request Validation'
on: pull_request
    types: [opened, edited, reopened, synchronize]

jobs:
  pull_request_validation:
    runs-on: ubuntu-latest
    steps:
      - uses: TRIMIT-Group/INT-Validate-Pull-Requests@main
        with:
          branch_main: 'main' # 'Name of your main branch
          branch_develop: 'develop' # Name of your develop branch
          prefix_feature: 'feature/' # Prefix for feature branches
          prefix_hotfix: 'hotfix/' # Prefix for hotfix branches
          prefix_align: 'align/' # Prefix for alignment branches
```
It is possible to change the content in the variables defined after "with:" if the repository is running with a different naming convention.  

## Support
This tool is supported internally by Kristian Ruseng Frandsen (kef@trimit.com).