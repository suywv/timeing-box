Command: issue
Argument: GitHub issue number

Instruction:

Please analyze and resolve the GitHub issue: $ARGUMENTS

Steps to follow:
PLAN
1. Run gh issue view $ARGUMENTS to retrieve the issue details.
2. Carefully review and understand the problem described.
3. Ask clarifying questions if necessary.
4. Research prior context for this issue:

Search scratchpads for related notes or thoughts.

Check past PRs for relevant history.

Explore the codebase for related files.
5. Break the issue into small, actionable tasks.
6. Document your plan in a new scratchpad:

Use the issue title in the filename.
Include a link to the issue.

CREATE CODE
1. Create a new branch for this issue.
2. Implement the solution step by step, following your plan.
3. Commit your changes incrementally after each step.
4. Open PR request to merge on main branch