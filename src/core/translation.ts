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
  Children,
  FollowWay,
  TranslationKeys,
  Join,
  TranslationFC,
  TranslationNodeFC,
} from "./types";
import type { GlobalTranslation } from "../global";
import { injectVariables } from "../tools/inject";
import { hydration, isClient, isEdge } from "../state";
import { getLocales } from "./dynamic";

const TranslationFunction = (isEdge ? Object : Function) as FunctionConstructor;

abstract class TranslationProxy extends TranslationFunction {
  public name = "Translation";

  constructor(protected __call__: Function) {
    super();
    return new Proxy(this as any, {
      apply(target, thisArg, argArray) {
        return __call__.apply(thisArg, argArray);
      },
      construct(target, [settings]) {
        settings.settings = { ...settings.settings, ...target.settings };
        return new TranslationNode(settings);
      },
      get(target, p, receiver) {
        let val = Reflect.get(target, p, receiver);
        let src;
        if (val !== undefined) {
          if (typeof val !== "function" || !(p in TranslationNode.prototype)) return val;
          src = target;
        } else {
          if (Array.isArray(target.node)) src = target.children.map((c: string) => target[c]);
          else if (p in String.prototype) src = target.base;
          else src = target.node || "";
          val = src[p];
        }
        if (typeof val === "function" && !val.t) val = val.bind(src);
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
  translation = this;
  translationNode = this as TranslationNode<S, N, V, L, R>;
  node: N;
  variables: Variables<N, V>;
  locale: L;
  path: [] extends R ? Key[] : R;
  key: LastKey<R>;
  children: Children<N>[];
  private __node__: any;

  global: TranslationType<S, S["tree"][L], S["variables"], L>;
  g: typeof this.global;
  private parent: TranslationNode;

  use = isEdge ? (this.__call__ as unknown as typeof this) : this;
  get = this.use;

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

    this.settings = params.settings ??= createTranslationSettings(params) as unknown as S;

    const {
      settings = params.settings,
      locale = settings.locale as L,
      node = settings.tree[locale] as N,
      variables = (node as any)?.values || {},
      path = [] as unknown as R,
      key = path.at(-1) as LastKey<R>,
      parent = settings as unknown as TranslationNode,
      preload = false,
    } = params;

    this.node = node;
    this.variables = variables;
    this.locale = locale;
    this.path = path;
    this.key = key;
    this.parent = parent;
    this.children = [];

    this.global = parent.global || (this as any);
    this.g = this.global;

    const descriptors: PropertyDescriptorMap = {};
    const t = this;

    this.getNode(preload);

    settings.allowedLocales.forEach(locale => {
      if (locale === t.locale) {
        t[locale as any] = parent[locale as any] ??= t;
        if (typeof node !== "function" && node) return;
        return (descriptors[locale] = {
          configurable: true,
          enumerable: false,
          get() {
            Object.defineProperty(t, locale, { value: t, configurable: true, enumerable: false });
            if (settings.preload && t == settings.t && t.hasOwnProperty("then")) delete settings.t.then;
            return t.node === node && t.getNode(t[Symbol.for("preload")] ?? true), t;
          },
        });
      }
      descriptors[locale] = {
        get() {
          const node = parent[locale as any]?.[key] || parent[locale as any];
          const value =
            node instanceof TranslationNode
              ? (node as any)
              : new TranslationNode({
                  settings,
                  locale,
                  variables,
                  parent,
                  node: (settings.locales as any)[locale],
                  preload: t[Symbol.for("preload")] ?? true,
                });
          Object.defineProperty(t, locale, { value, configurable: true, enumerable: false });
          return value;
        },
        configurable: true,
        enumerable: false,
      };
    });
    if (settings.preload && !settings.t)
      descriptors.then = {
        value(cb: Function) {
          return new Promise((r, c) =>
            getLocales(settings.getLocale, settings.allowedLocales)
              .then(locales => ((settings.locales = locales as any), delete (t as any).then, r(t), cb?.(t)))
              .catch(c),
          );
        },
        configurable: true,
      };
    TranslationNode.t ??= settings.t ??= t;
    Object.defineProperties(this, descriptors);
  }
  call(...path: any[]): any {
    const variables = path.at(-1)?.__proto__ === Object.prototype ? (path.pop() as Values) : undefined;
    if (typeof path[0] === "object") path = path[0];
    else if (path.length === 1) path = (path[0] as string)?.trim().split(this.settings.ps);
    if (variables) Object.assign(this.variables || {}, variables);
    path = path?.filter?.(Boolean);
    if (!path?.length) return this;
    this.getNode();
    return path.reduce(
      (o: TranslationNode, key, index) =>
        o?.[key] ??
        (() => {
          const value = new TranslationNode({
            node: (o as any)?.[this.settings.mainLocale]?.node?.[key] || path.slice(0, index + 1).join(o.settings.ps),
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
  set<VV extends Values>(variables: Partial<Variables<N, V>> & VV = {} as any) {
    Object.assign(this.variables as {}, variables);
    return this as TranslationType<S, N, V & VV, L, R>;
  }
  setSource(source: any) {
    this.node = source;
    this.__node__ = void 0;
    return this.getNode();
  }
  protected setNode(node: N) {
    if (!this) return;
    if (this.__node__ === node) return node;
    this.node = this.__node__ = node;
    this.setChildren();
  }
  getNode(load = true) {
    let node = (this.node ||= this.settings.getLocale.bind(null, this.locale) as N);
    if (load && typeof node === "function") node = node((this.settings.hydrate ??= true));
    if (node instanceof Promise) node.then(this.setNode);
    else this.setNode(node);
    return (this.node = node as N);
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
          const value = new TranslationNode({
            node: t.node[child] || null,
            settings,
            locale,
            parent: t as any,
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
  get base() {
    const node = this.getNode();
    return TranslationNode.injectVariables(
      node ? String(typeof node !== "object" ? node : (node as any).base) : this.path.join(this.settings.ps),
      this.values as Values,
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
    this.settings.setLocale;
    this.settings.setLocale(locale) || (this.settings.locale = locale);
    return this.current as any;
  }
  get values(): Variables<N, V> {
    return { ...this.parent.values, ...this.variables } as any;
  }
  get child(): Children<N> {
    return this.children[0];
  }
  get currentLocale() {
    return this.settings.locale as S["allowedLocale"];
  }
  get current(): TranslationType<S, FollowWay<S["tree"][S["allowedLocale"]], R>, V, L, R> {
    this[Symbol.for("preload")] = false;
    const t = this[this.currentLocale as any];
    this[Symbol.for("preload")] = undefined;
    return t || this;
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
  get keys(): TranslationKeys<{ node: N }, S["ps"]> {
    return this.child as any;
  }
  [Symbol.toStringTag]() {
    return "Translation";
  }
  toString(): Content<N> & string {
    return String(this.base) as any;
  }
  get raw() {
    return this.toString();
  }
  get promise(): Promise<this> | undefined {
    return this.then ? new Promise((r, c) => this.then?.(r).catch(c)) : undefined;
  }
  get then(): Promise<this>["then"] | undefined {
    const t = this;
    let node = (this.node ||= this.settings?.getLocale(this.locale) as N);
    if (typeof node === "function") node = this.node = node((this.settings.hydrate ??= true));
    return node instanceof Promise
      ? cb => new Promise((r, c) => node.then(node => (t.setNode(node), r(t as any), cb?.(t))).catch(c))
      : (this.setNode(node), undefined);
  }
  *[Symbol.iterator]() {
    if (Array.isArray(this.node)) return yield* this.children.map(child => this[child as any]);
    yield this.base;
  }
  toJSON(): N {
    return typeof this.node === "object" ? this.node : (this.base as N);
  }
}

export type Translation<T extends TranslationData = TranslationData> = TranslationDataAdapter<T>;
export const Translation = TranslationNode as unknown as {
  new <
    AllowedLocale extends Locale = Locale,
    MainLocale extends AllowedLocale = AllowedLocale,
    const Tree extends Record<AllowedLocale, any> = Record<AllowedLocale, any>,
    const Variables extends Values = Values,
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
  const T = unknown,
  const V extends Values = Values,
  PS extends string = ".",
  const N = Node,
>(settings: Partial<TranslationSettings<L, M, T, V, PS, N>> = {}) {
  type S = TranslationSettings<L, M, T, V, PS, N>;
  if (typeof settings.locales === "function")
    (settings.getLocale = settings.locales as any), (settings.locales = void 0), (settings.preload = !isClient);
  settings.locales ??= {} as any;
  settings.allowedLocales ??= Object.keys(settings.locales as object) as [M, ...L[]];
  settings.mainLocale ??= settings.defaultLocale ??= settings.allowedLocales[0] as M;
  settings.defaultLocale ??= settings.mainLocale;
  settings.allowedLocale ??= settings.mainLocale;
  settings.currentLocale ??= TranslationNode.context?.locale || TranslationNode.getLocale.call(settings) || settings.defaultLocale;
  settings.locale ??= settings.currentLocale;
  settings.setLocale ??= TranslationNode.setLocale;
  settings.tree ??= settings.locales as any;
  settings.variables ??= {} as unknown as V;
  settings.hydration ??= hydration;
  settings.ps ??= settings.pathSeparator ??= "." as PS;
  if (TranslationNode.context?.source) (settings.locales as any)[TranslationNode.context.locale] = TranslationNode.context.source;
  const gls = settings.getLocale as any;
  settings.getLocale = l => ((settings.locales as any)[l] ??= gls?.(l, (settings.hydrate ??= true)));
  settings.setLocale ??= TranslationNode.setLocale || (l => (settings.locale = l as L));
  return (settings.settings = settings as S);
}

export function createTranslation<
  AllowedLocale extends Locale = Locale,
  MainLocale extends AllowedLocale = AllowedLocale,
  const Tree = unknown,
  const Variables extends Values = Values,
  PathSeparator extends string = ".",
  const N = Node,
>(settings: Partial<TranslationSettings<AllowedLocale, MainLocale, Tree, Variables, PathSeparator, N>> = {}) {
  type Settings = TranslationSettings<AllowedLocale, MainLocale, Tree, Variables, PathSeparator, N>;
  return new Translation(createTranslationSettings(settings)) as unknown as TranslationType<Settings>;
}

export const invalidKeys = ["base", "values", "children", "parent", "node", "path", "settings", "key", "default", "catch", "then"] as const;

export function getChildren<N>(node: N) {
  return ((node as any)?.children ||
    (typeof node !== "object" || !node
      ? []
      : Object.keys(node as object).filter(key => !invalidKeys.includes(key as any)))) as Children<N>[];
}

export function getT() {
  return TranslationNode.t as GlobalTranslation;
}
export const getTranslation = ((...args: any[]) => getT().current(...args)) as GlobalTranslation;
export default TranslationNode;
