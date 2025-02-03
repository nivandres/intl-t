import { Values } from "../types";
import { format } from "./format";
import { State } from "../state";

export function nested(content: string) {
  const matches = content.matchAll(/(?<!`)({|})/g);
  let open = 0;
  let startIndex: number | undefined;
  for (const { index, 0: match } of matches) {
    if (match == `{`) open++ == 0 && (startIndex = index);
    else if (--open == 0 ? true : open < 0 && (open = 0))
      return { value: content.slice(startIndex, index + 1), index: startIndex, offset: index };
  }
  return null;
}

const variableRegex =
  /{{?(\w+|(?:\(.*?\)|[=+!><\-&|%*/?:#\w]|{\w+}|".*?"|'.*?')+)\s*(?:[,\.;]+\s*(\w+)\s*)?(?:[,\.;]+(.*))?}}?/s;
const instructionsRegex =
  /(?:(?<t>(?<k>\w+))|(?<kn>'|")(?<k>.*?)(?<!`)\k<kn>|(?<k>(?:[=+!><\-&|%*/?:]*(?:#|\(.*?\)|\w+|{\w+}|(?<kn>'|").*?(?<!`)\k<kn>|\[.*?\]))+))(?:[\s=>]|:(?!:\w))*(?:(?<=[\s:=>])(?<t_>(?<v>[\w\#]+))(?=$|[,\s;])|(?<vn>'|")(?<v>.*?)(?<!`)\k<vn>|(?<v>{.*(?<!`)(?<vn>})))|:?:?(?<t>(?<k>\w+))(?:[\\/](?<t_>(?<v>\w+))|\((?:(?<t_>(?<v>\w+))|(?<vn>'|")(?<v>.*?)(?<!`)\k<vn>)\))?/s;
const instructionRegex = /{(.*)}/s;

export function instructionsMatch(content: string) {
  const instructions = [] as RegExpMatchArray[];
  let match: RegExpMatchArray | null;
  while ((match = content.match(instructionsRegex))) {
    const { groups, index = 0 } = match;
    if (groups?.vn == "}") {
      const { value, offset } = nested(groups.v) as { value: string; offset: number };
      content = content.slice(match[0].indexOf(groups.v) + index + offset);
      groups.v = value.match(instructionRegex)?.[1] || value;
    } else content = content.slice(index + match[0].length);
    instructions.push(match);
  }
  return instructions;
}

// @ts-ignore
export function injectVariables(content: string = "", variables: Values = {}, state: State = this || {}) {
  const { formatFallback = "", formatOptions } = state;
  let match: RegExpMatchArray | null | undefined;
  const matches = new Set();
  while ((match = nested(content)?.value.match(variableRegex))) {
    let [target, key = formatFallback, action = "", instruction = action] = match;
    if (matches.has(target)) break;
    matches.add(target);
    if (formatFallback) key = key.replace(/#+/g, formatFallback);
    let variable;
    if (!key.match(/^\w+$/)) {
      const k = key.match(/\w+/)?.[0] ?? formatFallback;
      key
        .matchAll(/{(\w+)}|(\w+)/g)
        .forEach(([i, _, v = _]) => v in variables && (key = key.replace(i, JSON.stringify(variables[v]))));
      variable = eval(key);
      key = k;
    } else variable = variables[key];
    let value;
    if (variable === undefined) break;
    else if (typeof variable === "string" && !isNaN(variable as any)) variable = Number(variable);
    const options = { ...formatOptions } as Record<string, any>;
    const instructions = instructionsMatch(instruction).map(({ groups = {} }) => {
      const { k: name, v: val, t, t_ } = groups;
      action += "\n" + (t || "") + "\n" + (t_ || "");
      options[name] = val;
      return { name, val };
    });
    switch (true) {
      case typeof variable === "function" || /^(react|chunk)s?$/im.test(action):
        value = `<${key} ${instruction}/>`;
        break;
      case Array.isArray(variable):
        value = format.list(variable as string[], options, state);
        break;
      case /^(time)?(relativ[eoa]|remain(ing)?)s?(time?)?$/im.test(action):
        value = format.relative(variable, options, state);
        break;
      case variable instanceof Date || /^(time|now|hou?ra?|tiempo|today|date|fecha)s?$/im.test(action):
        if (action.match(/^(short|sm)$/im)) options.style = "short";
        else if (action.match(/^(medium|md)$/im)) options.style = "medium";
        else if (action.match(/^(long|lg)$/im)) options.style = "long";
        else if (action.match(/^(full)$/im)) options.style = "full";
        if (!options.timeStyle && /^(time|now|tiempo|hou?ra?)s?$/im.test(action))
          options.timeStyle = options.style || "short";
        else options.dateStyle ??= options.style || "medium";
        variable = variable instanceof Date ? variable : new Date(variable as string);
        value = format.date(variable, options, state);
        break;
      default:
        for (let { name, val } of instructions) {
          try {
            if (
              variable == name.match(/^=?(?<k>'|")(.*)(?<!`)\k<k>$/)?.[1] ||
              (/[^\w\s]/.test(name)
                ? ((name = name.replace(/(?<![=<>&|!])([=&|])(?![=&|])/g, "$1$1")),
                  (name = name.replace(/(?<=[|&])(?=[=<>])/g, "#")),
                  /^[^\w\#"'({`\[\]]/.test(name) ? (name = `#${name}`) : null,
                  (name = name.replaceAll("#", JSON.stringify(variable))),
                  name
                    .matchAll(/{(\w+)}|\0/g)
                    .forEach(([i, v]) => (name = name.replace(i, JSON.stringify(variables[v])))),
                  eval(name))
                : name == variable) ||
              /^(ot(her|r[ao])|alway)s?$/im.test(name) ||
              (variable
                ? /^(yea?[hs]?|y[ue]p|true?|s[íi].?|[sytv])$/im.test(name)
                : /^(no.?|false?|[nf])$/im.test(name)) ||
              (typeof variable === "number"
                ? (variable == 0 && /^([zc]ero|draw|tie|tabl[ea])s?$/i.test(name)) ||
                  (variable == 1 && /^(one|[ui]nit)s?$/i.test(name)) ||
                  (variable == 2 && /^(two|pai?r|du(ale?|o))s?$/i.test(name)) ||
                  (variable > 3 && /^(many|a? *lot|much[ao]?)s?$/i.test(name)) ||
                  (variable == 3 && /^(thre+|tre|trio?)s?$/i.test(name)) ||
                  (variable < 5 && /^(paucal|vario|alguno|cuanto)s?$/i.test(name)) ||
                  (variable > 1 && /^(few|a? *little|poc[ao]|paucal)s?$/i.test(name)) ||
                  (variable > 0 && /^(surplu|debit|profit|worth)s?$/i.test(name)) ||
                  (variable < 0 && /^(deficit|lose?|de(bt|uda?)|credito?)s?$/i.test(name))
                : false)
            ) {
              value = val;
              break;
            }
          } catch {}
        }
        if (typeof variable === "number") {
          if (options.offset) variable -= options.offset;
          if (options.scale) variable *= options.scale;
          if (action.match(/\bint/i)) variable = Math.floor(variable);
          if (
            (/^(currenc[yi]e?|cashe?|dinero|bill|money|price|coin|monto)s?$/im.test(action) &&
              ((options.style = "currency"), (options.currency ??= "USD"))) ||
            (/^(n.m(ero|ber)|digit|c.(pher|fra)|quantit[iy]e?|cantidad)s?$/im.test(action) &&
              (options.style = "number")) ||
            (/^(p[eo]rcent.*|rati?[eo]|taxe?)s?$/im.test(action) && (options.style = "percent"))
          )
            variable = format.currency(variable, options, state);
        }
        value?.includes("{") &&
          (value = injectVariables(value, variables, { ...state, formatOptions: options, formatFallback: key }));
        break;
    }
    value = value?.replace(/(?<!`)#/, String(variable)) ?? variable;
    content = content.replaceAll(target, String(value));
  }
  return content.replace(/`(.)/, "$1");
}
