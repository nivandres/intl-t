import { Locale } from "../locales";
import { injectVariables } from "../tools/inject";
import { Translation, TranslationSettings, Node, Values, TranslationNode, Key, invalidKeys } from "./types";

function createTranslationNode<N extends TranslationNode>(context: {
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
  const {
    node = {} as N,
    global: g,
    parent,
    origin = parent,
    settings = parent?.settings ?? ({} as N["settings"]),
    lang = parent?.lang ?? settings?.mainLocale,
    key,
    path = (key ? [...(parent?.path ?? []), key] : []) as N["path"],
    children = typeof node === "object"
      ? ((node as Partial<N>).children ??= Object.keys(node).filter(
          key => !invalidKeys.includes(key as any) && (typeof node === "string" ? isNaN(key as any) : true)
        ) as N["children"])
      : [],
  } = context;

  const t: N = typeof node !== "object" ? Object(node) : get;
  t.children ??= children;
  t.t = t;
  t.tr = t;
  t.g = g ?? t;
  t.global = t.g;
  t.p = t.parent;
  t.settings = settings;
  t.origin = origin;
  t.lang = lang;
  t.path = path;
  t.key = key ?? lang ?? "en";
  t.id = path.join(settings.ps) as N["id"];
  t.child = t.children?.[0] as N["child"];
  t.node = node;
  t.locales = settings.allowedLocales;
  t.locale = lang;
  t.mainLocale = settings.mainLocale;
  t.main = settings.mainLocale;
  t.toString = () => String(t.base);
  t.__obj__ = t;
  t.__values__ = (node as N).values ?? {};
  t.__tree__ = {};
  t.use = use as any;
  t.get = get as any;
  t.search = get as any;
  t.parent = parent ?? (lang === t.main ? t : origin[settings.mainLocale]);
  t.p = t.parent;

  if (typeof node !== "object") {
    t.type = "base";
    t.base = node as string;
    t.raw = node as string;
    t.__base__ = node as string;
  } else if (Array.isArray(node)) {
    t.type = "list";
    t.keys = t.children as N["keys"];
  } else {
    t.type = "tree";
    t.__base__ = (node as N).base;
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

  if (t.g === t) {
    t.values = t.__values__;
    t.variables = t.__values__;
    t[lang] = t;
    settings.allowedLocales.forEach(locale => {
      t[locale] ??= origin[locale];
      const o = origin?.[locale];
      if (o) {
        o[lang] ??= t;
        o.parent ??= lang === t.main ? t : origin[settings.mainLocale];
        o.p ??= origin[locale].parent;
      }
    });
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
    settings.allowedLocales.forEach(locale =>
      lang === locale
        ? (t[lang] = t)
        : Object.defineProperty(t, locale, {
            get() {
              return origin?.[locale]?.[key]?.use(t.values);
            },
          })
    );
  }

  function use(values?: Values): any {
    if (!(t.__base__ || t.base)) return values && (t.values = values), t;
    values = t.values;
    const __last__ = Object.values(values).join();
    if (t.__last__ === __last__) return t;
    t.base = injectVariables(t.raw as string, values);
    t.__last__ = __last__;
    if (t.type === "base")
      return (
        (t.t = Object.defineProperties(
          Object(t.__base__ || t.base),
          Object.entries(Object.getOwnPropertyDescriptors(t)).reduce(
            (obj, [key, value]) => (value.writable === false ? null : (obj[key] = value), obj),
            {} as Record<string, PropertyDescriptor>
          )
        )),
        (t.tr = t.t)
      );
    return t;
  }
  function get(...path: any[]) {
    const variables = path.at(-1)?.__proto__ === Object.prototype ? (path.pop() as Values) : undefined;
    if (typeof path[0] === "object") path = path[0];
    else if (path.length === 1) path = (path[0] as string).split(settings.ps);
    const o = path.reduce((o, key) => o[key] ?? o, t);
    return variables ? o.use(variables) : o;
  }

  children?.forEach(child => {
    const childNode = createTranslationNode({
      node: node[child],
      settings,
      parent: t,
      key: child,
      global: t.g,
    });
    t.__tree__[child] = childNode;
    if (childNode.type === "base")
      Object.defineProperty(t, child, {
        configurable: true,
        get() {
          childNode.use();
          Object.defineProperty(this, child, {
            get() {
              return childNode.__obj__.t;
            },
          });
          return childNode.__obj__.t;
        },
      });
    else t[child] = childNode as any;
  });

  return t as N;
}

export function createTranslation<
  L extends Locale,
  M extends L,
  T extends Node,
  V extends Values,
  S extends TranslationSettings<L, M, T, V, P>,
  P extends string = "."
>(_settings: Partial<TranslationSettings<L, M, T, V, P>>): Translation<S> {
  const settings = _settings as S;
  const t = {} as Translation<S>;
  settings.locales ??= { en: {} } as any;
  settings.allowedLocales ??= Object.keys(settings.locales) as L[];
  settings.mainLocale ??= settings.allowedLocales[0] as M;
  settings.allowedLocale ??= settings.mainLocale;
  settings.tree = settings.locales[settings.mainLocale] as T;
  settings.ps ??= "." as P;
  settings.allowedLocales.forEach(lang => {
    t[lang] ??= createTranslationNode({
      node: settings.locales[lang],
      lang,
      origin: t,
      settings,
    }) as unknown as Translation<S>[L];
  });
  return t[settings.mainLocale] as Translation<S>;
}
