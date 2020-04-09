// NavigationRequest ADT
// Generated with fp-ts-codegen
// https://gcanti.github.io/fp-ts-codegen/

/**
 * data Action = push | pop | replace
 */

import { Eq, fromEquals } from "fp-ts/lib/Eq";

export class Action {
  public constructor(readonly type: "push" |  "pop" | "replace") {}

  public static push: Action = new Action("push");

  public static pop: Action = new Action("pop");
  
  public static replace: Action = new Action("replace");

  public fold<R>(handlers: {
    onpush: () => R;
    onpop: () => R;
    onreplace: () => R;
  }): R {
    switch (this.type) {
      case "push": return handlers.onpush();
      case "pop": return handlers.onpop();
      case "replace": return handlers.onreplace();
    }
  }

  public static getEq(): Eq<Action> {
    return fromEquals((x, y) => {
      if (x.type === "push" && y.type === "push") {
        return true;
      } if (x.type === "pop" && y.type === "pop") {
        return true;
      } if (x.type === "replace" && y.type === "replace") {
        return true;
      } return false;
    });
  }
}
