import React, { Component } from 'react';
import * as T from 'fp-ts/lib/Task';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as History from 'history';
import { parse, Route, Parser } from 'fp-ts-routing';
import * as NQ from './NavigationRequest';
import * as NS from './NavigationResponse';

export type DefaultStateFromRoute<S, R> = (
  route: R,
  navResponse: NS.NavigationResponse,
) => S;

export type Router<S, R> = (
  appState: S,
  navResponse: NS.NavigationResponse,
) => (
  route: R,
) => RouterResponse<S>;

export interface RouterResponse<S> {
  syncState?: Partial<S>;
  asyncState?:  T.Task<Partial<S>>;
  updateRouteInState?: boolean;
}

interface AppStateProps<S, R> {
  appState: S;
  updateState: (state: Partial<S>) => void;
  route: R;
}

const history = History.createBrowserHistory();

export function createNavigator <R>(
  unParser: ((r: R) => string),
): (r: NQ.NavigationRequest<R>) => void {
  return NQ.fold<R, void>(
    (route) => history.push(unParser(route).toString()),
    (route) => history.replace(unParser(route).toString()),
    (route) => history.push(route),
    (route) => history.replace(route),
    (numSessions) => history.go(numSessions),
    () => history.goBack(),
    () => history.goForward(),
  );
} 

const actionToNavResp = (a: History.Action): NS.NavigationResponse => {
  if (a === 'PUSH') return NS.push;
  if (a === 'POP') return NS.pop;
  return NS.replace;
};

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
export default function withCallbackRoutes<S, R>(
  Root: React.ComponentType<AppStateProps<S, R>>,
  parser: Parser<R>,
  notFoundRoute: R,
  defaultStateFromRoute: DefaultStateFromRoute<S, R>,
  router: Router<S, R>,
): React.ComponentType<{}>{
  const firstRoute = parse(parser, Route.parse(history.location.pathname), notFoundRoute);
  const defaultState = ({
    ...defaultStateFromRoute(
      firstRoute,
      actionToNavResp(history.action),
    ),
    route: firstRoute,
  });
  return class CallbackRoutes extends Component<{}, S & { route: R }>{
    
    public state = defaultState;
    public componentDidMount(): void {
      const handleNewStates = (
        newRoute: R,
        {
          syncState,
          asyncState,
          updateRouteInState,
        }: RouterResponse<S>
      ): void => {
        if (syncState && updateRouteInState) {
          this.setState({
            ...syncState,
            route: newRoute,
          } as Pick<S & { route: R }, "route">);
        }
        const runSetState = pipe(
          O.fromNullable(asyncState),
          O.map(someAsync => pipe(
            someAsync,
            T.map(this.safeSetState),
            T.map(() => undefined),
          )),
          O.getOrElse(() => T.of(undefined)),
        );
        runSetState();
      };
      history.listen((location, action) => {
        const newRoute = parse(parser, Route.parse(location.pathname), notFoundRoute);
        handleNewStates(
          newRoute,
          router(this.state, actionToNavResp(action))(
            newRoute,
          )
        );
      });
      const newRoute = parse(parser, Route.parse(history.location.pathname), notFoundRoute);
      handleNewStates(
        newRoute,
        router(this.state, actionToNavResp(history.action))(
          newRoute,
        )
      );
    }
    private safeSetState = (a: Partial<S> | undefined): void => a !== undefined
      ? this.setState(a as Pick<S & { route: R }, keyof S | "route">)
      : undefined;

    render(): JSX.Element {
      return (
        <Root
          appState={this.state}
          updateState={this.safeSetState}
          route={this.state.route}
        />
      );
    }
  };
}
