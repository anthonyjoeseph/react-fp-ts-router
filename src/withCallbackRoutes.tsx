import React, { Component } from 'react';
import * as T from 'fp-ts/lib/Task';
import { pipe } from 'fp-ts/lib/pipeable';
import * as History from 'history';

export interface AppStateWithRoute<S> {
  appState?: Pick<S, keyof S>;
  route?: string;
}

export type UpdateState<S> = (a: AppStateWithRoute<S>) => void

export type DefaultStateFromRoute<S> = (
  location: History.Location<History.LocationState>,
  action: History.Action,
) => S;

export type StateTaskFromRoute<S> = (
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
  defaultStateFromRoute: DefaultStateFromRoute<S>,
  newStateFromRoute: StateTaskFromRoute<S>,
): React.ComponentType<{}>{

  const history = History.createBrowserHistory();

  return class CallbackRoutes extends Component<{}, S>{
    
    public state = defaultStateFromRoute(history.location, history.action);

    private updateStateWithRoute = (a: AppStateWithRoute<S>): void => {
      const { appState, route } = a;
      if (appState) {
        this.setState(appState, () => {
          if (route) {
            history.push(route);
          }
        });
      } else if (route) {
        history.push(route);
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