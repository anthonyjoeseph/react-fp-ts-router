import React, { Component } from 'react';
import * as T from 'fp-ts/lib/Task';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as History from 'history';
import { parse, Route, Parser } from 'fp-ts-routing';
import * as N from './Navigation';
import * as A from './Action';

export type UpdateRouter<S, R> = (params: UpdateRouterParams<S, R>) => void;

export interface UpdateRouterParams<S, R> {
  routingState?: S;
  navigation?: N.Navigation<R>;
}

export type OnRoute<S, R> = (
  newRoute: R,
  routingState: S,
  oldRoute: R,
  Action: A.Action,
) => OnRouteResponse<S, R>;

export interface OnRouteResponse<S, R> {
  sync?: UpdateRouterParams<S, R>;
  async?: T.Task<UpdateRouterParams<S, R>>;
}

export interface ManagedStateRouterProps<S, R> {
  routingState: S;
  route: R;
  updateRouter: (u: UpdateRouterParams<S, R>) => void;
}

const actionToNavResp = (a: History.Action): A.Action => {
  if (a === 'PUSH') return A.push;
  if (a === 'POP') return A.pop;
  return A.replace;
};

/**
 * Represents the current route as an {@link https://dev.to/gcanti/functional-design-algebraic-data-types-36kf ADT} and safely manages arbitrary routing state.
 * Uses {@link https://github.com/ReactTraining/history#readme history} under the hood.
 * You can make your own ADTs with 
 * {@link https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types union types}
 * and {@link https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards type guards},
 * or you can use the {@link https://gcanti.github.io/fp-ts-codegen/ fp-ts-codegen playground}
 * to easily generate them and their associated functions.
 * 
 * @template S - Managed routing state
 * @template R - Routing ADT type
 * @param Root - Your app's root component
 * @param parser - Converts url path strings into routing ADT
 * @param formatter - Converts routing ADT into a url path string
 * @param notFoundRoute - ADT to use when parser can't find a route
 * @param defaultManagedState - Populates managed state before component is mounted
 * @param onRoute - updates the router using the new route and preexisting routing state
 */
export default function withRouter<S, R>(
  Root: React.ComponentType<ManagedStateRouterProps<S, R>>,
  parser: Parser<R>,
  formatter: ((r: R) => string),
  notFoundRoute: R,
  defaultManagedState: S,
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
  const firstRoute = parse(
    parser,
    Route.parse(history.location.pathname),
    notFoundRoute,
  );
  return class ManagedStateRouter extends Component<{}, { routingState: S; route: R }>{
    public state = {
      route: firstRoute,
      routingState: defaultManagedState,
    };

    public componentDidMount(): void {
      if (onRoute) {
        const handleHistory = (
          location: History.Location<History.LocationState>,
          action: History.Action,
        ): void => {
          const newRoute = parse(
            parser,
            Route.parse(location.pathname),
            notFoundRoute,
          );
          const { sync, async } = onRoute(
            newRoute,
            this.state.routingState,
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
        }
        // will not be invoked on the initial route
        history.listen(handleHistory);
        // invoke onRoute for the initial route
        handleHistory(history.location, history.action);
      }
    }

    private updateRouter = ({ navigation, routingState }: UpdateRouterParams<S, R>): void => {
      if (navigation && routingState) {
        this.setState({ routingState }, () => {
          navigate(navigation);
        });
      } else if (navigation) {
        navigate(navigation);
      } else if (routingState) {
        this.setState({ routingState });
      }
    }

    private updateRouterAsync = (
      async: T.Task<UpdateRouterParams<S, R>> | undefined,
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
          routingState={this.state.routingState}
          route={this.state.route}
          updateRouter={this.updateRouter}
        />
      );
    }
  };
}
