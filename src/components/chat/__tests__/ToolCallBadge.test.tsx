import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { ToolInvocation } from "ai";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// getToolLabel — str_replace_editor

test("getToolLabel: create shows Creating/Created with full path", () => {
  const args = { command: "create", path: "/components/Card.jsx" };
  expect(getToolLabel("str_replace_editor", args, false)).toBe(
    "Creating /components/Card.jsx"
  );
  expect(getToolLabel("str_replace_editor", args, true)).toBe(
    "Created /components/Card.jsx"
  );
});

test("getToolLabel: str_replace and insert both map to Editing/Edited", () => {
  const replace = { command: "str_replace", path: "/App.jsx" };
  const insert = { command: "insert", path: "/App.jsx" };
  expect(getToolLabel("str_replace_editor", replace, false)).toBe(
    "Editing /App.jsx"
  );
  expect(getToolLabel("str_replace_editor", replace, true)).toBe(
    "Edited /App.jsx"
  );
  expect(getToolLabel("str_replace_editor", insert, false)).toBe(
    "Editing /App.jsx"
  );
  expect(getToolLabel("str_replace_editor", insert, true)).toBe(
    "Edited /App.jsx"
  );
});

test("getToolLabel: view shows Reading/Read", () => {
  const args = { command: "view", path: "/App.jsx" };
  expect(getToolLabel("str_replace_editor", args, false)).toBe("Reading /App.jsx");
  expect(getToolLabel("str_replace_editor", args, true)).toBe("Read /App.jsx");
});

test("getToolLabel: undo_edit shows Reverting/Reverted", () => {
  const args = { command: "undo_edit", path: "/App.jsx" };
  expect(getToolLabel("str_replace_editor", args, false)).toBe(
    "Reverting /App.jsx"
  );
  expect(getToolLabel("str_replace_editor", args, true)).toBe(
    "Reverted /App.jsx"
  );
});

// getToolLabel — file_manager

test("getToolLabel: rename shows Renaming/Renamed", () => {
  const args = { command: "rename", path: "/Old.jsx", new_path: "/New.jsx" };
  expect(getToolLabel("file_manager", args, false)).toBe("Renaming /Old.jsx");
  expect(getToolLabel("file_manager", args, true)).toBe("Renamed /Old.jsx");
});

test("getToolLabel: delete shows Deleting/Deleted", () => {
  const args = { command: "delete", path: "/App.jsx" };
  expect(getToolLabel("file_manager", args, false)).toBe("Deleting /App.jsx");
  expect(getToolLabel("file_manager", args, true)).toBe("Deleted /App.jsx");
});

// getToolLabel — edge cases

test("getToolLabel: missing path falls back to verb alone", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" }, false)).toBe(
    "Creating"
  );
});

test("getToolLabel: streaming partial-call with undefined command defaults to Editing", () => {
  // During the partial-call state args haven't fully streamed in yet, so
  // command may be undefined. This default is intentional, not a regression.
  expect(getToolLabel("str_replace_editor", { path: "/App.jsx" }, false)).toBe(
    "Editing /App.jsx"
  );
});

test("getToolLabel: file_manager with undefined command defaults to Renaming", () => {
  expect(getToolLabel("file_manager", { path: "/App.jsx" }, false)).toBe(
    "Renaming /App.jsx"
  );
});

test("getToolLabel: unknown tool name falls back to raw name", () => {
  expect(getToolLabel("some_other_tool", { path: "/App.jsx" }, false)).toBe(
    "some_other_tool"
  );
});

// ToolCallBadge render

test("ToolCallBadge shows present-tense label and spinner while running", () => {
  const tool = {
    state: "call",
    toolName: "str_replace_editor",
    toolCallId: "1",
    args: { command: "create", path: "/App.jsx" },
  } as ToolInvocation;

  const { container } = render(<ToolCallBadge tool={tool} />);

  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows past-tense label and green dot when done", () => {
  const tool = {
    state: "result",
    toolName: "str_replace_editor",
    toolCallId: "1",
    args: { command: "create", path: "/App.jsx" },
    result: "ok",
  } as ToolInvocation;

  const { container } = render(<ToolCallBadge tool={tool} />);

  expect(screen.getByText("Created /App.jsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
