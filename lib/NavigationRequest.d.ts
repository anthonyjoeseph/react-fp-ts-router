/**
 * data NavigationRequest R = push R | pushExt string
 * | replace R | replaceExt string
 * | go number | goBack | goForward
 */
import { Prism } from "monocle-ts";
import { Eq } from "fp-ts/lib/Eq";
export declare type NavigationRequest<R> = {
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
export declare function push<R>(value0: R): NavigationRequest<R>;
export declare function pushExt<R>(value0: string): NavigationRequest<R>;
export declare function replace<R>(value0: R): NavigationRequest<R>;
export declare function replaceExt<R>(value0: string): NavigationRequest<R>;
export declare function go<R>(value0: number): NavigationRequest<R>;
export declare const goBack: NavigationRequest<never>;
export declare const goForward: NavigationRequest<never>;
export declare function fold<R, R1>(handlers: {
    onpush: (value0: R) => R1;
    onpushExt: (value0: string) => R1;
    onreplace: (value0: R) => R1;
    onreplaceExt: (value0: string) => R1;
    ongo: (value0: number) => R1;
    ongoBack: () => R1;
    ongoForward: () => R1;
}): (fa: NavigationRequest<R>) => R1;
export declare function _push<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>>;
export declare function _pushExt<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>>;
export declare function _replace<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>>;
export declare function _replaceExt<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>>;
export declare function _go<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>>;
export declare function _goBack<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>>;
export declare function _goForward<R>(): Prism<NavigationRequest<R>, NavigationRequest<R>>;
export declare function getEq<R>(eqpushValue0: Eq<R>, eqpushExtValue0: Eq<string>, eqreplaceValue0: Eq<R>, eqreplaceExtValue0: Eq<string>, eqgoValue0: Eq<number>): Eq<NavigationRequest<R>>;
