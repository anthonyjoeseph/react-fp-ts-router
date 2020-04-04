// NavigationRequest ADT
// Generated with fp-ts-codegen
// https://gcanti.github.io/fp-ts-codegen/


export type NavigationResponse = {
  readonly type: "push";
} | {
  readonly type: "pop";
} | {
  readonly type: "replace";
};

export const push: NavigationResponse = { type: "push" };

export const pop: NavigationResponse = { type: "pop" };

export const replace: NavigationResponse = { type: "replace" };

export function fold<R>(onpush: () => R, onpop: () => R, onreplace: () => R): (fa: NavigationResponse) => R { return fa => { switch (fa.type) {
  case "push": return onpush();
  case "pop": return onpop();
  case "replace": return onreplace();
} }; }

import { Prism } from "monocle-ts";

export const _push: Prism<NavigationResponse, NavigationResponse> = Prism.fromPredicate(s => s.type === "push");

export const _pop: Prism<NavigationResponse, NavigationResponse> = Prism.fromPredicate(s => s.type === "pop");

export const _replace: Prism<NavigationResponse, NavigationResponse> = Prism.fromPredicate(s => s.type === "replace");

import { Eq, fromEquals } from "fp-ts/lib/Eq";

export function getEq(): Eq<NavigationResponse> { return fromEquals((x, y) => { if (x.type === "push" && y.type === "push") {
  return true;
} if (x.type === "pop" && y.type === "pop") {
  return true;
} if (x.type === "replace" && y.type === "replace") {
  return true;
} return false; }); }