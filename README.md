# react-fp-ts-router
Root component router that parses routes with [fp-ts-routing](https://github.com/gcanti/fp-ts-routing)

Updates global state as a callback, and [narrows](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates) global state type further down the component tree.

Vaguely inspired by [real world halogen](https://github.com/thomashoneyman/purescript-halogen-realworld)

Thanks to Giulio Canti for [fp-ts](https://github.com/gcanti/fp-ts) and [fp-ts-routing](https://github.com/gcanti/fp-ts-routing)

## Installation
`yarn add react-fp-ts-router`

# Docs

## Full example
[Code from this readme](https://github.com/anthonyjoeseph/react-fp-ts-router/blob/master/example/src/ReadmeExample.tsx)

## Globals You Must Create

Your app's state:

```ts
interface AppState {
  text?: string;
}
```

Your app's parsers (using [`unionize`](https://github.com/pelotom/unionize) for a route [sum type](https://jrsinclair.com/articles/2019/algebraic-data-types-what-i-wish-someone-had-explained-about-functional-programming/) is recommended):

```ts
import * as R from 'fp-ts-routing';
import * as U from 'unionize';

const AppRoute = U.unionize({
  Landing: {},
  Show: {},
  NotFound: {}
});
type AppRoute = U.UnionOf<typeof AppRoute>

const landingDuplex = R.end;
const showDuplex = R.lit('show').then(R.end);
const parser = R.zero<AppRoute>()
  .alt(landingDuplex.parser.map(() => AppRoute.Landing()))
  .alt(showDuplex.parser.map(() => AppRoute.Show()));
```

## Router

Creates a root component with global state managed by formatters and parsers from [fp-ts-routing](https://github.com/gcanti/fp-ts-routing) (uses `createBrowserHistory` from [history](https://github.com/ReactTraining/history#readme) to listen for actual callbacks).

### Types
```ts
import { Parser } from 'fp-ts-routing'
import * as History from 'history'

interface AppStateWithRoute<S, R> {
  appState?: Pick<S, keyof S>;
  route?: Route;
}
type UpdateState<S, R> = (a: AppStateWithRoute<S, R>) => void
type DefaultStateFromRoute<S, R> = (
  route: R,
  location?: History.Location<History.LocationState>,
  action?: History.Action,
) => S
type StateTaskFromRoute<S, R> = (
  appState: S,
  location?: History.Location<History.LocationState>,
  action?: History.Action,
) => (
  route: R,
) => T.Task<AppStateWithRoute<S, R>>

function withCallbackRoutes<S, R>(
    Root: React.ComponentType<AppStateProps<S, R>>,
    parser: Parser<R>,
    notFoundRoute: R,
    defaultStateFromRoute: DefaultStateFromRoute<S, R>,
    newStateFromRoute: StateTaskFromRoute<S, R>
): React.ComponentType<{}>
```

### Params

| Type Variable | Description |
| ------------- | ----------- |
| S             | Global app state |
| R             | User-defined route type |

| Param  | Description  |
| ------ | ------------ |
| Root  | Your app's root component |
| parser | Converts [Route](https://gcanti.github.io/fp-ts-routing/modules/index.ts.html#route-class) into user-defined route |
| notFoundRoute | User-defined route to use when parser can't find a route |
| defaultStateFromRoute | Populates app's global state before component is mounted |
| newStateFromRoute | Callback on component mount and route change |

### Usage

```tsx
const App = withCallbackRoutes<AppState, AppRoute>(
  ({ appState, updateState }) => (
    <div>
      <HasTextRoute
        appState={appState}
        updateState={updateState}
      />
      <NoTextRoute
        appState={appState}
        updateState={updateState}
      />
    </div>
  ),
  parser,
  AppRoute.NotFound(),
  (_: AppRoute): AppState => ({}),
  (appState) => AppRoute.match({
    Show: () => T.of(appState.text === undefined
      ? ({ appState: { text: 'from route' } })
      : ({})),
    default: () => T.of({}),
  })
);
```

## Routes
Renders components who accept a narrower version of the global state.

Think of `withNarrowerAppState` as analagous to [`<Route>` from React-Router](https://reacttraining.com/react-router/web/api/Route)

### Types
```ts
interface JustStateProps<S> {
  appState: S;
}
// this return type looks scarier than it is
function withNarrowerAppState<
  S, N extends S, T extends JustStateProps<N>
>(
  WrappedComponent: React.ComponentType<T>,
  renderCondition: (a: S) => a is N
): React.ComponentType<Omit<T, keyof JustStateProps<N>> & JustStateProps<S>>
```

### Params

| Type Variable | Description |
| ------------- | ----------- |
| S             | Global app state |
| N             | Narrower app state |
| T             | All of the wrapped component's props |

| Param  | Description  |
| ------ | ------------ |
| WrappedComponent  | Component with narrow app state |
| renderCondition | Type predicate to narrow component type |

### Usage

```tsx
const NoTextRoute = withNarrowerAppState(
  ({
    updateState
  }: {
    appState: {};
    updateState: UpdateState<AppState, AppRoute>;
  }) => (
    <div>
      landing
      <button
        onClick={() => updateState({
          appState: { text: 'from button click' },
          route: showDuplex.formatter.run(R.Route.empty, {}),
        })}
      >
        go to route
      </button>
    </div>
  ),
  (appState: AppState): appState is {} => appState.text === undefined
);

const HasTextRoute = withNarrowerAppState(
  ({
    appState,
    updateState
  }: {
    appState: { text: string };
    updateState: UpdateState<AppState, AppRoute>;
  }) => (
    <div>
      {appState.text}
      <button
        onClick={() => updateState({
          appState: { text: undefined },
          route: homeDuplex.formatter.run(R.Route.empty, {}),
        })}
      >
        go to landing
      </button>
    </div>
  ),
  (appState: AppState): appState is { text: string } => appState.text !== undefined
);
```
