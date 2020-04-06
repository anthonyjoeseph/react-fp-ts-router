"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
/**
 * Renders components who accept a narrower version of the global state
 * Think of this as analagous to {@link https://reacttraining.com/react-router/web/api/Route <Route>} from React-Router
 *
 * @template S - Global app state
 * @template N - Narrower app state
 * @template T - All of the wrapped component's props
 * @param WrappedComponent - Component with narrow app state
 * @param renderCondition - Type predicate to narrow component type
 *
 */
function withNarrowerAppState(WrappedComponent, renderCondition) {
    return /** @class */ (function (_super) {
        __extends(NarrowerAppState, _super);
        function NarrowerAppState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NarrowerAppState.prototype.render = function () {
            var appState = this.props.appState;
            if (renderCondition(appState)) {
                return react_1.default.createElement(WrappedComponent, __assign({}, this.props, { appState: appState }));
            }
            return react_1.default.createElement(react_1.default.Fragment, null);
        };
        return NarrowerAppState;
    }(react_1.Component));
}
exports.default = withNarrowerAppState;
