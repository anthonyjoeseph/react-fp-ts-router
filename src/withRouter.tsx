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
  navigationResponse: NS.NavigationResponse,
) => S;

export type UpdateState<S, R> = (s: StateWithRequest<S, R>) => void;

export interface StateWithRequest<S, R> {
  state?: S;
  route?: NQ.NavigationRequest<R>;
}

export type Router<S, R> = (
  appState: S,
  navigationResponse: NS.NavigationResponse,
) => (
  newRoute: R,
  oldRoute: R,
) => RouterResponse<S, R>;

export interface RouterResponse<S, R> {
  sync?: StateWithRequest<S, R>;
  async?:  T.Task<StateWithRequest<S, R>>;
}

interface AppStateProps<S, R> {
  appState: S;
  route: R;
  update: (s: StateWithRequest<S, R>) => void;
}

const actionToNavResp = (a: History.Action): NS.NavigationResponse => {
  if (a === 'PUSH') return NS.push;
  if (a === 'POP') return NS.pop;
  return NS.replace;
};

const history = History.createBrowserHistory();

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
  unParser: ((r: R) => string),
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
  const changeRoute = NQ.fold<R, void>({
    onpush: (route) => history.push(unParser(route).toString()),
    onreplace: (route) => history.replace(unParser(route).toString()),
    onpushExt: (route) => history.push(route),
    onreplaceExt: (route) => history.replace(route),
    ongo: (numSessions) => history.go(numSessions),
    ongoBack: () => history.goBack(),
    ongoForward: () => history.goForward(),
  });
  return class CallbackRoutes extends Component<{}, { appState: S; route: R }>{
    
    public state = defaultState;
    public componentDidMount(): void {
      const handleNewStates = (
        newRoute: R,
        { sync, async }: RouterResponse<S, R>
      ): void => {
        if (sync) {
          this.update(sync);
        } else {
          this.setState({
            route: newRoute,
          });
        }
        const runSetState = pipe(
          O.fromNullable(async),
          O.map(someAsync => pipe(
            someAsync,
            T.map(this.update),
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
    
    private update = ({ route, state }: StateWithRequest<S, R>): void => {
      if (route && state) {
        this.setState({ appState: state }, () => {
          changeRoute(route);
        });
      } else if (route) {
        changeRoute(route);
      } else if (state) {
        this.setState({ appState: state });
      }
    }

    render(): JSX.Element {
      return (
        <Root
          appState={this.state.appState}
          route={this.state.route}
          update={this.update}
        />
      );
    }
  };
}
