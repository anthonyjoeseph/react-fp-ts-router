import React, { Component } from 'react';
import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Eq';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as History from 'history';
import { parse, Route, Parser } from 'fp-ts-routing';
import * as N from './Navigation';
import * as A from './Action';

export function reactMemoEq<P> (
  comp: React.ComponentType<P>,
  eq: E.Eq<P>,
): React.MemoExoticComponent<React.ComponentType<P>> {
  return React.memo(
    comp,
    eq.equals,
  );
}

export type InterceptRoute<R, I> = (
  newRoute: R,
  interceptable: I,
  oldRoute: R,
  Action: A.Action,
) => InterceptRouteResponse<R, I>;
export interface InterceptRouteResponse<R, I> {
  sync?: Interception<R, I>;
  async?: T.Task<Interception<R, I>>;
}
export interface Interception<R, I> {
  interceptable?: I;
  redirect?: N.Navigation<R>;
}
export interface InterceptingRouterProps<R, I> {
  route: R;
  interceptable: I;
  setInterceptable: SetInterceptable<I>;
}
export type SetInterceptable<I> = (newInterceptable?: I) => T.Task<void>;

const history = History.createBrowserHistory();

/**
 * Creates a function that reroutes using the provided routing {@link https://dev.to/gcanti/functional-design-algebraic-data-types-36kf ADT}
 * @template R - Routing ADT type
 * @param formatter - Converts routing ADT into a url path string
 */
export function createNavigator <R>(
  formatter: ((r: R) => string),
): (navigation: N.Navigation<R>) => void {
  return N.fold<R, void>({
    onpush: (route) => history.push(formatter(route).toString()),
    onreplace: (route) => history.replace(formatter(route).toString()),
    onpushExt: (route) => history.push(route),
    onreplaceExt: (route) => history.replace(route),
    ongo: (numSessions) => history.go(numSessions),
    ongoBack: () => history.goBack(),
    ongoForward: () => history.goForward(),
  });
}

const actionToNavResp = (a: History.Action): A.Action => {
  if (a === 'PUSH') return A.push;
  if (a === 'POP') return A.pop;
  return A.replace;
};

/**
 * Represents the current route in state as a provided routing {@link https://dev.to/gcanti/functional-design-algebraic-data-types-36kf ADT} and safely manages an interceptable.
 * Uses {@link https://github.com/ReactTraining/history#readme history} under the hood.
 * You can make your own ADTs with 
 * {@link https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types union types}
 * and {@link https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards type guards},
 * or you can use the {@link https://gcanti.github.io/fp-ts-codegen/ fp-ts-codegen playground}
 * to easily generate them and their associated functions.
 * 
 * @template R - Routing ADT type
 * @template I - Interceptable type
 * @template T - Arbitrary props passed through Router, defaults to the empty object
 * @param Router - Your app's router component
 * @param parser - Converts url path strings into routing ADT
 * @param notFoundRoute - ADT to use when parser can't find a route
 * @param defaultRoutingState - Populates managed state before component is mounted
 * @param interceptRoute - Reroute callback that updates the router using the new route and preexisting interceptable
 */
export default function withInterceptingRouter<R, I, T extends {} = {}>(
  Router: React.ComponentType<T & InterceptingRouterProps<R, I>>,
  parser: Parser<R>,
  formatter: ((r: R) => string),
  notFoundRoute: R,
  defaultInterceptable: I,
  interceptRoute: InterceptRoute<R, I>,
): React.ComponentType<T>{
  const firstRoute = parse(
    parser,
    Route.parse(history.location.pathname),
    notFoundRoute,
  );
  const navigate = createNavigator(formatter);
  return class InterceptingRouter extends Component<T, { route: R; interceptable: I }>{
    public state = {
      route: firstRoute,
      interceptable: defaultInterceptable,
    };

    public componentDidMount(): void {
      const handleHistory = (
        location: History.Location<History.LocationState>,
        action: History.Action,
      ): void => {
        const newRoute = parse(
          parser,
          Route.parse(location.pathname),
          notFoundRoute,
        );
        const { sync, async } = interceptRoute(
          newRoute,
          this.state.interceptable,
          this.state.route,
          actionToNavResp(action),
        );
        if (sync) {
          this.interceptSync(sync);
        } else {
          this.setState({
            route: newRoute,
          });
        }
        this.interceptAsync(async);
      }
      // will not be invoked on the initial route
      history.listen(handleHistory);
      // invoke onRoute for the initial route
      handleHistory(history.location, history.action);
    }

    private interceptSync = ({ interceptable, redirect }: Interception<R, I>): void => {
      if (redirect && interceptable) {
        this.setState({ interceptable }, () => {
          navigate(redirect);
        });
      } else if (redirect) {
        navigate(redirect);
      } else if (interceptable) {
        this.setState({ interceptable });
      }
    }

    private interceptAsync = (
      async: T.Task<Interception<R, I>> | undefined,
    ): void => {
      const runUpdate = pipe(
        O.fromNullable(async),
        O.map(someAsync => pipe(
          someAsync,
          T.map(this.interceptSync),
          T.map(() => undefined),
        )),
        O.getOrElse(() => T.of(undefined)),
      );
      runUpdate();
    };

    render = (): JSX.Element => (
      <Router
        route={this.state.route}
        interceptable={this.state.interceptable}
        setInterceptable={(
          newInterceptable: I | undefined,
        ): T.Task<void> => {
          if (!newInterceptable) {
            return T.of(undefined);
          }
          return (): Promise<void> => new Promise((resolve) => {
            this.setState({ interceptable: newInterceptable }, resolve);
          });
        }}
        {...this.props}
      />
    );
  };
}
