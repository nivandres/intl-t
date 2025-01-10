export function repeat(times: number, fn: Function) {
  for (let i = 0; i < times; i++) {
    fn();
  }
}
