import React, { Component } from 'react';
import * as T from 'fp-ts/lib/Task';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as History from 'history';
import { parse, Route, Parser } from 'fp-ts-routing';
import * as N from './Navigation';
import * as A from './Action';
import { UpdateRouter, OnRoute, ManageRouter } from './withManagedStateRouter';

/**
 * Remove from T the keys that are in common with K
 * https://github.com/typescript-cheatsheets/typescript-utilities-cheatsheet#utility-types
 */
type Optionalize<T extends K, K> = Omit<T, keyof K>;

/**
 * Navigation must be invoked after setState is called
 * A descriptive and intentionally scary name because this cannot be enforced with types
 */
export interface InputProps<S> {
  setExternalStateAndInvokeNavigateOnCallback: (navigate: () => void, newState?: S) => void;
}

export interface InputAndOutputProps<S> {
  externalState: S;
}

export interface OutputProps<S, R> {
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
 * @param onRoute - updates the router using the new route and preexisting state
 */
export default function withManagedExternalStateRouter<
  S, R, T extends InputAndOutputProps<S> & OutputProps<S, R> = InputAndOutputProps<S> & OutputProps<S, R>
>(
  Root: React.ComponentType<T>,
  parser: Parser<R>,
  formatter: ((r: R) => string),
  notFoundRoute: R,
  onRoute?: OnRoute<S, R>,
): React.ComponentType<
  Optionalize<T, OutputProps<S, R>> & InputProps<S>
>{
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
  const c = class ManagedExternalStateRouter extends Component<
    Optionalize<T, OutputProps<S, R>> & InputProps<S>,
    { route: R }
  >{
    public constructor(props: Optionalize<T, OutputProps<S, R>> & InputProps<S>){
      super(props);
      if (!onRoute) {
        this.state = {
          route: firstRoute,
        };
      } else {
        const { sync, async } = onRoute(
          firstRoute,
          props.externalState,
          firstRoute,
          actionToNavResp(history.action),
        );
        this.state = {
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
            this.props.externalState,
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

    private updateRouter: UpdateRouter<S, R> = (
      { navigation, newState }: ManageRouter<S, R>,
    ) => {
      if (navigation && newState) {
        this.props.setExternalStateAndInvokeNavigateOnCallback(() => {
          navigate(navigation);
        }, newState);
      } else if (navigation) {
        navigate(navigation);
      } else if (newState) {
        this.props.setExternalStateAndInvokeNavigateOnCallback((): void => { }, newState);
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
          externalState={this.props.externalState}
          route={this.state.route}
          updateRouter={this.updateRouter}
          // Note that the {...this.props as T} assertion is needed because of a current bug in TS 3.2
          // https://github.com/Microsoft/TypeScript/issues/28938#issuecomment-450636046
          {...this.props as unknown as T}
        />
      );
    }
  };
  return c;
}
