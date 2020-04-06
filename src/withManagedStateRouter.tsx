import React, { Component } from 'react';
import * as T from 'fp-ts/lib/Task';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as History from 'history';
import { parse, Route, Parser } from 'fp-ts-routing';
import * as N from './Navigation';
import * as A from './Action';

export type UpdateRouter<S, R> = (s: ManageRouter<S, R>) => void;

export interface ManageRouter<S, R> {
  newState?: S;
  navigation?: N.Navigation<R>;
}

export interface RoutingResponse<S, R> {
  sync?: ManageRouter<S, R>;
  async?:  T.Task<ManageRouter<S, R>>;
}

export type OnRoute<S, R> = (
  newRoute: R,
  managedState: S,
  oldRoute: R,
  Action: A.Action,
) => RoutingResponse<S, R>;

export interface ManagedStateRouterProps<S, R> {
  managedState: S;
  route: R;
  updateRouter: UpdateRouter<S, R>;
}

const actionToNavResp = (a: History.Action): A.Action => {
  if (a === 'PUSH') return A.push;
  if (a === 'POP') return A.pop;
  return A.replace;
};

/**
 * Creates a root component with global state managed by a functional router
 * (uses `createBrowserHistory` from {@link https://github.com/ReactTraining/history#readme history} for routing)
 * 
 * @template S - Managed state
 * @template R - Arbitrary routing type
 * @param Root - Your app's root component
 * @param parser - Converts url path strings into arbitrary routing data
 * @param formatter - Converts arbitrary routing data into a url path string
 * @param notFoundRoute - Generic routing data to use when parser can't find a route
 * @param defaultManagedState - Populates managed state before component is mounted
 * @param onRoute - updates the router using the new route and preexisting state
 */
export default function withManagedStateRouter<S, R>(
  Root: React.ComponentType<ManagedStateRouterProps<S, R>>,
  parser: Parser<R>,
  formatter: ((r: R) => string),
  notFoundRoute: R,
  defaultState: S,
  onRoute?: OnRoute<S, R>,
): React.ComponentType<{}>{
  const history = History.createBrowserHistory();
  const navigate = N.fold<R, void>({
    onpush: (route) => history.push(formatter(route).toString()),
    onreplace: (route) => history.replace(formatter(route).toString()),
    onpushExt: (route) => history.push(route),
    onreplaceExt: (route) => history.replace(route),
    ongo: (numSessions) => history.go(numSessions),
    ongoBack: () => history.goBack(),
    ongoForward: () => history.goForward(),
  });
  return class ManagedStateRouter extends Component<{}, { managedState: S; route: R }>{
    public constructor(props: {}){
      super(props);
      const firstRoute = parse(
        parser,
        Route.parse(history.location.pathname),
        notFoundRoute,
      );
      if (!onRoute) {
        this.state = {
          managedState: defaultState,
          route: firstRoute,
        };
      } else {
        const { sync, async } = onRoute(
          firstRoute,
          defaultState,
          firstRoute,
          actionToNavResp(history.action),
        );
        this.state = {
          managedState: sync?.newState || defaultState,
          route: firstRoute,
        };
        if (sync?.navigation) {
          navigate(sync.navigation);
        }
        this.updateRouterAsync(async);

        // will not be invoked on initial route
        history.listen((location, action) => {
          const newRoute = parse(
            parser,
            Route.parse(location.pathname),
            notFoundRoute,
          );
          const { sync, async } = onRoute(
            newRoute,
            this.state.managedState,
            this.state.route,
            actionToNavResp(action),
          );
          if (sync) {
            this.updateRouter(sync);
          } else {
            this.setState({
              route: newRoute,
            });
          }
          this.updateRouterAsync(async);
        });
      }
    }

    private updateRouter = ({ navigation, newState }: ManageRouter<S, R>): void => {
      if (navigation && newState) {
        this.setState({ managedState: newState }, () => {
          navigate(navigation);
        });
      } else if (navigation) {
        navigate(navigation);
      } else if (newState) {
        this.setState({ managedState: newState });
      }
    }

    private updateRouterAsync = (
      async: T.Task<ManageRouter<S, R>> | undefined,
    ): void => {
      const runUpdate = pipe(
        O.fromNullable(async),
        O.map(someAsync => pipe(
          someAsync,
          T.map(this.updateRouter),
          T.map(() => undefined),
        )),
        O.getOrElse(() => T.of(undefined)),
      );
      runUpdate();
    };

    render(): JSX.Element {
      return (
        <Root
          managedState={this.state.managedState}
          route={this.state.route}
          updateRouter={this.updateRouter}
        />
      );
    }
  };
}
