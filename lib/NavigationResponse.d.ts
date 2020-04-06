/**
 * data NavigationResponse = push | pop | replace
 */
import { Prism } from "monocle-ts";
import { Eq } from "fp-ts/lib/Eq";
export declare type NavigationResponse = {
    readonly type: "push";
} | {
    readonly type: "pop";
} | {
    readonly type: "replace";
};
export declare const push: NavigationResponse;
export declare const pop: NavigationResponse;
export declare const replace: NavigationResponse;
export declare function fold<R>(handlers: {
    onpush: () => R;
    onpop: () => R;
    onreplace: () => R;
}): (fa: NavigationResponse) => R;
export declare const _push: Prism<NavigationResponse, NavigationResponse>;
export declare const _pop: Prism<NavigationResponse, NavigationResponse>;
export declare const _replace: Prism<NavigationResponse, NavigationResponse>;
export declare function getEq(): Eq<NavigationResponse>;
