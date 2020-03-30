import React, { Component } from 'react';
import * as T from 'fp-ts/lib/Task';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as History from 'history';

export interface AppStateWithRoute<S> {
  appState: O.Option<S>;
  route: O.Option<string>;
}

export type UpdateState<S> = (a: AppStateWithRoute<S>) => void

export type NewStateFromRoute<S> = (
  appState: S,
  location: History.Location<History.LocationState>,
  action: History.Action,
) => T.Task<AppStateWithRoute<S>>;

interface AppStateProps<S> {
  appState: S;
  updateState: UpdateState<S>;
}

export default function withCallbackRoutes<S>(
  Root: React.ComponentType<AppStateProps<S>>,
  defaultState: S,
  newStateFromRoute: NewStateFromRoute<S>,
): React.ComponentType<{}>{
  const history = History.createBrowserHistory();
  return class CallbackRoutes extends Component<{}, S>{
    public state = defaultState;

    private updateStateWithRoute = (a: AppStateWithRoute<S>): void => {
      const { appState, route } = a;
      if (O.isSome(appState)) {
        this.setState(appState.value, () => {
          if (O.isSome(route)) {
            history.push(route.value);
          }
        });
      } else if (O.isSome(route)) {
        history.push(route.value);
      }
    }

    public componentDidMount(): void {
      history.listen((l, a) => {
        const runSetState = pipe(
          newStateFromRoute(this.state, l, a),
          T.map((a) => this.updateStateWithRoute(a)),
        );
        runSetState();
      });
      const runSetState = pipe(
        newStateFromRoute(this.state, history.location, history.action),
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