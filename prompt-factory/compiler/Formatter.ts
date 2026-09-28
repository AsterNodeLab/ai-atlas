/**
 * Final text cleanup: consistent "\n" line endings, no trailing spaces, at most
 * one blank line in a row (outside code fences) and no leading/trailing blank
 * lines. Empty sections never reach this point (they are pruned from the
 * document model), so the formatter never has to guess about content.
 */
export function formatPrompt(prompt: string): string {
  const lines = prompt.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let fence: string | undefined;
  let blankRun = 0;

  for (const raw of lines) {
    const line = raw.replace(/[ \t]+$/, "");
    const marker = /^(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = marker;
      else if (line === fence) fence = undefined;
    }
    if (!fence && line === "") {
      blankRun += 1;
      if (blankRun > 1) continue;
    } else {
      blankRun = 0;
    }
    out.push(line);
  }
  return out.join("\n").replace(/^\n+|\n+$/g, "");
}
