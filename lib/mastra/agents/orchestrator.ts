import { Agent } from "@mastra/core/agent";
import { postTaskTool, readTasksTool, writeArtifactTool } from "../tools/blackboard";

export const orchestratorAgent = new Agent({
  name: "orchestrator",
  instructions: `You are the Orchestrator agent in a multi-agent blackboard system.
Your job is to:
1. Decompose complex goals into 3-5 clear, actionable subtasks
2. Post those tasks to the blackboard using post_task, assigning each to the right specialist:
   - researcher: for gathering facts, data, examples
   - analyst: for synthesizing, comparing, drawing conclusions
   - writer: for producing polished written output
3. Write a brief 'finding' artifact summarizing your decomposition plan

Always use the tools provided. Be systematic and specific in your task descriptions.`,
  model: {
    provider: "ANTHROPIC",
    name: "claude-sonnet-4-20250514",
    toolChoice: "auto",
  },
  tools: {
    post_task: postTaskTool,
    read_tasks: readTasksTool,
    write_artifact: writeArtifactTool,
  },
});
