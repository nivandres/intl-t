import { Locale } from "../locales";

export const invalidKeys = ["base", "values", "children"] as const;
export type InvalidKey = (typeof invalidKeys)[number] | number | `__${string}`;

export type Base = string | number;
export type Key = string | number;
export type Values = Record<string, Base | null | undefined>;

export type Node =
  | Base
  | readonly Node[]
  | readonly [Node, ...Node[]]
  | ({
      [key: Key]: Node;
    } & {
      values?: Values;
      base?: Base;
    });

export type Keep<T> = T extends Base
  ? Base
  : T extends [infer F, ...infer R]
  ? readonly [Keep<F>, ...Keep<R>]
  : {
      readonly [K in keyof T]: T[K] extends object ? Keep<T[K]> : T[K];
    };

export type PNode<N extends Node = Node> = N extends object
  ? N extends any[]
    ? {
        children: Exclude<keyof N, keyof any[]>;
        values: Values;
      }
    : {
        children: Exclude<keyof N, InvalidKey>;
        values: "values" extends keyof N ? N["values"] : Values;
      }
  : N extends string
  ? { children: never; values: Values }
  : never;

export type valueof<O extends object> = O extends Record<any, infer V> ? V : never;

export type ArrayToString<A extends Key[], S extends string = "."> = A extends [infer F, ...infer R]
  ? F extends Base
    ? `${F}${R extends [Base, ...any[]] ? `${S}${ArrayToString<R, S>}` : ""}`
    : ""
  : "";

export type StringToArray<S extends string, D extends string = "."> = S extends `${infer T}${D}${infer U}`
  ? [T, ...StringToArray<U, D>]
  : [S];

export type isArray<A extends any> = A extends any[] ? A : never;

export type SearchWays<
  N extends Node,
  A extends any[] = [],
  P extends PNode<N> = PNode<N>
> = P["children"] extends never
  ? A
  : valueof<{
      [K in P["children"]]: K extends keyof N
        ? N[K] extends Node
          ? SearchWays<N[K], A extends [...infer F] ? [...F, K] : [K]> | A
          : never
        : never;
    }>;

export type FollowWay<N extends object, W extends string[]> = W extends [infer F, ...infer R]
  ? F extends keyof N
    ? N[F] extends object
      ? R extends string[]
        ? FollowWay<N[F], R>
        : N
      : N
    : N
  : N;

export type FollowWayWithValues<
  N extends Node,
  W extends string[],
  VV extends Values = Values,
  V extends Values = PNode<N>["values"] & VV
> = W extends [infer F, ...infer R]
  ? F extends keyof N
    ? N[F] extends Node
      ? R extends string[]
        ? FollowWayWithValues<N[F], R, V>
        : V
      : V
    : V
  : V;

export type TranslationNode<
  S extends TranslationSettings = TranslationSettings,
  N extends Node = Node,
  V extends Values = Values,
  L extends S["allowedLocale"] = S["allowedLocale"],
  P extends any = null,
  R extends Key[] = [],
  I extends Key = Key,
  C extends keyof N & Key = Exclude<keyof N, InvalidKey | keyof any[]> & Key,
  UF extends Function = {
    <VV extends Values>(variables?: Partial<V> & VV): TranslationNode<S, N, V & VV, L, P, R, I, C>;
  },
  SF extends Function = {
    <D extends ArrayToString<isArray<SearchWays<N>>, S["ps"]>, VV extends Values>(
      path?: D | StringToArray<D, S["ps"]>,
      variables?: Partial<FollowWayWithValues<N, StringToArray<D, S["ps"]>, V>> & VV
    ): FollowWay<TranslationNode<S, N, V & VV, L, P, R, I, C>, StringToArray<D, S["ps"]>>;
    <D extends isArray<SearchWays<N>>, VV extends Values>(
      ...params: [...D, Partial<FollowWayWithValues<N, D, V>> & VV]
    ): FollowWay<TranslationNode<S, N, V & VV, L, P, R, I, C>, D>;
    <VV extends Values>(variables?: Partial<V> & VV): TranslationNode<S, N, V & VV, L, P, R, I, C>;
  }
> = {
  g: Translation<S>[L];
  global: Translation<S>[L];
  t: TranslationNode<S, N, V, L, P, R, I, C>;
  tr: TranslationNode<S, N, V, L, P, R, I, C>;
  parent: P extends null ? Translation<S> : P;
  p: P extends null ? Translation<S> : P;
  values: V;
  lang: L;
  path: R;
  key: I;
  id: ArrayToString<R, S["ps"]>;
  node: N;
  settings: S;
  locales: S["allowedLocales"];
  locale: S["allowedLocale"];
  mainLocale: S["mainLocale"];
  main: S["mainLocale"];
  get: SF;
  use: UF;
} & Record<`__${string}__`, any> & {
    [Locale in S["allowedLocale"]]: TranslationNode<S, N, V, Locale, P, R, I, C>;
  } & (N extends Base
    ? N & {
        base: N;
        raw: string;
        children?: [];
        child?: never;
        use: UF;
        type: "base";
      }
    : SF & {
        search: SF;
        children: C[];
        child: C;
        use: SF;
      } & (N extends readonly Node[]
          ? {
              base?: undefined;
              index: I;
              keys: Key[];
              type: "list";
            } & {
              [K in C]: N[K] extends Node
                ? TranslationNode<S, N[K], V, L, TranslationNode<S, N, V, L, P, R, I, C>, [...R, K], K>
                : never;
            }
          : N extends Record<string, unknown>
          ? {
              base: N["base"];
              raw: N["base"];
              values: V & N["values"];
              type: "tree";
            } & {
              [K in C]: N[K] extends Node
                ? TranslationNode<S, N[K], V & N["values"], L, TranslationNode<S, N, V, L, P, R, I, C>, [...R, K], K>
                : never;
            }
          : never));

export type Translation<S extends TranslationSettings = any> = TranslationNode<
  S,
  S["tree"],
  S["variables"],
  S["mainLocale"]
>;

export interface TranslationSettings<
  AllowedLocale extends Locale = Locale,
  MainLocale extends AllowedLocale = AllowedLocale,
  Tree extends Node = Node,
  Variables extends Values = Values,
  PathSeparator extends string = string,
> {
  locales: {
    [Locale in AllowedLocale]: Keep<Tree>;
  };
  mainLocale: MainLocale;
  tree: Tree;
  instanceLocales?: boolean;
  allowedLocales: AllowedLocale[];
  allowedLocale: AllowedLocale;
  variables: Variables;
  ps: PathSeparator;
}
