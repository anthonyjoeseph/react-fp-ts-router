import React from 'react';
import * as T from 'fp-ts/lib/Task';
import { Parser } from 'fp-ts-routing';
import * as NQ from './NavigationRequest';
import * as NS from './NavigationResponse';
export declare type DefaultStateFromRoute<S, R> = (route: R, navResponse: NS.NavigationResponse) => S;
export declare type Router<S, R> = (appState: S, navResponse: NS.NavigationResponse) => (route: R) => [Partial<S> | undefined, T.Task<Partial<S>> | undefined];
interface AppStateProps<S> {
    appState: S;
    updateState: (state: Partial<S>) => void;
}
export declare function createNavigator<R>(unParser: ((r: R) => string)): (r: NQ.NavigationRequest<R>) => void;
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
 * @param newStateFromRoute - Callback on component mount and route change
 */
export default function withCallbackRoutes<S, R>(Root: React.ComponentType<AppStateProps<S>>, parser: Parser<R>, notFoundRoute: R, defaultStateFromRoute: DefaultStateFromRoute<S, R>, router: Router<S, R>): React.ComponentType<{}>;
export {};
