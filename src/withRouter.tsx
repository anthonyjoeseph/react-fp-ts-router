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
  newRoute: R,
  oldRoute: R,
) => RouterResponse<S>;

export interface RouterResponse<S> {
  syncState?: S;
  asyncState?:  T.Task<S>;
}

interface AppStateProps<S, R> {
  appState: S;
  updateState: (state: S | undefined) => void;
  route: R;
}

const history = History.createBrowserHistory();

export function createNavigator <R>(
  unParser: ((r: R) => string),
): (r: NQ.NavigationRequest<R>) => void {
  return NQ.fold<R, void>({
    onpush: (route) => history.push(unParser(route).toString()),
    onreplace: (route) => history.replace(unParser(route).toString()),
    onpushExt: (route) => history.push(route),
    onreplaceExt: (route) => history.replace(route),
    ongo: (numSessions) => history.go(numSessions),
    ongoBack: () => history.goBack(),
    ongoForward: () => history.goForward(),
  });
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
export default function withRouter<S, R>(
  Root: React.ComponentType<AppStateProps<S, R>>,
  parser: Parser<R>,
  notFoundRoute: R,
  defaultStateFromRoute: DefaultStateFromRoute<S, R>,
  router: Router<S, R>,
): React.ComponentType<{}>{
  const firstRoute = parse(parser, Route.parse(history.location.pathname), notFoundRoute);
  const defaultState = ({
    appState: defaultStateFromRoute(
      firstRoute,
      actionToNavResp(history.action),
    ),
    route: firstRoute,
  });
  return class CallbackRoutes extends Component<{}, { appState: S; route: R }>{
    
    public state = defaultState;
    public componentDidMount(): void {
      const handleNewStates = (
        newRoute: R,
        { syncState, asyncState }: RouterResponse<S>
      ): void => {
        if (syncState) {
          this.setState({
            appState: syncState,
            route: newRoute,
          });
        } else {
          this.setState({
            route: newRoute,
          })
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
          router(this.state.appState, actionToNavResp(action))(
            newRoute,
            this.state.route,
          )
        );
      });
      const newRoute = parse(parser, Route.parse(history.location.pathname), notFoundRoute);
      handleNewStates(
        newRoute,
        router(this.state.appState, actionToNavResp(history.action))(
          newRoute,
          this.state.route,
        )
      );
    }
    
    private safeSetState = (s: S | undefined): void => {
      if (s) this.setState({ appState: s });
    }

    render(): JSX.Element {
      return (
        <Root
          appState={this.state.appState}
          updateState={this.safeSetState}
          route={this.state.route}
        />
      );
    }
  };
}
