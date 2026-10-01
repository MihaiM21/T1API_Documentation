/**
 * A tiny, dependency-free syntax highlighter.
 *
 * It returns plain tokens that React renders as text nodes inside <span>s —
 * never HTML strings — so there is nothing to sanitise and no
 * dangerouslySetInnerHTML anywhere in the docs.
 */
export type TokenType =
  | "comment"
  | "string"
  | "key"
  | "number"
  | "keyword"
  | "literal"
  | "fn"
  | "flag"
  | "var"
  | "punct"
  | "plain"

export interface Token {
  type: TokenType
  text: string
}

type Rule = [TokenType, RegExp]

const JS_KW =
  "const|let|var|function|return|if|else|for|while|of|in|await|async|import|from|export|default|new|try|catch|throw|class|extends|typeof|as|interface|type"
const PY_KW =
  "def|return|if|elif|else|for|while|in|import|from|as|with|try|except|raise|class|lambda|pass|not|and|or|is|async|await|yield|print"

const rules: Record<string, Rule[]> = {
  json: [
    ["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ["key", /"(?:[^"\\\n]|\\.)*"(?=\s*:)/y],
    ["string", /"(?:[^"\\\n]|\\.)*"/y],
    ["number", /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y],
    ["literal", /\b(?:true|false|null)\b/y],
    ["punct", /[{}[\],:]/y],
  ],
  bash: [
    ["comment", /#[^\n]*/y],
    ["string", /"(?:[^"\\]|\\[\s\S])*"|'[^']*'/y],
    ["var", /\$\{?[A-Za-z_][A-Za-z0-9_]*\}?/y],
    ["flag", /(?<=\s)--?[A-Za-z][\w-]*/y],
    ["keyword", /\b(?:curl|export|echo|jq|python|pip|npm|node|sleep|if|then|fi|for|do|done|while)\b/y],
    ["number", /\b\d+(?:\.\d+)?\b/y],
    ["punct", /[|&;\\><=]/y],
  ],
  python: [
    ["comment", /#[^\n]*/y],
    ["string", /(?:[rbfRBF]{0,2})(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')/y],
    ["keyword", new RegExp(`\\b(?:${PY_KW})\\b`, "y")],
    ["literal", /\b(?:True|False|None)\b/y],
    ["number", /\b\d+(?:\.\d+)?\b/y],
    ["fn", /\b[A-Za-z_][\w]*(?=\()/y],
    ["punct", /[{}()[\],.:=+\-*/<>!]/y],
  ],
  js: [
    ["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ["string", /`(?:[^`\\]|\\[\s\S])*`|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/y],
    ["keyword", new RegExp(`\\b(?:${JS_KW})\\b`, "y")],
    ["literal", /\b(?:true|false|null|undefined)\b/y],
    ["number", /\b\d+(?:\.\d+)?\b/y],
    ["fn", /\b[A-Za-z_$][\w$]*(?=\()/y],
    ["punct", /[{}()[\],.:;=+\-*/<>!?&|]/y],
  ],
  http: [
    ["comment", /#[^\n]*/y],
    ["keyword", /^(?:GET|POST|DELETE|PUT|PATCH)\b/my],
    ["key", /^[A-Za-z-]+(?=:)/my],
    ["number", /\b\d+(?:\.\d+)?\b/y],
    ["string", /"(?:[^"\\\n]|\\.)*"/y],
  ],
}

const aliases: Record<string, string> = {
  ts: "js",
  tsx: "js",
  typescript: "js",
  javascript: "js",
  jsx: "js",
  sh: "bash",
  shell: "bash",
  curl: "bash",
  py: "python",
  jsonc: "json",
  text: "plain",
  txt: "plain",
}

export function highlight(code: string, language: string): Token[] {
  const lang = aliases[language] ?? language
  const set = rules[lang]
  if (!set || code.length > 60_000) return [{ type: "plain", text: code }]

  const out: Token[] = []
  let plain = ""
  let i = 0
  const flush = () => {
    if (plain) out.push({ type: "plain", text: plain })
    plain = ""
  }

  while (i < code.length) {
    let matched = false
    for (const [type, re] of set) {
      re.lastIndex = i
      const m = re.exec(code)
      if (m && m.index === i && m[0].length > 0) {
        flush()
        out.push({ type, text: m[0] })
        i += m[0].length
        matched = true
        break
      }
    }
    if (!matched) {
      plain += code[i]
      i++
    }
  }
  flush()
  return out
}

export const tokenClass: Record<TokenType, string> = {
  comment: "text-muted-foreground/70 italic",
  string: "text-[oklch(0.85_0.12_85)]",
  key: "text-[oklch(0.78_0.12_235)]",
  number: "text-[oklch(0.8_0.13_150)]",
  keyword: "text-[oklch(0.75_0.17_330)]",
  literal: "text-[oklch(0.78_0.15_40)]",
  fn: "text-[oklch(0.85_0.1_200)]",
  flag: "text-[oklch(0.8_0.12_200)]",
  var: "text-[oklch(0.82_0.12_300)]",
  punct: "text-foreground/50",
  plain: "",
}
