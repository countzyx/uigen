import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

const STR_REPLACE_VERBS: Record<string, [string, string]> = {
  create: ["Creating", "Created"],
  str_replace: ["Editing", "Edited"],
  insert: ["Editing", "Edited"],
  view: ["Reading", "Read"],
  undo_edit: ["Reverting", "Reverted"],
};

const FILE_MANAGER_VERBS: Record<string, [string, string]> = {
  rename: ["Renaming", "Renamed"],
  delete: ["Deleting", "Deleted"],
};

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>,
  isDone: boolean
): string {
  const path = typeof args?.path === "string" ? args.path : null;
  const command = typeof args?.command === "string" ? args.command : null;

  let verbs: [string, string] | undefined;
  if (toolName === "str_replace_editor") {
    verbs = STR_REPLACE_VERBS[command ?? ""] ?? STR_REPLACE_VERBS.str_replace;
  } else if (toolName === "file_manager") {
    verbs = FILE_MANAGER_VERBS[command ?? ""] ?? FILE_MANAGER_VERBS.rename;
  }

  if (!verbs) {
    return toolName;
  }

  const verb = isDone ? verbs[1] : verbs[0];
  return path ? `${verb} ${path}` : verb;
}

interface ToolCallBadgeProps {
  tool: ToolInvocation;
}

export function ToolCallBadge({ tool }: ToolCallBadgeProps) {
  const isDone = tool.state === "result";
  const label = getToolLabel(
    tool.toolName,
    tool.args as Record<string, unknown>,
    isDone
  );

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
