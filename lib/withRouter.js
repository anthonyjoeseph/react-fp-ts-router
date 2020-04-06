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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var T = __importStar(require("fp-ts/lib/Task"));
var O = __importStar(require("fp-ts/lib/Option"));
var pipeable_1 = require("fp-ts/lib/pipeable");
var History = __importStar(require("history"));
var fp_ts_routing_1 = require("fp-ts-routing");
var NQ = __importStar(require("./NavigationRequest"));
var NS = __importStar(require("./NavigationResponse"));
var actionToNavResp = function (a) {
    if (a === 'PUSH')
        return NS.push;
    if (a === 'POP')
        return NS.pop;
    return NS.replace;
};
var history = History.createBrowserHistory();
/**
 * Creates a root component with global state managed by a functional router
 * (uses `createBrowserHistory` from {@link https://github.com/ReactTraining/history#readme history} for routing)
 *
 * @template S - Global app state
 * @template R - User-defined route type
 * @param Root - Your app's root component
 * @param parser - Converts {@link https://gcanti.github.io/fp-ts-routing/modules/index.ts.html#route-class Route} into user-defined route
 * @param notFoundRoute - User-defined route to use when parser can't find a route
 * @param defaultStateFromRoute - Populates app's global state before component is mounted
 * @param router - Callback on component mount and route change
 */
function withRouter(Root, parser, unParser, notFoundRoute, defaultStateFromRoute, router) {
    var firstRoute = fp_ts_routing_1.parse(parser, fp_ts_routing_1.Route.parse(history.location.pathname), notFoundRoute);
    var defaultState = ({
        appState: defaultStateFromRoute(firstRoute, actionToNavResp(history.action)),
        route: firstRoute,
    });
    var changeRoute = NQ.fold({
        onpush: function (route) { return history.push(unParser(route).toString()); },
        onreplace: function (route) { return history.replace(unParser(route).toString()); },
        onpushExt: function (route) { return history.push(route); },
        onreplaceExt: function (route) { return history.replace(route); },
        ongo: function (numSessions) { return history.go(numSessions); },
        ongoBack: function () { return history.goBack(); },
        ongoForward: function () { return history.goForward(); },
    });
    return /** @class */ (function (_super) {
        __extends(CallbackRoutes, _super);
        function CallbackRoutes() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.state = defaultState;
            _this.update = function (_a) {
                var route = _a.route, state = _a.state;
                if (route && state) {
                    _this.setState({ appState: state }, function () {
                        changeRoute(route);
                    });
                }
                else if (route) {
                    changeRoute(route);
                }
                else if (state) {
                    _this.setState({ appState: state });
                }
            };
            return _this;
        }
        CallbackRoutes.prototype.componentDidMount = function () {
            var _this = this;
            var handleNewStates = function (newRoute, _a) {
                var sync = _a.sync, async = _a.async;
                if (sync) {
                    _this.update(sync);
                }
                else {
                    _this.setState({
                        route: newRoute,
                    });
                }
                var runSetState = pipeable_1.pipe(O.fromNullable(async), O.map(function (someAsync) { return pipeable_1.pipe(someAsync, T.map(_this.update), T.map(function () { return undefined; })); }), O.getOrElse(function () { return T.of(undefined); }));
                runSetState();
            };
            history.listen(function (location, action) {
                var newRoute = fp_ts_routing_1.parse(parser, fp_ts_routing_1.Route.parse(location.pathname), notFoundRoute);
                handleNewStates(newRoute, router(_this.state.appState, actionToNavResp(action))(newRoute, _this.state.route));
            });
            var newRoute = fp_ts_routing_1.parse(parser, fp_ts_routing_1.Route.parse(history.location.pathname), notFoundRoute);
            handleNewStates(newRoute, router(this.state.appState, actionToNavResp(history.action))(newRoute, this.state.route));
        };
        CallbackRoutes.prototype.render = function () {
            return (react_1.default.createElement(Root, { appState: this.state.appState, route: this.state.route, update: this.update }));
        };
        return CallbackRoutes;
    }(react_1.Component));
}
exports.default = withRouter;
