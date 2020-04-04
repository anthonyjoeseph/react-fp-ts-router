// NavigationRequest ADT
// Generated with fp-ts-codegen
// https://gcanti.github.io/fp-ts-codegen/

export type NavigationRequest<R> = {
  readonly type: "push";
  readonly value0: R;
} | {
  readonly type: "replace";
  readonly value0: R;
} | {
  readonly type: "pushExt";
  readonly value0: string;
} | {
  readonly type: "replaceExt";
  readonly value0: R;
} | {
  readonly type: "go";
  readonly value0: number;
} | {
  readonly type: "goBack";
} | {
  readonly type: "goForward";
};

export function push<R>(value0: R): NavigationRequest<R> { return { type: "push", value0 }; }

export function replace<R>(value0: R): NavigationRequest<R> { return { type: "replace", value0 }; }

export function pushExt<R>(value0: string): NavigationRequest<R> { return { type: "pushExt", value0 }; }

export function replaceExt<R>(value0: R): NavigationRequest<R> { return { type: "replaceExt", value0 }; }

export function go<R>(value0: number): NavigationRequest<R> { return { type: "go", value0 }; }

export const goBack: NavigationRequest<never> = { type: "goBack" };

export const goForward: NavigationRequest<never> = { type: "goForward" };

export function fold<R, R1>(onpush: (value0: R) => R1, onreplace: (value0: R) => R1, onpushExt: (value0: string) => R1, onreplaceExt: (value0: R) => R1, ongo: (value0: number) => R1, ongoBack: () => R1, ongoForward: () => R1): (fa: NavigationRequest<R>) => R1 { return fa => { switch (fa.type) {
  case "push": return onpush(fa.value0);
  case "replace": return onreplace(fa.value0);
  case "pushExt": return onpushExt(fa.value0);
  case "replaceExt": return onreplaceExt(fa.value0);
  case "go": return ongo(fa.value0);
  case "goBack": return ongoBack();
  case "goForward": return ongoForward();
} }; }

import { Prism } from "monocle-ts";

export function _push<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>> { return Prism.fromPredicate(s => s.type === "push"); }

export function _replace<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>> { return Prism.fromPredicate(s => s.type === "replace"); }

export function _pushExt<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>> { return Prism.fromPredicate(s => s.type === "pushExt"); }

export function _replaceExt<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>> { return Prism.fromPredicate(s => s.type === "replaceExt"); }

export function _go<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>> { return Prism.fromPredicate(s => s.type === "go"); }

export function _goBack<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>> { return Prism.fromPredicate(s => s.type === "goBack"); }

export function _goForward<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>> { return Prism.fromPredicate(s => s.type === "goForward"); }

import { Eq, fromEquals } from "fp-ts/lib/Eq";

export function getEq<R>(eqpushValue0: Eq<R>, eqreplaceValue0: Eq<R>, eqpushExtValue0: Eq<string>, eqreplaceExtValue0: Eq<R>, eqgoValue0: Eq<number>): Eq<NavigationRequest<R>> { return fromEquals((x, y) => { if (x.type === "push" && y.type === "push") {
  return eqpushValue0.equals(x.value0, y.value0);
} if (x.type === "replace" && y.type === "replace") {
  return eqreplaceValue0.equals(x.value0, y.value0);
} if (x.type === "pushExt" && y.type === "pushExt") {
  return eqpushExtValue0.equals(x.value0, y.value0);
} if (x.type === "replaceExt" && y.type === "replaceExt") {
  return eqreplaceExtValue0.equals(x.value0, y.value0);
} if (x.type === "go" && y.type === "go") {
  return eqgoValue0.equals(x.value0, y.value0);
} if (x.type === "goBack" && y.type === "goBack") {
  return true;
} if (x.type === "goForward" && y.type === "goForward") {
  return true;
} return false; }); }