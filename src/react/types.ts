import type { Key, ReactNode } from "react";
import { Base } from "../core/types";

export type { ReactNode };

export interface ReactChunkProps {
  children: ReactNode;
  tagName: string;
  tagAttributes: string;
  tagContent: string;
  value?: Base | null;
  key: Key;
  [key: string]: unknown;
}

export type ReactChunk = (props: ReactChunkProps) => ReactNode | void;
