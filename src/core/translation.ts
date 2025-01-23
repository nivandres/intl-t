import { Locale } from "../locales";
import { injectVariables } from "../tools/inject";
import {
  Translation,
  TranslationSettings,
  Node,
  Values,
  TranslationNode,
  invalidKeys,
  TranslationPlugin,
  Complexity,
  Complex,
} from "../types";

export function createTranslation<
  L extends Locale,
  M extends L,
  T extends Node,
  V extends Values,
  P extends string,
  C extends Complexity
>(
  settings: Partial<TranslationSettings<L, M, T, V, P, C>>
): Translation<TranslationSettings<L, M, T, V, string extends P ? "." : P, Complexity extends C ? Complex : C>> {
  const t = {} as Translation;
  createTranslationSettings(settings).allowedLocales.forEach(
    lang =>
      createTranslationNode({
        node: settings.locales?.[lang],
        lang,
        origin: t,
        settings: settings as TranslationSettings,
      }) as Translation[L]
  );
  return t[settings.mainLocale as M] as any;
}

export function createTranslationSettings<S extends TranslationSettings>(settings: Partial<S>): S {
  settings.locales ??= { en: {} };
  settings.allowedLocales ??= Object.keys(settings.locales);
  settings.mainLocale ??= settings.allowedLocales[0];
  settings.allowedLocale ??= settings.mainLocale;
  settings.tree = settings.locales[settings.mainLocale];
  settings.injectVariables ??= injectVariables;
  settings.ps ??= ".";
  return settings as S;
}

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
      ? (Object.keys(node).filter(
          key => !invalidKeys.includes(key as any) && (typeof node === "string" ? isNaN(key as any) : true)
        ) as N["children"])
      : [],
  } = context;
  const t: N & Record<`__${string}`, any> = typeof node !== "object" ? Object(node) : get;
  t.children ??= children;
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
  t.with = w.bind(t) as any;
  t.search = get as any;
  t.parent = parent ?? (lang === t.main ? t : origin[settings.mainLocale]);
  t.p = t.parent;
  t.setLang = t.g.setLang || (l => (t.lang = l));
  t.setVariables = t.setValues;
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
    t.values = Object.assign(t.__values__, settings.variables);
    t.variables = t.values as any;
    origin[lang] = t;
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
    values && (t.values = values);
    if (!(t.__base__ || t.base)) return t;
    values = t.values;
    const __last__ = Object.values(values).join();
    if (t.__last__ === __last__) return t;
    t.base = settings.injectVariables(t.raw as string, values) as string;
    t.__last__ = __last__;
    if (t.type === "list") return t;
    t.__t__ = Object.defineProperties(
      Object(t.__base__ || t.base),
      Object.entries(Object.getOwnPropertyDescriptors(t)).reduce(
        (obj, [key, value]) => (value.writable === false ? null : (obj[key] = value), obj),
        {} as Record<string, PropertyDescriptor>
      )
    );
    if (t.type === "tree") return t.__t__;
    else return (t.t = t.__t__), (t.tr = t.__t__);
  }
  function get(...path: any[]) {
    const variables = path.at(-1)?.__proto__ === Object.prototype ? (path.pop() as Values) : undefined;
    if (typeof path[0] === "object") path = path[0];
    else if (path.length === 1) path = (path[0] as string).split(settings.ps);
    if (path.length === 0 && variables) return t.use(variables);
    return path.reduce((o, key) => o[key] ?? o, variables ? t.use(variables) : t);
  }
  settings.plugins?.forEach(plugin => {
    t.with(plugin, false);
  });
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

function w<T extends TranslationNode, X>(this: T, plugin: TranslationPlugin<T, X>, traverse = true) {
  const t = this;
  const tp = plugin(t);
  if (traverse)
    t.children?.forEach(c => {
      const tn = t.__tree__[c];
      try {
        const descriptor = Object.getOwnPropertyDescriptor(t, c);
        Object.defineProperty(tp, c, {
          configurable: true,
          get() {
            const ts = tn.with?.(plugin, traverse) || w.bind(tn)(plugin as any, traverse);
            Object.defineProperty(
              tp,
              c,
              descriptor ?? {
                configurable: true,
                value: tn,
              }
            );
            return ts;
          },
        });
      } catch {
        tn.with?.(plugin, traverse) || w.bind(tn)(plugin as any, traverse);
      }
    });
  return tp;
}
