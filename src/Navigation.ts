// NavigationRequest ADT
// Generated with fp-ts-codegen
// https://gcanti.github.io/fp-ts-codegen/

/**
 * data Navigation R = push R | pushExt string
 * | replace R | replaceExt string
 * | go number | goBack | goForward
 */

import { Eq, fromEquals } from "fp-ts/lib/Eq";

export class Navigation<R> {
  constructor(
    readonly subtype: {
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
    }
  ) {}

  push<R>(value0: R): Navigation<R> { return new Navigation({ type: "push", value0 }); }

  pushExt<R>(value0: string): Navigation<R> { return new Navigation({ type: "pushExt", value0 }); }

  replace<R>(value0: R): Navigation<R> { return new Navigation({ type: "replace", value0 }); }

  replaceExt<R>(value0: string): Navigation<R> { return new Navigation({ type: "replaceExt", value0 }); }

  go<R>(value0: number): Navigation<R> { return new Navigation({ type: "go", value0 }); }

  goBack: Navigation<never> = new Navigation({ type: "goBack" });

  goForward: Navigation<never> = new Navigation({ type: "goForward" });

  fold<R1>(handlers: {
    onpush: (value0: R) => R1;
    onpushExt: (value0: string) => R1;
    onreplace: (value0: R) => R1;
    onreplaceExt: (value0: string) => R1;
    ongo: (value0: number) => R1;
    ongoBack: () => R1;
    ongoForward: () => R1;
  }): R1 {
    switch (this.subtype.type) {
      case "push": return handlers.onpush(this.subtype.value0);
      case "pushExt": return handlers.onpushExt(this.subtype.value0);
      case "replace": return handlers.onreplace(this.subtype.value0);
      case "replaceExt": return handlers.onreplaceExt(this.subtype.value0);
      case "go": return handlers.ongo(this.subtype.value0);
      case "goBack": return handlers.ongoBack();
      case "goForward": return handlers.ongoForward();
    }
  }

  static getEq<R>(eqpushValue0: Eq<R>, eqpushExtValue0: Eq<string>, eqreplaceValue0: Eq<R>, eqreplaceExtValue0: Eq<string>, eqgoValue0: Eq<number>): Eq<Navigation<R>> { return fromEquals((x, y) => { if (x.subtype.type === "push" && y.subtype.type === "push") {
    return eqpushValue0.equals(x.subtype.value0, y.subtype.value0);
  } if (x.subtype.type === "pushExt" && y.subtype.type === "pushExt") {
    return eqpushExtValue0.equals(x.subtype.value0, y.subtype.value0);
  } if (x.subtype.type === "replace" && y.subtype.type === "replace") {
    return eqreplaceValue0.equals(x.subtype.value0, y.subtype.value0);
  } if (x.subtype.type === "replaceExt" && y.subtype.type === "replaceExt") {
    return eqreplaceExtValue0.equals(x.subtype.value0, y.subtype.value0);
  } if (x.subtype.type === "go" && y.subtype.type === "go") {
    return eqgoValue0.equals(x.subtype.value0, y.subtype.value0);
  } if (x.subtype.type === "goBack" && y.subtype.type === "goBack") {
    return true;
  } if (x.subtype.type === "goForward" && y.subtype.type === "goForward") {
    return true;
  } return false; }); }
}
