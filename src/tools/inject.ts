import { Values } from "../types";

const regex = /{{?(\w+)(?:[,;]\s*(\w+))?(?:[,;]((?:[^{}]*(?:{[^{}]*}|)[^{}]*)*))?}}?/g;
const instructionRegex = /(\S*[^:=\s])[\s:=]+(?:[{'"`}]([^{}'"`]*)[}"`']|(\w+))\s*[,;\n]?/gm;

export function injectVariables(content: string = "", variables: Values = {}) {
  const matches = [...content.matchAll(regex)] as RegExpMatchArray[];
  const matchesTarget = new Set();
  if (!matches.length) return content;
  matches.forEach(match => {
    const [target, key, action = "", instruction = action] = match;
    if (matchesTarget.has(target)) return;
    matchesTarget.add(target);
    let variable = variables[key];
    let value;
    if (variable === undefined) {
      if (/^(time|now|tiempo|date|fecha)s?$/i.test(key)) variable = new Date();
      else return;
    } else if (typeof variable === "string" && !isNaN(variable as any)) variable = Number(variable);
    else if (typeof variable === "function") value = `<${key} ${instruction}/>`;
    switch (action) {
      case "react":
        value = `<${key} ${instruction}/>`;
        break;
      default:
        for (let [, name, _, val = _] of [...instruction.matchAll(instructionRegex)]) {
          try {
            if (
              variable == name.match(/=?["'`]([^"'`]*)["'`]/)?.[1] ||
              (/[^\w\d\s]/.test(name)
                ? ((name = name.replace(/([^=<>&|]|^)([=&|])([^=&|])/g, "$1$2$2$3")),
                  (name = name.replace(/([|&])([=<>])/g, "$1#$2")),
                  /^[^\w\d\#"'(`]/.test(name) ? (name = `#${name}`) : null,
                  (name = name.replaceAll("#", JSON.stringify(variable))),
                  eval(name))
                : name == variable) ||
              /^(ot(her|r[ao])|alway)s?$/i.test(name) ||
              (variable
                ? /^(yea?[hs]?|y[ue]p|true?|s[íi].?|[sytv])$/i.test(name)
                : /^(no.?|false?|[nf])$/i.test(name)) ||
              (typeof variable === "number"
                ? (variable == 0 && /^([zc]ero|draw|tie|tabl[ea])s?$/i.test(name)) ||
                  (variable == 1 && /^(one|[ui]nit)s?$/i.test(name)) ||
                  (variable == 2 && /^(two|pai?r|du(ale?|o))s?$/i.test(name)) ||
                  (variable > 3 && /^(many|a? *lot|much[ao]?)s?$/i.test(name)) ||
                  (variable == 3 && /^(trio?|thre+|tre)s?$/i.test(name)) ||
                  (variable > 1 && /^(few|a? *little|poc[ao])s?$/i.test(name)) ||
                  (variable > 0 && /^(surplu|debit|profit|worth)s?$/i.test(name)) ||
                  (variable < 0 && /^(deficit|lose?|de(bt|uda?)|credito?)s?$/i.test(name))
                : false)
            ) {
              value = val;
              break;
            }
          } catch {}
        }
        break;
    }
    value = value?.replaceAll("#", String(variable)) ?? variable;
    content = content.replaceAll(target, String(value));
  });
  return content;
}
