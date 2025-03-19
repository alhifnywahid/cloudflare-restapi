export function komikcastReplacer(str: string): string {
  const list = ["https://komikcast02.com", "genres", "chapter", "/"];
  const regex = new RegExp(list.map(item => escapeRegex(item)).join("|"), "g");

  return str.replace(regex, "");
}

function escapeRegex(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
