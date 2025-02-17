import { Node, TranslationNode, invalidKeys } from "../types";

export function defineProperty(obj: any, key: string, value: () => any, isFn = typeof value === "function") {
  if (!isFn) return (obj[key] = value);
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get() {
      value = value();
      Object.defineProperty(obj, key, { configurable: true, writable: true, enumerable: true, value });
      return value;
    },
    set(valiue) {
      delete obj[key];
      obj[key] = value;
    },
  });
}

export function getChildren(node: Node): string[] {
  return typeof node === "object"
    ? (node as any).__children__ ||
        (Object.keys(node).filter(
          key => !invalidKeys.includes(key as any) && (typeof node === "string" ? isNaN(key as any) : true),
        ) as string[])
    : [];
}

// @ts-ignore
export function getSource(node: any = this, deep: number = Infinity, path: string = this?.id || ""): any {
  if (typeof node !== "object") return node;
  const isTNode = node.__obj__;
  if (isTNode && node.type === "base") return node.raw;
  const isArray = Array.isArray(node);
  const sourceNode: any = isArray ? [] : {};
  sourceNode.__children__ = getChildren(node);
  if (deep--)
    sourceNode.__children__.forEach((child: string) => (sourceNode[child] = getSource(node[child] as any, deep)));
  sourceNode.__path__ = path;
  const values = isTNode ? node.__values__ : node.values;
  if (values && !isArray) sourceNode.values = values;
  if (node.base) sourceNode.base = String(node.base);
  node.__source__ = Date.now();
  return sourceNode;
}

export function addSource(this: TranslationNode, src: any): any {
  if (Array.isArray(src) && src[0]?.__source__) return src.forEach(src => this.addSource(src));
  const __source__ = typeof src === "object" ? src.__source__ : src;
  if ((this.__source__ as any).has(__source__)) return this;
  (this.__source__ as any).add(__source__);
  if (this.id !== (src.__path__ || this.id)) return this.global.get(src.__path__).addSource(src);
  const children = getChildren(src);
  children.forEach((child: any) => this.addChild(child, src[child]));
  return this;
}
