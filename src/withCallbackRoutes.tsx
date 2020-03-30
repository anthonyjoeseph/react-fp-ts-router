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

export type DefaultStateFromRoute<S, R> = (route: R) => S;

export type StateTaskFromRoute<S, R> = (
  appState: S,
) => (
  route: R,
) => T.Task<AppStateWithRoute<S, R>>;

interface AppStateProps<S, R> {
  appState: S;
  updateState: UpdateState<S, R>;
}

/**
 * @template S - Global app state
 * @template R - User-defined route type
 * @param {S,R} Root - Your app's root component
 * @param {R} parser - Converts fp-ts-parsing's Route into user-defined route
 * @param {R} notFoundRoute - User-defined route to use when parser can't find a route
 * @param {S,R} defaultStateFromRoute - Populates app's global state before component is mounted
 * @param {S,R} newStateFromRoute - Callback on component mount and route change
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
      history.listen((location) => {
        const runSetState = pipe(
          newStateFromRoute(this.state)(
            parse(parser, Route.parse(location.pathname), notFoundRoute),
          ),
          T.map((a) => this.updateStateWithRoute(a)),
        );
        runSetState();
      });
      const runSetState = pipe(
        newStateFromRoute(this.state)(
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