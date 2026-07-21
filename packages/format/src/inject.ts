import { ev } from "@intl-t/format/eval";
import { format } from "@intl-t/format/formatters";
import { globalState, type FormatOptions } from "@intl-t/format/state";
import type { Values, Content, Variables } from "@intl-t/format/types";

export { ev };

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

export const variableRegex = /{{?(\w+|(?:\(.*?\)|[=+!><\-&|%*/?:#\w]|{\w+}|".*?"|'.*?')+)\s*(?:[,.;]+\s*(\w+)\s*)?(?:[,.;]+(.*))?}}?/s;
export const instructionsRegex =
  /(?:(?<t1>(?<k1>\w+))|(?<kn1>'|")(?<k2>.*?)(?<!`)\k<kn1>|(?<k3>(?:[=+!><\-/&|%*/?:]*(?:#|\(.*?\)|\w+|{\w+}|(?<kn2>'|").*?(?<!`)\k<kn2>|\[.*?\]|\/.*?\/w*))+))(?:[\s=>]|:(?!:\w))*(?:(?<=[\s:=>])(?<t_1>(?<v1>[\w#+-]+))(?=$|[,\s;])|(?<vn1>'|")(?<v2>.*?)(?<!`)\k<vn1>|(?<v3>{.*(?<!`)(?<vn2>})))|:?:?(?<t2>(?<k4>\w+))(?:[\\/](?<t_2>(?<v4>[\w.,+-]+))|\((?:(?<t_3>(?<v5>\w+))|(?<vn3>'|")(?<v6>.*?)(?<!`)\k<vn3>)\))?/s;
const instructionRegex = /{(.*)}/s;

export function instructionsMatch(content: string) {
  const instructions = [] as RegExpMatchArray[];
  let match: RegExpMatchArray | null;
  while ((match = content.match(instructionsRegex))) {
    const { groups = {}, index = 0 } = match;
    for (let k of ["k", "v", "t", "kn", "vn", "tn"]) for (let i = 1; !groups[k] && i <= 6; i++) groups[k] ??= groups[k + i]!;
    if (groups?.vn == "}") {
      const { value, offset } = nested(groups.v!) as { value: string; offset: number };
      content = content.slice(match[0].indexOf(groups.v!) + index + offset);
      groups.v = value.match(instructionRegex)?.[1] || value;
    } else content = content.slice(index + match[0].length);
    instructions.push(match);
  }
  return instructions;
}

export interface InjectOptions extends Record<string, any> {
  fallback?: string;
  onMissingVariable?: "keep" | "empty" | ((name: string, target: string) => any);
  evaluator?: typeof ev;
}
export function injectVariables<T extends string, V extends Values>(
  content: T = "" as T,
  variables: Partial<Variables<T>> & V = {} as any,
  formatOptions: FormatOptions = this || {},
) {
  if (!content || !variables || !(content.includes("{") || content.includes("`"))) return content as never;
  const {
    fallback = "",
    onMissingVariable = "keep",
    locale = globalState.locale,
    enabledEval,
    evaluator = ev,
  } = formatOptions as InjectOptions;
  let match: RegExpMatchArray | null | undefined;
  const matches = new Set();
  let cursor = 0;
  while ((match = nested(content.slice(cursor))?.value.match(variableRegex))) {
    let [target, key = fallback as string, action = "", instruction = action] = match;
    if (matches.has(target)) {
      cursor += content.slice(cursor).indexOf(target) + target.length;
      continue;
    }
    matches.add(target);
    if (fallback) key = key.replace(/#+/g, fallback);
    let v;
    if (!key.match(/^\w+$/)) {
      const k = key.match(/\w+/)?.[0] ?? fallback;
      [...key.matchAll(/{(\w+)}|(\w+)/g)].forEach(
        ([i, _, v = _]) => v in variables && (key = key.replace(i, JSON.stringify(variables[v]))),
      );
      v = evaluator?.(key, enabledEval);
      key = k;
    } else v = variables[key];
    let value;
    if (v === undefined) {
      if (typeof onMissingVariable === "function") v = onMissingVariable(key, target);
      else {
        if (onMissingVariable !== "keep") content = content.replaceAll(target, "") as T;
        else cursor += content.slice(cursor).indexOf(target) + target.length;
        continue;
      }
    }
    const options = { ...formatOptions } as any;
    const instructions = instructionsMatch(instruction).map(({ groups = {} }) => {
      const { k: name, v: val, t, t_ } = groups;
      action += "\n" + (t || "") + "\n" + (t_ || "");
      options[name] = val;
      return { name, val };
    });
    action += `\n${key}`;
    switch (true) {
      case typeof v === "function" || /^(react|chunk)s?$/im.test(action):
        value = `<${key} ${instruction}/>`;
        break;
      case Array.isArray(v):
        value = format.list(v as string[], options, locale);
        break;
      case /^(time)?(relativ[eoa]|remain(ing)?)s?(time?)?$/im.test(action):
        value = format.relative(v, options, locale);
        break;
      case v instanceof Date ||
        (/^(time|now|hou?ra?|tiempo|today|date|fecha)s?$/im.test(action) &&
          (isNaN(new Date(v as string).getTime()) ? false : ((v = new Date(v as string)), true))):
        if (action.match(/^(short|sm)$/im)) options.style = "short";
        else if (action.match(/^(medium|md)$/im)) options.style = "medium";
        else if (action.match(/^(long|lg|verbose)$/im)) options.style = "long";
        else if (action.match(/^(full|xl)$/im)) options.style = "full";
        if (/^verbose$/im.test(action)) ((options.timeStyle ??= options.style), (options.dateStyle ??= options.style));
        else if (!options.timeStyle && !/^(date|fecha|today)s?$/im.test(action) && /^(time|now|tiempo|hou?ra?)s?$/im.test(action))
          options.timeStyle = options.style || "short";
        else options.dateStyle ??= options.style;
        value = format.date(v, options, locale);
        break;
      default:
        for (let { name, val } of instructions) {
          try {
            if (
              v == name.match(/^=?(?<k>'|")(.*)(?<!`)\k<k>$/)?.[2] ||
              (/[^\w\s]/.test(name)
                ? ((name = name.replace(/(?<![=<>&|!])([=&|])(?![=&|])/g, "$1$1")),
                  /\/.+\/\w*$/.test(name) && (name += ".test(String(#))"),
                  (name = name.replace(/(?<=[|&])(?=[=<>])/g, "#")),
                  /^[^\w#"'/({`[\]]/.test(name) ? (name = `#${name}`) : null,
                  (name = name.replaceAll("#", JSON.stringify(v))),
                  [...name.matchAll(/{(\w+)}/g)].forEach(([i, v]) => (name = name.replace(i, JSON.stringify(variables[v])))),
                  evaluator?.(name))
                : name == v) ||
              /^(ot(her|r[ao])|alway)s?$/im.test(name) ||
              (v ? /^(yea?[hs]?|y[ue]p|true?|s[íi].?|[sytv])$/im.test(name) : /^(no.?|false?|[nf])$/im.test(name)) ||
              (typeof v === "number" || !isNaN(v)
                ? (v == 0 && /^([zc]ero|draw|tie|tabl[ea])s?$/i.test(name)) ||
                  (action.includes("ordinal") &&
                    String(v).match(
                      /^(one|uno)s?$/i.test(name)
                        ? /(?<!1)1$/
                        : /^(two|do[zs]e?n?)s?$/i.test(name)
                          ? /2$/
                          : /^(thre+|tre)s?$/i.test(name)
                            ? /3$/
                            : (null as unknown as string),
                    )) ||
                  (v == 1 && /^(one|[ui]nit|uno)s?$/i.test(name)) ||
                  (v == 2 && /^(two|pai?r|du(ale?|o)|do[sz]e?n?)s?$/i.test(name)) ||
                  (v == 3 && /^(thre+|tre|trio?)s?$/i.test(name)) ||
                  (v > 4 && v < Infinity && /^(many|a? *lot|much[ao]?)s?$/i.test(name)) ||
                  (v > 1 && v < 4 && /^(few|a? *little|poc[ao]|paucal)s?$/i.test(name)) ||
                  (v < 5 && /^(paucal|vario|alguno|cuanto)s?$/i.test(name)) ||
                  (v > 0 && /^(surplu|debit|profit|worth)s?$/i.test(name)) ||
                  (v < 0 && /^(deficit|lose?|de(bt|uda?)|credito?)s?$/i.test(name))
                : false)
            ) {
              value = val;
              break;
            }
          } catch {}
        }
        if (typeof v === "number") {
          if (options.offset) v -= options.offset;
          if (options.scale) v *= options.scale;
          if (action.match(/\bint/i)) v = Math.floor(v);
          if (
            (/^(currenc[yi]e?|cashe?|dinero|bill|money|price|coin|monto)s?$/im.test(action) &&
              ((options.style = "currency"), (options.currency ??= "USD"))) ||
            (/^(p[eo]rcent.*|rati?[eo]|taxe?)s?$/im.test(action) && (options.style = "percent")) ||
            (/^(n.m(ero|ber)|digit|decimal|c.(pher|fra)|quantit[iy]e?|cantidad)s?$/im.test(action) && (options.style = "decimal"))
          )
            v = format.number(v, options, locale);
        }
        value?.includes("{") && (value = injectVariables(value as T, variables, options));
        break;
    }
    value = value?.replace(/(?<!`)#/g, String(v)) ?? v;
    content = content.replaceAll(target, () => String(value)) as T;
  }
  return content.replace(/`(.)/g, "$1") as Content<T>;
}

export { injectVariables as inject };
