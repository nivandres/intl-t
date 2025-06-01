import type { ReactNode, Key as ReactKey, Dispatch, SetStateAction } from "react";
import type {
  TranslationSettings,
  Node,
  Base,
  Values,
  Key,
  isArray,
  SearchWays,
  ArrayToString,
  FollowWayWithValues,
  TranslationNode,
  State,
  Children,
  Content,
} from "../types";

export type { ReactNode, ReactKey };

export type ReactSetState<T> = Dispatch<SetStateAction<T>>;
export type ReactState<T> = [T, ReactSetState<T>];

export interface ReactChunkProps {
  children: ReactNode;
  tagName: string;
  tagAttributes: string;
  tagContent: string;
  value?: Base | null;
  key: ReactKey;
  [key: string]: unknown;
}

export type ReactChunk = (props: ReactChunkProps) => ReactNode | void;

export interface TranslationProps<
  S extends TranslationSettings = TranslationSettings,
  N = Node,
  V extends Values = Values,
  A extends string[] = isArray<SearchWays<N>>,
  D extends string = ArrayToString<A, S["ps"]>,
> extends Partial<State<S["allowedLocale"]>> {
  children?: Content<N> | (ReactNode & {});
  key?: D;
  path?: D | A;
  variables?: Partial<FollowWayWithValues<N, A, V>> & Values;
  locale?: S["allowedLocale"];
  stateless?: boolean;
  source?: Node;
  deep?: number;
  sourceDefault?: boolean;
  preventDynamic?: boolean;
  settings?: Partial<TranslationSettings>;
  onLocaleChange?: ReactSetState<S["allowedLocale"]>;
}

export type TranslationFC<S extends TranslationSettings = TranslationSettings, N = Node, V extends Values = Values> = <
  A extends isArray<SearchWays<N>>,
  D extends ArrayToString<A, S["ps"]>,
>(
  props: TranslationProps<S, N, V, A, D>,
) => ReactNode;

export type TranslationNodeFC<S extends TranslationSettings = TranslationSettings, N = Node, V extends Values = Values> = TranslationFC<
  S,
  N,
  V
> & {
  g: TranslationNodeFC<S, S["tree"][S["allowedLocale"]], V>;
  global: TranslationNodeFC<S, S["tree"][S["allowedLocale"]], V>;
} & {
  [L in S["allowedLocale"]]: TranslationNodeFC<S, N, V>;
} & {
  [C in Children<N>]: TranslationNodeFC<S, N[C], V>;
};
