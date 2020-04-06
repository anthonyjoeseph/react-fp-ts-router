import React from 'react';
import * as T from 'fp-ts/lib/Task';
import { Parser } from 'fp-ts-routing';
import * as NQ from './NavigationRequest';
import * as NS from './NavigationResponse';
export declare type DefaultStateFromRoute<S, R> = (route: R, navigationResponse: NS.NavigationResponse) => S;
export declare type UpdateState<S, R> = (s: StateWithRequest<S, R>) => void;
export interface StateWithRequest<S, R> {
    state?: S;
    route?: NQ.NavigationRequest<R>;
}
export declare type Router<S, R> = (appState: S, navigationResponse: NS.NavigationResponse) => (newRoute: R, oldRoute: R) => RouterResponse<S, R>;
export interface RouterResponse<S, R> {
    sync?: StateWithRequest<S, R>;
    async?: T.Task<StateWithRequest<S, R>>;
}
interface AppStateProps<S, R> {
    appState: S;
    route: R;
    update: (s: StateWithRequest<S, R>) => void;
}
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
export default function withRouter<S, R>(Root: React.ComponentType<AppStateProps<S, R>>, parser: Parser<R>, unParser: ((r: R) => string), notFoundRoute: R, defaultStateFromRoute: DefaultStateFromRoute<S, R>, router: Router<S, R>): React.ComponentType<{}>;
export {};
