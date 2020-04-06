"use strict";
// NavigationRequest ADT
// Generated with fp-ts-codegen
// https://gcanti.github.io/fp-ts-codegen/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * data NavigationResponse = push | pop | replace
 */
var monocle_ts_1 = require("monocle-ts");
var Eq_1 = require("fp-ts/lib/Eq");
exports.push = { type: "push" };
exports.pop = { type: "pop" };
exports.replace = { type: "replace" };
function fold(handlers) {
    return function (fa) {
        switch (fa.type) {
            case "push": return handlers.onpush();
            case "pop": return handlers.onpop();
            case "replace": return handlers.onreplace();
        }
    };
}
exports.fold = fold;
exports._push = monocle_ts_1.Prism.fromPredicate(function (s) { return s.type === "push"; });
exports._pop = monocle_ts_1.Prism.fromPredicate(function (s) { return s.type === "pop"; });
exports._replace = monocle_ts_1.Prism.fromPredicate(function (s) { return s.type === "replace"; });
function getEq() {
    return Eq_1.fromEquals(function (x, y) {
        if (x.type === "push" && y.type === "push") {
            return true;
        }
        if (x.type === "pop" && y.type === "pop") {
            return true;
        }
        if (x.type === "replace" && y.type === "replace") {
            return true;
        }
        return false;
    });
}
exports.getEq = getEq;
