// NavigationRequest ADT
// Generated with fp-ts-codegen
// https://gcanti.github.io/fp-ts-codegen/

/**
 * data Navigation R = push R | pushExt string
 * | replace R | replaceExt string
 * | go number | goBack | goForward
 */

import { Prism } from "monocle-ts";
import { Eq, fromEquals } from "fp-ts/lib/Eq";

export type Navigation<R> = {
  readonly type: "push";
  readonly value0: R;
} | {
  readonly type: "pushExt";
  readonly value0: string;
} | {
  readonly type: "replace";
  readonly value0: R;
} | {
  readonly type: "replaceExt";
  readonly value0: string;
} | {
  readonly type: "go";
  readonly value0: number;
} | {
  readonly type: "goBack";
} | {
  readonly type: "goForward";
};

export function push<R>(value0: R): Navigation<R> { return { type: "push", value0 }; }

export function pushExt<R>(value0: string): Navigation<R> { return { type: "pushExt", value0 }; }

export function replace<R>(value0: R): Navigation<R> { return { type: "replace", value0 }; }

export function replaceExt<R>(value0: string): Navigation<R> { return { type: "replaceExt", value0 }; }

export function go<R>(value0: number): Navigation<R> { return { type: "go", value0 }; }

export const goBack: Navigation<never> = { type: "goBack" };

export const goForward: Navigation<never> = { type: "goForward" };

export function fold<R, R1>(handlers: {
  onpush: (value0: R) => R1;
  onpushExt: (value0: string) => R1;
  onreplace: (value0: R) => R1;
  onreplaceExt: (value0: string) => R1;
  ongo: (value0: number) => R1;
  ongoBack: () => R1;
  ongoForward: () => R1;
}): (fa: Navigation<R>) => R1 { return fa => { switch (fa.type) {
  case "push": return handlers.onpush(fa.value0);
  case "pushExt": return handlers.onpushExt(fa.value0);
  case "replace": return handlers.onreplace(fa.value0);
  case "replaceExt": return handlers.onreplaceExt(fa.value0);
  case "go": return handlers.ongo(fa.value0);
  case "goBack": return handlers.ongoBack();
  case "goForward": return handlers.ongoForward();
} }; }

export function _push<R>(): Prism<Navigation<R>, Navigation<R>> { return Prism.fromPredicate(s => s.type === "push"); }

export function _pushExt<R>(): Prism<Navigation<R>, Navigation<R>> { return Prism.fromPredicate(s => s.type === "pushExt"); }

export function _replace<R>(): Prism<Navigation<R>, Navigation<R>> { return Prism.fromPredicate(s => s.type === "replace"); }

export function _replaceExt<R>(): Prism<Navigation<R>, Navigation<R>> { return Prism.fromPredicate(s => s.type === "replaceExt"); }

export function _go<R>(): Prism<Navigation<R>, Navigation<R>> { return Prism.fromPredicate(s => s.type === "go"); }

export function _goBack<R>(): Prism<Navigation<R>, Navigation<R>> { return Prism.fromPredicate(s => s.type === "goBack"); }

export function _goForward<R>(): Prism<Navigation<R>, Navigation<R>> { return Prism.fromPredicate(s => s.type === "goForward"); }

export function getEq<R>(eqpushValue0: Eq<R>, eqpushExtValue0: Eq<string>, eqreplaceValue0: Eq<R>, eqreplaceExtValue0: Eq<string>, eqgoValue0: Eq<number>): Eq<Navigation<R>> { return fromEquals((x, y) => { if (x.type === "push" && y.type === "push") {
  return eqpushValue0.equals(x.value0, y.value0);
} if (x.type === "pushExt" && y.type === "pushExt") {
  return eqpushExtValue0.equals(x.value0, y.value0);
} if (x.type === "replace" && y.type === "replace") {
  return eqreplaceValue0.equals(x.value0, y.value0);
} if (x.type === "replaceExt" && y.type === "replaceExt") {
  return eqreplaceExtValue0.equals(x.value0, y.value0);
} if (x.type === "go" && y.type === "go") {
  return eqgoValue0.equals(x.value0, y.value0);
} if (x.type === "goBack" && y.type === "goBack") {
  return true;
} if (x.type === "goForward" && y.type === "goForward") {
  return true;
} return false; }); }