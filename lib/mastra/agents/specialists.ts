import { Agent } from "@mastra/core/agent";
import {
  readTasksTool,
  readArtifactsTool,
  claimTaskTool,
  writeArtifactTool,
  completeTaskTool,
} from "../tools/blackboard";

export const researcherAgent = new Agent({
  name: "researcher",
  instructions: `You are the Researcher agent in a multi-agent blackboard system.
Your job is to:
1. Read open tasks assigned to "researcher" using read_tasks
2. Claim each task using claim_task
3. Research the topic thoroughly and write detailed 'finding' artifacts using write_artifact
4. Be specific, factual, and comprehensive in your findings
5. Mark tasks complete with complete_task after writing findings

Focus on gathering facts, examples, data, and evidence. Cite your reasoning clearly.`,
  model: {
    provider: "ANTHROPIC",
    name: "claude-sonnet-4-20250514",
    toolChoice: "auto",
  },
  tools: {
    read_tasks: readTasksTool,
    read_artifacts: readArtifactsTool,
    claim_task: claimTaskTool,
    write_artifact: writeArtifactTool,
    complete_task: completeTaskTool,
  },
});

export const analystAgent = new Agent({
  name: "analyst",
  instructions: `You are the Analyst agent in a multi-agent blackboard system.
Your job is to:
1. Read 'finding' artifacts from the blackboard using read_artifacts
2. Read tasks assigned to "analyst" using read_tasks
3. Synthesize and analyze the findings to draw conclusions
4. Write 'analysis' artifacts using write_artifact
5. Look for patterns, contradictions, and key insights across findings

Focus on synthesis, critical thinking, and structured analysis. Connect the dots between findings.`,
  model: {
    provider: "ANTHROPIC",
    name: "claude-sonnet-4-20250514",
    toolChoice: "auto",
  },
  tools: {
    read_tasks: readTasksTool,
    read_artifacts: readArtifactsTool,
    claim_task: claimTaskTool,
    write_artifact: writeArtifactTool,
    complete_task: completeTaskTool,
  },
});

export const writerAgent = new Agent({
  name: "writer",
  instructions: `You are the Writer agent in a multi-agent blackboard system.
Your job is to:
1. Read all 'finding' and 'analysis' artifacts using read_artifacts
2. Read tasks assigned to "writer" using read_tasks
3. Produce a final, polished 'final' artifact that fulfills the original goal
4. Make the output comprehensive, well-structured, and immediately usable

Focus on clarity, structure, and professional quality. Your output is what the human will actually use.`,
  model: {
    provider: "ANTHROPIC",
    name: "claude-sonnet-4-20250514",
    toolChoice: "auto",
  },
  tools: {
    read_tasks: readTasksTool,
    read_artifacts: readArtifactsTool,
    claim_task: claimTaskTool,
    write_artifact: writeArtifactTool,
    complete_task: completeTaskTool,
  },
});
