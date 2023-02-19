# Internal tool for checking pull requests

This action will check various rules on pull requests based on TRIMIT Groups Git Flow methodology.

## Current checks
The action currently contains the following checks:

- Validate if naming of branch starts with feature/, hotfix/ or align/.
- Validate that a feature branch can only be merged into develop branch.
- Validate that a hotfix branch can only be merged into main branch.
- Validate that a align branch can only be merged into develop branch.

## Usage:
```
name: "Perform TRIMIT Group checks"
on:
  pull_request:
    types: [opened, edited, reopened, synchronize]
  
jobs:
  test_job:
    runs-on: ubuntu-latest
    name: Perform TRIMIT Group checks
    steps:
      - uses: ????
```
