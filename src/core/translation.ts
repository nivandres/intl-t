import { Locale } from "../locales";
import { format, injectVariables, match } from "../tools";
import { timeZone, now, hidratation } from "../state";
import { Translation, TranslationSettings, Node, Values, TranslationNode } from "../types";
import { defineProperty, getChildren, getSource } from "./source";

declare global {
  var t: Translation;
  var ts: Translation["settings"];
}

export function createTranslation<L extends Locale, M extends L, T extends Node, V extends Values, P extends string>(
  settings: Partial<TranslationSettings<L, M, T, V, P>> = (globalThis.ts || {}) as {},
): Translation<TranslationSettings<L, M, T, V, string extends P ? "." : P>> {
  const t = {} as Translation;
  createTranslationSettings(settings).allowedLocales.forEach(
    lang =>
      createTranslationNode({
        node: settings.locales?.[lang],
        lang,
        origin: t,
        settings: settings as TranslationSettings,
      }) as Translation[L],
  );
  return (globalThis.t = t[settings.mainLocale as M]) as any;
}

export function createTranslationSettings<S extends TranslationSettings>(
  settings: Partial<S> = globalThis.ts as {},
): S {
  settings.locales ??= settings.allowedLocales?.reduce((o, l) => (((o as any)[l] = undefined), o), {}) || {
    en: undefined as any,
  };
  settings.allowedLocales ??= Object.keys(settings.locales);
  settings.mainLocale ??= settings.defaultLocale ?? settings.locale ?? settings.allowedLocales[0];
  settings.allowedLocale ??= settings.mainLocale;
  settings.tree = settings.locales[settings.mainLocale];
  settings.injectVariables ??= injectVariables;
  settings.matchLocale ??= match.bind(settings);
  settings.hidratation ??= hidratation;
  settings.now ??= now;
  settings.timeZone ??= timeZone;
  settings.formatOptions ??= {};
  settings.format = { ...format, now: settings.now, timeZone: settings.timeZone };
  settings.ps ??= ".";
  return (globalThis.ts = settings as S);
}

function createTranslationNode<N extends TranslationNode>({
  node,
  global: g,
  parent,
  origin = parent,
  settings = parent?.settings ?? ({} as N["settings"]),
  lang = parent?.lang ?? settings?.mainLocale,
  key,
  path = (key ? [...(parent?.path ?? []), key] : []) as N["path"],
  children = getChildren(node as Node) as [],
}: {
  node?: N["node"];
  settings?: N["settings"];
  children?: N["children"];
  global?: N["global"];
  parent?: N["parent"];
  origin?: any;
  lang?: N["lang"];
  key?: N["key"];
  path?: N["path"];
}): N {
  const t: N & Record<`__${string}`, any> = typeof node !== "object" ? Object(node) : get;
  t.children ??= children;
  t.__children__ = children;
  t.t = t;
  t.tr = t;
  t.g = g ?? t;
  t.global = t.g;
  t.settings = settings;
  t.origin = origin;
  t.lang = lang;
  t.path = path;
  t.key = key ?? lang ?? "en";
  t.id = path.join(settings.ps) as N["id"];
  t.child = t.children?.[0] as N["child"];
  t.node = node as Node;
  t.locales = settings.allowedLocales;
  t.locale = lang;
  t.mainLocale = settings.mainLocale;
  t.main = settings.mainLocale;
  t.__isGlobal__ = t.g === t;
  t.__obj__ = t;
  t.__values__ = (node as N)?.values ?? {};
  t.__tree__ = {};
  t.__lang__ = { [lang]: node && t };
  t.__source__ = new Set();
  t.use = use as any;
  t.useTranslation = get as any;
  t.get = get as any;
  t.getTranslation = get as any;
  t.addChild = addChild as any;
  t.search = get as any;
  t.parent = parent ?? (lang === t.main ? t : origin[settings.mainLocale]);
  t.p = t.parent;
  t.dir = t.parent?.dir ?? "ltr";
  t.setLang = (l: any) => origin?.setLang?.(l);
  t.getSource = getSource.bind(t, t as Node);
  t.useLocale = () => [t.lang, t.setLang] as any;
  t.Translation = () => t.base;
  t.Tr = t.Translation;
  t.format = { ...settings.format, locale: lang };
  Object.defineProperty(t, "src", {
    get() {
      return t.getSource();
    },
  });
  if (typeof node !== "object") {
    t.type = "base";
    t.base = node || t.id;
    t.raw = node as string;
    t.__base__ = node as string;
  } else if (Array.isArray(node)) {
    t.type = "list";
    t.keys = t.children as N["keys"];
  } else {
    t.type = "tree";
    t.__base__ = (node as any).base;
    t.raw = t.__base__;
    if (t.__base__)
      Object.defineProperty(t, "base", {
        get() {
          return t.use().__base__;
        },
        set(base: string) {
          t.__base__ = base;
        },
      });
  }
  if (t.__isGlobal__) {
    t.values = Object.assign(t.__values__, settings.variables);
    t.variables = t.values as any;
    origin[lang] = t;
  } else {
    const v = {
      configurable: true,
      enumerable: true,
      get() {
        return { ...t.parent?.values, ...t.__values__ };
      },
      set(newValues: Values) {
        Object.assign(t.__values__, newValues);
      },
    } as PropertyDescriptor;
    Object.defineProperties(t, { values: v, variables: v });
  }
  settings.allowedLocales.forEach(locale => {
    const o = t.__isGlobal__ ? origin?.[locale] : origin?.__lang__?.[locale]?.[key];
    if (o?.node) {
      t.__lang__[locale] ??= o;
      t.node && (o.__lang__[lang] ??= t);
      o.p ??= o.parent ??= origin[settings.mainLocale];
    }
    t.__lang__[locale]
      ? (t[locale] = t.__lang__[locale])
      : defineProperty(t, locale, () => {
          if (t.__isGlobal__) {
            const node = settings.getSource?.(locale) as Node;
            if (node && origin) {
              const fn = (node: Node) =>
                (origin[locale] = createTranslationNode({ node, settings, lang: locale, origin }) as any);
              if (node instanceof Promise) node.then(fn);
              else fn(node);
            }
          }
          return (t.__lang__[locale] ||=
            (t.__isGlobal__ ? origin?.[locale] : origin?.[locale]?.[key as any])?.use(t.values) || t);
        });
  });
  function use(values?: Values): any {
    values && Object.assign(t.__values__ || t.values, values);
    if (!(t.__base__ || t.base)) return t;
    values = t.values || t.__values__;
    const __last__ = Object.values(values).join();
    if (t.__last__ === __last__) return t;
    settings.locale = lang;
    t.base = settings.injectVariables(t.raw as string, values, settings) as string;
    t.__last__ = __last__;
    t.__t__ = Object.defineProperties(
      Object(t.base || t.__base__),
      Object.entries(Object.getOwnPropertyDescriptors(t)).reduce(
        (obj, [key, value]) => (value.writable === false ? null : (obj[key] = value), obj),
        {} as Record<string, PropertyDescriptor>,
      ),
    );
    return (t.t = t.__t__), (t.tr = t.__t__);
  }
  function get(...path: any[]) {
    const variables = path.at(-1)?.__proto__ === Object.prototype ? (path.pop() as Values) : undefined;
    if (typeof path[0] === "object") path = path[0];
    else if (path.length === 1) path = (path[0] as string).trim().split(settings.ps);
    return path.reduce((o, key) => o[key] ?? o, variables ? t.use(variables) : t);
  }
  settings.plugins?.forEach(plugin => plugin(t));
  function addChild(child: keyof N["node"], src: Node, arr?: any[]) {
    const childNode = createTranslationNode({
      node: arr ? (node?.[child] as Node) : src,
      settings,
      parent: t,
      key: child,
      global: t.g,
    });
    t.__tree__[child] = childNode.node && childNode;
    if (t[child]) delete t[child];
    if (childNode.base)
      Object.defineProperty(t, child, {
        configurable: true,
        get() {
          childNode.use();
          return childNode.__obj__.t;
        },
      });
    else t[child] = childNode as any;
  }
  children?.forEach(addChild);
  return t as N;
}
