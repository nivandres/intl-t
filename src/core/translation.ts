import type { Locale } from "../locales/types";
import type {
  Node,
  Values,
  Key,
  Variables,
  Content,
  LastKey,
  TranslationSettings,
  TranslationType,
  TranslationData,
  TranslationDataAdapter,
  PartialTree,
  Children,
  FollowWay,
  Join,
  TranslationFC,
  TranslationNodeFC,
} from "./types";
import { injectVariables } from "../tools/inject";
import { hidratation } from "../state";

abstract class TranslationProxy extends Function {
  public name = "Translation";

  constructor(protected __call__: Function) {
    super("...args", "return this.__call__(...args)");
    return new Proxy(this.bind(this), {
      construct(target, [settings]) {
        settings.settings = { ...settings.settings, ...target.settings };
        return new TranslationNode(settings);
      },
      get(target, p, receiver) {
        let val = Reflect.get(target, p, receiver);
        let src;
        if (val) {
          if (typeof val !== "function" || !(p in TranslationNode.prototype)) return val;
          src = target;
        } else {
          if (Array.isArray(target.node)) src = [...target.children.map((c: string) => target[c])];
          else if (p in String.prototype) src = target.base;
          else src = target.node || "";
          val = src[p];
        }
        if (typeof val === "function") val = val.bind(src);
        return val;
      },
      ownKeys(target) {
        return target.children;
      },
    });
  }
}

export class TranslationNode<
  S extends TranslationSettings = TranslationSettings,
  N = S["tree"][S["allowedLocale"]],
  V extends Values = S["variables"],
  L extends S["allowedLocale"] = S["allowedLocale"],
  R extends Key[] = [],
> extends TranslationProxy {
  settings: S;

  t = this;
  tr = this;
  translation = this;
  node: N;
  variables: Variables<N>;
  locale: L;
  path: [] extends R ? Key[] : R;
  key: LastKey<R>;
  children: Children<N>[];

  global: TranslationType<S, S["tree"][L], S["variables"], L>;
  g: typeof this.global;
  private parent: TranslationNode;

  use = this;
  get = this;

  static Node = TranslationNode;
  static createTranslation = createTranslation;
  static createTranslationSettings = createTranslationSettings;
  static injectVariables = injectVariables;
  static getChildren = getChildren;
  static Proxy = TranslationProxy;
  static context = null as any;
  static t = null as any;
  static setLocale = undefined;

  static getLocale = function (this: any) {
    return this.defaultLocale;
  };

  static Provider = function (this: any, ...args: any[]) {
    return this[this.settings.locale](...args);
  } as unknown as TranslationFC;

  protected T = new Proxy(this, {
    apply(target, _, args) {
      return TranslationNode.Provider.apply(target, args as any);
    },
    get(target, p, receiver) {
      const t = Reflect.get(target, p, receiver) as any;
      return t?.T || t;
    },
  }) as unknown as TranslationNodeFC<S, N, V>;

  Tr = this.T;
  Trans = this.T;
  Translation = this.T;
  TranslationProvider = this.T;

  static hook = function (this: any, ...args: any[]) {
    return this[this.settings.locale](...args);
  };

  protected hook = new Proxy(this, {
    apply(target, _, args) {
      return TranslationNode.hook.apply(target, args as any);
    },
    get(target, p, receiver) {
      const t = Reflect.get(target, p, receiver) as any;
      return t?.hook || t;
    },
  });

  useTranslation = this.hook;
  useTranslations = this.hook;
  getTranslation = this.hook;
  getTranslations = this.hook;
  useLocale = this.hook;

  [x: symbol]: any;

  constructor(params: TranslationData<S, N, V, L, R>) {
    super((...args: any[]) => this.call(...args));

    this.settings = params.settings ??= createTranslationSettings(params) as S;

    const {
      settings = params.settings,
      node = settings.tree[settings.locale] as N,
      locale = settings.locale as L,
      variables = (node as any)?.values || settings.variables,
      path = [] as unknown as R,
      key = (path.at(-1) || locale) as LastKey<R>,
      parent = {} as unknown as TranslationNode,
    } = params;

    this.node = node;
    this.variables = variables;
    this.locale = locale;
    this.path = path;
    this.key = key;
    this.parent = parent;
    this.children = getChildren(node);

    this.global = parent.global || this;
    this.g = this.global;

    const descriptors: PropertyDescriptorMap = {};
    const t = this;

    if (node instanceof Promise) node.then(this.setNode);
    else if (typeof node !== "function") this.setChildren(t.children);

    settings.allowedLocales.forEach(locale => {
      if (locale === t.locale) {
        t[locale as any] = t;
        (settings as any)[locale] ??= t;
        if (typeof node !== "function") return;
        return (descriptors[locale] = {
          configurable: true,
          enumerable: false,
          get() {
            Object.defineProperty(t, locale, { value: t, configurable: true, enumerable: false });
            if (t.node === node) t.setNode(t.getNode() as N);
            return t;
          },
        });
      }
      descriptors[locale] = {
        get() {
          let value: TranslationNode;
          let node = parent[locale as any]?.[key] || (settings as any)[locale];
          value =
            node instanceof TranslationNode
              ? (node as any)
              : new Translation.Node({
                  settings,
                  locale,
                  variables,
                  parent,
                  node: settings.tree[locale] || settings.getLocale?.(locale),
                });
          Object.defineProperty(t, locale, { value, configurable: true, enumerable: false });
          return value;
        },
        configurable: true,
        enumerable: false,
      };
    });
    Object.defineProperties(this, descriptors);
    TranslationNode.t ||= t;
  }
  call(...path: any[]): any {
    const variables = path.at(-1)?.__proto__ === Object.prototype ? (path.pop() as Values) : undefined;
    if (typeof path[0] === "object") path = path[0];
    else if (path.length === 1) path = (path[0] as string)?.trim().split(this.settings.ps);
    if (variables) Object.assign(this.variables || {}, variables);
    path = path?.filter?.(Boolean);
    if (!path?.length) return this.t;
    return path.reduce(
      (o: TranslationNode, key, index) =>
        o?.[key] ??
        (() => {
          const value = new Translation.Node({
            node: (o as any)?.[this.settings.mainLocale]?.node[key] || path.slice(0, index + 1).join(o.settings.ps),
            settings: o.settings,
            locale: o.locale,
            parent: o,
            path: [...o.path, key],
          });
          Object.defineProperty(o, key, { value, configurable: true, enumerable: false });
          return value;
        })(),
      this,
    );
  }
  set<VV extends Values>(variables: Partial<V & Variables<N>> & VV = {} as any) {
    Object.assign(this.variables as {}, variables);
    return this as TranslationType<S, N, V & VV, L, R>;
  }
  setSource(node: any) {
    if (!node) return;
    if (typeof node === "function") node = node.call(this);
    if (node instanceof Promise) return node.then(this.setNode);
    this.setNode(node);
  }
  protected setNode(node: N) {
    if (!this) return;
    this.node = node;
    this.setChildren();
  }
  getNode() {
    if (typeof this.node === "function") this.node = this.node.call(this);
    if (this.node instanceof Promise) return this.node.then(this.setNode);
    return this.node as N;
  }
  addChildren(children: Children<N>[] = []) {
    const t = this;
    const settings = t.settings;
    const locale = t.locale;
    const descriptors: PropertyDescriptorMap = {};
    children.forEach(child => {
      const path = [...t.path, child];
      descriptors[child] = {
        get() {
          const value = new Translation.Node({
            node: t.node[child] || null,
            settings,
            locale,
            parent: t,
            path,
          });
          Object.defineProperty(t, child, { value, configurable: true, enumerable: false });
          return value;
        },
        configurable: true,
        enumerable: false,
      };
    });
    Object.defineProperties(t, descriptors);
    return children;
  }
  setChildren(children = getChildren(this.node)) {
    this.children = children;
    return this.addChildren(children);
  }
  getSource(deep = Infinity) {
    return getSource(this.node, deep, this.path);
  }
  get base() {
    const node = this.getNode();
    return TranslationNode.injectVariables(
      (!node || typeof node !== "object" ? node : (node as any).base) || this.path.join(this.settings.ps),
      this.values,
      this.settings,
    ) as Content<N>;
  }
  getChildren() {
    return getChildren(this.node);
  }
  getLocale() {
    return this.settings.locale as S["allowedLocale"];
  }
  setLocale<LL extends S["allowedLocale"] = L>(
    locale: LL | (string & {}) | ((p: L) => LL) = this.settings.locale,
  ): TranslationType<S, FollowWay<S["tree"][LL], R>, V, LL, R> {
    if (typeof locale === "function") locale = locale(this.currentLocale as L);
    const sl = this.settings.setLocale;
    this.then?.(() => sl?.(locale)) || sl?.(locale) || (this.settings.locale = locale);
    return this[locale as any];
  }
  get values(): V & Variables<N> {
    return { ...this.parent.values, ...this.variables };
  }
  get child(): Children<N> {
    return this.children[0];
  }
  get currentLocale() {
    return this.settings.locale as S["allowedLocale"];
  }
  get current(): TranslationType<S, FollowWay<S["tree"][S["allowedLocale"]], R>, V, L, R> {
    return this[this.currentLocale as any] || this;
  }
  get mainLocale() {
    return this.settings.mainLocale as S["mainLocale"];
  }
  get allowedLocales() {
    return this.settings.allowedLocales as S["allowedLocale"][];
  }
  get locales() {
    return this.allowedLocales;
  }
  get id(): Join<R extends string[] ? R : string[], S["ps"]> {
    return (this[Symbol.for("id")] ??= this.path.join(this.settings.ps)) as any;
  }
  [Symbol.toStringTag]() {
    return "Translation";
  }
  toString() {
    return String(this.base);
  }
  get promise(): Promise<this> {
    return new Promise((r, c) => {
      this.then?.(r).catch(c);
    });
  }
  get then(): Promise<this>["then"] | undefined {
    let node = this.node;
    if (typeof node === "function") {
      this.node = node = node.call(this);
      if (node instanceof Promise) node.then(this.setNode);
      else this.setNode(node);
    }
    return node instanceof Promise ? cb => new Promise((r, c) => node.then(() => r(cb?.(this)!)).catch(c)) : undefined;
  }
  catch(cb: (reason: any) => void) {
    this.node instanceof Promise && this.node.catch(cb);
    return this;
  }
  finally(cb: () => void) {
    this.node instanceof Promise ? this.node.finally(cb) : cb();
    return this;
  }
  *[Symbol.iterator]() {
    if (Array.isArray(this.node)) {
      return yield* this.children.map(child => this[child as any]);
    }
    yield this.base;
  }
  toJSON() {
    return typeof this.node === "object" ? this.node : this.base;
  }
}

export type Translation<T extends TranslationData = TranslationData> = TranslationDataAdapter<T>;
export const Translation = TranslationNode as unknown as {
  new <
    AllowedLocale extends Locale = Locale,
    MainLocale extends AllowedLocale = AllowedLocale,
    const Tree extends Record<AllowedLocale, any> = Record<AllowedLocale, any>,
    Variables extends Values = Values,
    PathSeparator extends string = ".",
    N = Node,
  >(
    settings: Partial<TranslationSettings<AllowedLocale, MainLocale, Tree, Variables, PathSeparator, N>>,
  ): TranslationType<TranslationSettings<AllowedLocale, MainLocale, Tree, Variables, PathSeparator>>;
  new <const T extends TranslationData>(data: T): Translation<T>;
} & typeof TranslationNode;

export function createTranslationSettings<
  L extends Locale = Locale,
  M extends L = L,
  const T extends Record<L, any> = Record<L, any>,
  V extends Values = Values,
  PS extends string = ".",
  N = Node,
>(settings: Partial<TranslationSettings<L, M, T, V, PS, N>> = {}) {
  type S = TranslationSettings<L, M, T, V, PS>;
  settings.locales ??= (settings.getLocales || {}) as T;
  settings.allowedLocales ??= Object.keys(settings.locales as object) as L[];
  settings.mainLocale ??= settings.defaultLocale ??= settings.allowedLocales[0] as M;
  settings.defaultLocale ??= settings.mainLocale;
  settings.allowedLocale ??= settings.mainLocale;
  settings.currentLocale ??= TranslationNode.context?.locale || TranslationNode.getLocale.call(settings) || settings.defaultLocale;
  settings.locale ??= settings.currentLocale;
  settings.setLocale ??= TranslationNode.setLocale;
  settings.tree ??= settings.locales as T;
  settings.variables ??= {} as unknown as V;
  settings.hidratation ??= hidratation;
  settings.ps ??= settings.pathSeparator ??= "." as PS;
  const gls = settings.getLocale;
  if (gls)
    settings.getLocale ??= function (locale: L) {
      return ((settings.locales as any)[locale] ??= gls.call(this, locale));
    };
  if (TranslationNode.context?.source) settings.locales[settings.locale as L] = TranslationNode.context.source;
  settings.locales[settings.locale as L] ??= settings.getLocale?.bind(settings, settings.locale as L) as any;
  return (settings.settings = settings as S);
}

export function createTranslation<
  AllowedLocale extends Locale = Locale,
  MainLocale extends AllowedLocale = AllowedLocale,
  const Tree extends Record<AllowedLocale, any> = Record<AllowedLocale, any>,
  Variables extends Values = Values,
  PathSeparator extends string = ".",
  N = Node,
>(settings: Partial<TranslationSettings<AllowedLocale, MainLocale, Tree, Variables, PathSeparator, N>> = {}) {
  type Settings = TranslationSettings<AllowedLocale, MainLocale, Tree, Variables, PathSeparator>;
  return new Translation(createTranslationSettings(settings)) as TranslationType<Settings>;
}

export const invalidKeys = ["base", "values", "children", "parent", "node", "path", "settings", "key", "default", "catch", "then"] as const;

export function getChildren<N>(node: N) {
  return ((node as any)?.children ||
    (typeof node !== "object" || !node
      ? []
      : Object.keys(node as object).filter(key => !invalidKeys.includes(key as any)))) as Children<N>[];
}

export function getSource<N>(node: N, deep: number = Infinity, path: Key[] = []): PartialTree<N> {
  if (typeof node !== "object" || !node) return node as any;
  const sourceNode: any = {};
  sourceNode.children = getChildren(node);
  if (deep--)
    sourceNode.children.forEach((child: string) => (sourceNode[child] = getSource(node[child as keyof N], deep, [...path, child])));
  if ("values" in node && !("values" in (node as any).__proto__)) sourceNode.values = node.values;
  if ("base" in node) sourceNode.base = String(node.base);
  if (path.length) sourceNode.path = path;
  return sourceNode;
}
