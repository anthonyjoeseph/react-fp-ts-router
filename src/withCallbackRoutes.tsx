import React, { Component } from 'react';
import * as T from 'fp-ts/lib/Task';
import { pipe } from 'fp-ts/lib/pipeable';
import * as History from 'history';
import { parse, Route, Parser } from 'fp-ts-routing';

export interface AppStateWithRoute<S, R> {
  appState?: Pick<S, keyof S>;
  route?: Route;
}

export type UpdateState<S, R> = (a: AppStateWithRoute<S, R>) => void

export type DefaultStateFromRoute<S, R> = (
  route: R,
  location?: History.Location<History.LocationState>,
  action?: History.Action,
) => S;

export type StateTaskFromRoute<S, R> = (
  appState: S,
  location?: History.Location<History.LocationState>,
  action?: History.Action,
) => (
  route: R,
) => T.Task<AppStateWithRoute<S, R>>;

interface AppStateProps<S, R> {
  appState: S;
  updateState: UpdateState<S, R>;
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
 * @param newStateFromRoute - Callback on component mount and route change
 */
export default function withCallbackRoutes<S, R>(
  Root: React.ComponentType<AppStateProps<S, R>>,
  parser: Parser<R>,
  notFoundRoute: R,
  defaultStateFromRoute: DefaultStateFromRoute<S, R>,
  newStateFromRoute: StateTaskFromRoute<S, R>,
): React.ComponentType<{}>{

  const history = History.createBrowserHistory();

  return class CallbackRoutes extends Component<{}, S>{
    
    public state = defaultStateFromRoute(
      parse(parser, Route.parse(history.location.pathname), notFoundRoute)
    );

    private updateStateWithRoute = (a: AppStateWithRoute<S, R>): void => {
      const { appState, route } = a;
      if (appState) {
        this.setState(appState, () => {
          if (route) {
            history.push(route.toString());
          }
        });
      } else if (route) {
        history.push(route.toString());
      }
    }

    public componentDidMount(): void {
      history.listen((location, action) => {
        const runSetState = pipe(
          newStateFromRoute(this.state, location, action)(
            parse(parser, Route.parse(location.pathname), notFoundRoute),
          ),
          T.map((a) => this.updateStateWithRoute(a)),
        );
        runSetState();
      });
      const runSetState = pipe(
        newStateFromRoute(this.state, history.location, history.action)(
          parse(parser, Route.parse(history.location.pathname), notFoundRoute),
        ),
        T.map((a) => this.updateStateWithRoute(a)),
      );
      runSetState();
    }

    render(): JSX.Element {
      return (
        <Root
          appState={this.state}
          updateState={(a): void => this.updateStateWithRoute(a)}
        />
      );
    }
  };
}