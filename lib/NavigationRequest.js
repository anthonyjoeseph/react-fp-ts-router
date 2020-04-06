"use strict";
// NavigationRequest ADT
// Generated with fp-ts-codegen
// https://gcanti.github.io/fp-ts-codegen/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * data NavigationRequest R = push R | pushExt string
 * | replace R | replaceExt string
 * | go number | goBack | goForward
 */
var monocle_ts_1 = require("monocle-ts");
var Eq_1 = require("fp-ts/lib/Eq");
function push(value0) { return { type: "push", value0: value0 }; }
exports.push = push;
function pushExt(value0) { return { type: "pushExt", value0: value0 }; }
exports.pushExt = pushExt;
function replace(value0) { return { type: "replace", value0: value0 }; }
exports.replace = replace;
function replaceExt(value0) { return { type: "replaceExt", value0: value0 }; }
exports.replaceExt = replaceExt;
function go(value0) { return { type: "go", value0: value0 }; }
exports.go = go;
exports.goBack = { type: "goBack" };
exports.goForward = { type: "goForward" };
function fold(handlers) {
    return function (fa) {
        switch (fa.type) {
            case "push": return handlers.onpush(fa.value0);
            case "pushExt": return handlers.onpushExt(fa.value0);
            case "replace": return handlers.onreplace(fa.value0);
            case "replaceExt": return handlers.onreplaceExt(fa.value0);
            case "go": return handlers.ongo(fa.value0);
            case "goBack": return handlers.ongoBack();
            case "goForward": return handlers.ongoForward();
        }
    };
}
exports.fold = fold;
function _push() { return monocle_ts_1.Prism.fromPredicate(function (s) { return s.type === "push"; }); }
exports._push = _push;
function _pushExt() { return monocle_ts_1.Prism.fromPredicate(function (s) { return s.type === "pushExt"; }); }
exports._pushExt = _pushExt;
function _replace() { return monocle_ts_1.Prism.fromPredicate(function (s) { return s.type === "replace"; }); }
exports._replace = _replace;
function _replaceExt() { return monocle_ts_1.Prism.fromPredicate(function (s) { return s.type === "replaceExt"; }); }
exports._replaceExt = _replaceExt;
function _go() { return monocle_ts_1.Prism.fromPredicate(function (s) { return s.type === "go"; }); }
exports._go = _go;
function _goBack() { return monocle_ts_1.Prism.fromPredicate(function (s) { return s.type === "goBack"; }); }
exports._goBack = _goBack;
function _goForward() { return monocle_ts_1.Prism.fromPredicate(function (s) { return s.type === "goForward"; }); }
exports._goForward = _goForward;
function getEq(eqpushValue0, eqpushExtValue0, eqreplaceValue0, eqreplaceExtValue0, eqgoValue0) {
    return Eq_1.fromEquals(function (x, y) {
        if (x.type === "push" && y.type === "push") {
            return eqpushValue0.equals(x.value0, y.value0);
        }
        if (x.type === "pushExt" && y.type === "pushExt") {
            return eqpushExtValue0.equals(x.value0, y.value0);
        }
        if (x.type === "replace" && y.type === "replace") {
            return eqreplaceValue0.equals(x.value0, y.value0);
        }
        if (x.type === "replaceExt" && y.type === "replaceExt") {
            return eqreplaceExtValue0.equals(x.value0, y.value0);
        }
        if (x.type === "go" && y.type === "go") {
            return eqgoValue0.equals(x.value0, y.value0);
        }
        if (x.type === "goBack" && y.type === "goBack") {
            return true;
        }
        if (x.type === "goForward" && y.type === "goForward") {
            return true;
        }
        return false;
    });
}
exports.getEq = getEq;
