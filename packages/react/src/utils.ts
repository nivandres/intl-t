export const isArray = Array.isArray;
export const check = (child: any) => (child && child.translationNode == child ? child.base : child);
export const checkProps = (props: any) => (Object.entries(props || {}).forEach(([key, value]) => (props[key] = check(value))), props);
