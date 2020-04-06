// NavigationRequest ADT
// Generated with fp-ts-codegen
// https://gcanti.github.io/fp-ts-codegen/

/**
 * data Action = push | pop | replace
 */

import { Prism } from "monocle-ts";
import { Eq, fromEquals } from "fp-ts/lib/Eq";

export type Action = {
  readonly type: "push";
} | {
  readonly type: "pop";
} | {
  readonly type: "replace";
};

export const push: Action = { type: "push" };

export const pop: Action = { type: "pop" };

export const replace: Action = { type: "replace" };

export function fold<R>(handlers: {
  onpush: () => R;
  onpop: () => R;
  onreplace: () => R;
}): (fa: Action) => R { return fa => { switch (fa.type) {
  case "push": return handlers.onpush();
  case "pop": return handlers.onpop();
  case "replace": return handlers.onreplace();
} }; }

export const _push: Prism<Action, Action> = Prism.fromPredicate(s => s.type === "push");

export const _pop: Prism<Action, Action> = Prism.fromPredicate(s => s.type === "pop");

export const _replace: Prism<Action, Action> = Prism.fromPredicate(s => s.type === "replace");

export function getEq(): Eq<Action> { return fromEquals((x, y) => { if (x.type === "push" && y.type === "push") {
  return true;
} if (x.type === "pop" && y.type === "pop") {
  return true;
} if (x.type === "replace" && y.type === "replace") {
  return true;
} return false; }); }