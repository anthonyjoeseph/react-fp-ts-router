# react-fp-ts-router
An [HOC](https://reactjs.org/docs/higher-order-components.html) that builds a router that represents the current route in react state as an [ADT](https://dev.to/gcanti/functional-design-algebraic-data-types-36kf) and safely manages arbitrary [routing state](#when-should-i-use-routing-state?), which is the intersection of routing logic and render logic.

Thanks to Giulio Canti for [fp-ts](https://github.com/gcanti/fp-ts) and [fp-ts-routing](https://github.com/gcanti/fp-ts-routing). Thanks [React Training](https://reacttraining.com/) for [`history`](https://github.com/ReactTraining/history).

## Installation
`yarn add react-fp-ts-router`

# Usage

## `withRouter` example

[Example code](https://github.com/anthonyjoeseph/react-fp-ts-router/blob/master/example/src/ReadmeExample.tsx)

Check out the [fp-ts-routing docs](https://github.com/gcanti/fp-ts-routing#usage) for more info on parsers and formatters.

This example uses [`unionize`](https://github.com/pelotom/unionize) for its route [ADT](https://jrsinclair.com/articles/2019/algebraic-data-types-what-i-wish-someone-had-explained-about-functional-programming/), but you could use simple [union types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types) and [type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards), or you could use the [fp-ts-codegen playground](https://gcanti.github.io/fp-ts-codegen/) to easily generate an ADT and its associated functions.

## `withSimpleRouter`

If your app is static or has no need to update state in relation to routing, you can use `withSimpleRouter`. Be advised, however, that if [react routing anti-patterns](#when-should-i-use-routing-state?) start to creep into your app, you should use `withRouter` instead.

```tsx
const App = withSimpleRouter<RouteADT>(
  ({ route, setRoute }) => route.tag === 'Landing'
    ? (
      <div>
        Landing
        <button onClick={() => setRoute(N.push(RouteADT.Show()))}>
          show
        </button>
      </div>
    ) : (
      <div>
        <button onClick={() => setRoute(N.push(RouteADT.Landing()))}>
          hide
        </button>
      </div>
    ),
  parser,
  formatter,
  defaultRoute,
);
```

# When should I use routing state?

## Stateful Redirects

If you're using `withSimpleRouter` and you find yourself doing a stateful redirect like this:

```tsx
// Comp.tsx
componentDidMount() {
  if (this.state.data === 'bad') {
    this.props.setRoute(N.push(RouteADT.badRoute()));
  }
}
render() {
  if (this.state.data === 'bad') return null;
  return (...);
}
// in parent component
{route === 'goodRoute' && (
  <Comp />
)}
```

You should use `withRouter` instead, and move `data` into `routingState`:

```tsx
// `onRoute` is called before the `route` prop is updated
const onRoute = (route, routingState) => {
  if (route === 'goodRoute' && routingState === 'bad') {
    return {
      sync: {
        navigate: Navigate.push(RouteADT.badRoute()),
      }
    }
  } 
}
```

## Loading Data Before a Reroute

If you're using `withSimpleRouter` and you find yourself loading data before a reroute with a [setState callback](https://reactjs.org/docs/react-component.html#setstate) like this:

```tsx
<button onClick={() => {
  T.task.map(preLoadData, data => {
    this.setState({ data }, () => this.props.setRoute(RouteADT.newRoute()));
  })()
}}>load stuff</button>
```

You should use `withRouter` instead, and move `data` into `routingState`:

```tsx
// `updateRouter` will update your routing state before the reroute is triggered
<button onClick={() => {
  T.task.map(preLoadData, data => this.props.updateRouter({
    routingState: data,
    navigation: N.push(RouteADT.route()),
  }))()
}}>load stuff</button>
```

## Loading Data After a Reroute

If you're using `withSimpleRouter` and you find yourself initializing data after a reroute like this:

```tsx
// Comp.tsx
componentDidMount() {
  T.task.map(initializeData, data => this.setState({ data }))();
}
render(){
  if (this.state.data === undefined) return null;
  return (...);
}
// in parent component
{ route === RouteADT.newRoute() && (
  <Comp />
)}
```

You should use `withRouter` instead, and move `data` into `routingState`:

```tsx
// in your 'withRoute' invocation:
const onRoute = (route) => {
  if (route === RouteADT.newRoute()) {
    return {
      async: T.task.map(initializeData, data => ({ routingState: data }))
    }
  } 
}
// in parent component
{route === RouteADT.route() && routingState !== undefined (
  <Comp
    data={routingState}
  />
)}
```

## Summary

Your routing state should be the state in your app that determines stateful redirects (using `onRoute`), or that needs to be updated before a reroute (using `updateRouter`) or after a reroute (using `onRoute`).

You could also use routing state to reroute users to a 'loading' route until a fetch call returns, or to reroute unauthenticated users to a login route and back again once they're complete.

Routing state is meant to bridge your routing logic and your render logic, in order to de-couple routing logic from the component lifecycle.

# FAQ

## Can I have more than one router in my app?

You can, but you shouldn't. React offers no way to enforce this at compile time, but if `react-fp-ts-router` could prevent multiple router components or multiple instances of router components, it would. `withRouter` is an [HOC](https://reactjs.org/docs/higher-order-components.html) only because its parameters are constants, so passing them in through props wouldn't make sense. It's not meant to create a reusable component.

The route prop provided to the router is meant to be the [single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth) of the browser's current route.

## Isn't it cumbersome to [drill](https://kentcdodds.com/blog/prop-drilling/) the current route through all of my components's props?

While you are able to avoid this using [react context](https://reactjs.org/docs/context.html), route 'drilling' is actually a feature.

A best practice of this library is to nest several routing ADTs together to mirror your app's component tree hierarchy. This enables you to ensure correctness at compile time and eliminates null-checking. In this example, we see that the `LoggedIn` and `LoggedOut` components are relieved of the responsibility of handling irrelevant routes. This is one advantage we gain by having the current route represented globally.

```tsx
type AppRoute = {
  type: 'loggedIn';
  loggedInRoute: LoggedInRoute;
} | {
  type: 'loggedOut';
  loggedOutRoute: LoggedOutRoute;
}
type LoggedInRoute = ...;
type LoggedOutRoute = ...;
const Root = ({ route }: { route: AppRoute }) => {
  if (route.type === 'loggedIn') {
    return (
      <LoggedIn
        loggedInRoute={route.loggedInRoute}
      />
    )
  }
  return {
    return (
      <LoggedOut
        loggedOutRoute={route.loggedOutRoute}
      />
    );
  }
}
```

## Why is routing state global?

At first, this seems unintuitive. One of the advantages of React is that it allows state to be split into components. Distributing state across many components minimizes re-renders and encapsulates relevant information. All of becomes impossible when state is consolidated in your topmost component.

However, routing state is tightly coupled to the current route. Since the current route is global, routing state by definition must also be global.

On closer analysis, this makes sense. `onRoute` must handle any incoming route, so the state it modifies should model every possible outcome. `updateRouter` can navigate to any possible route, so the state it updates could affect any of them.

### Mitigating the pain

For these reasons listed above, routing state should be minimal. State unrelated to the current route should be handled elsewhere.

Use [`shouldComponentUpdate`](https://reactjs.org/docs/optimizing-performance.html#avoid-reconciliation) to prevent unwanted re-renders, or its function component analog, [`React.memo`](https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-shouldcomponentupdate):

```ts
const Memoized = React.memo(
  MyComponent,
  // returning true prevents a re-render
  (prevProps, nextProps) => prevProps.id === nextProps.id
)
```

`react-fp-ts-routing` provides a helper function called `reactMemoEq` that wraps `React.memo`, using an [`Eq`](https://github.com/gcanti/fp-ts/blob/master/test/Eq.ts) to compare props.

```tsx
import * as E from 'fp-ts/lib/Eq';
import { reactMemoEq } from 'react-fp-ts-router';

interface InnerCompProps { text: string, num: number }
const InnerComp = ({ text, num }: InnerCompProps) => (
  <div> text: {data} num: {num} <div/>
)
const Memoized = reactMemoEq(
  Inner,
  E.getStructEq<InnerCompProps>({
    text: E.eqString,
    num: E.eqNum,
  }),
)
const Landing = ({ routingState }) => (
  <Memoized
    text={routingState.text}
    num={routingState.num}
  />
);
```

Additionally, [Optics](https://github.com/gcanti/monocle-ts) can help you transform deeply nested routing state:

```ts
import * as M from 'monocle-ts';
import * as T from 'fp-ts/lib/Task';
import { pipe } from 'fp-ts/lib/pipeable';
interface RoutingState {
  user: {
    memories: {
      childhood: {
        favoriteColor?: string;
      }
    }
  }
}
const favoriteColorLens = M.Lens.fromPath<RoutingState>()([
  'user', 'memories', 'childhood', 'favoriteColor',
]);
const onRoute = (route: R, routingState: RoutingState) => {
  if (
    route.type === 'favoriteColorRoute'
    && favoriteColorLens.get(routingState) === undefined
  ) {
    return {
      async: {
        routingState: pipe(
          loadFavoriteColor(),
          T.map(
            (favoriteColor) => favoriteColorLens.set(favoriteColor)(routingState)
          )
        )
      },
    }
  }
};
```

# Docs

## `withSimpleRouter` [HOC](https://reactjs.org/docs/higher-order-components.html)

### `withSimpleRouter` Output Prop Types

The `Router` component that `withRouter` wraps is given the props `SimpleRouterProps<R>`:

```ts
import * as N from 'react-fp-ts-routing/lib/Navigation';
interface SimpleRouterProps<R> {
  route: R;
  setRoute: (navigation: N.Navigation<R>) => void;
}
```
| Type Variable | Description |
| ------------- | ----------- |
| `R`             | Routing ADT type |

| Prop  | Description  |
| ------ | ------------ |
| `route` | Your app's current route, represented as your routing ADT |
| `setRoute` | Updates router with a [`Navigation`](#internal-adts) wrapping a routing ADT |

### `withSimpleRouter` Function Type
```tsx
import { Parser } from 'fp-ts-routing'
import * as N from 'react-fp-ts-routing/lib/Navigation'
import * as A from 'react-fp-ts-routing/lib/Action'
import * as History from 'history'
function withSimpleRouter<R, T extends {} = {}>(
  Router: React.ComponentType<T & SimpleRouterProps<R>>,
  parser: Parser<R>,
  formatter: ((r: R) => string),
  notFoundRoute: R,
): React.ComponentType<T>
```

| Type Variable | Description |
| ------------- | ----------- |
| `R`             | Routing ADT type |
| `T`             | Other arbitrary props passed into `Router`, defaults to the empty object |

| Param  | Description  |
| ------ | ------------ |
| `Router`  | Your app's router component |
| `parser` | Converts url path strings into routing ADT |
| `formatter` | Converts routing ADT into a url path string |
| `notFoundRoute` | ADT to use when `parser` can't find a route |

## `withRouter` [HOC](https://reactjs.org/docs/higher-order-components.html)

### `withRouter` Output Prop Types

The `Router` component that `withRouter` wraps is given the props `RouterProps<S, R>`:

```ts
import * as N from 'react-fp-ts-routing/lib/Navigation';
type UpdateRouter<S, R> = (params: UpdateRouterParams<S, R>) => void;
interface UpdateRouterParams<S, R> {
  routingState?: S;
  navigation?: N.Navigation<R>;
}
interface RouterProps<S, R> {
  routingState: S;
  route: R;
  updateRouter: (u: UpdateRouterParams<S, R>) => void;
}
```
| Type Variable | Description |
| ------------- | ----------- |
| `S`             | [Routing state](#when-should-i-use-routing-state?) type |
| `R`             | Routing ADT type |

| Prop  | Description  |
| ------ | ------------ |
| `routingState`  | Your router's [routing state](#when-should-i-use-routing-state?) |
| `route` | Your app's current route, represented as your routing ADT |
| `updateRouter` | Updates router with a [`Navigation`](#internal-adts) wrapping a routing ADT and/or new [routing state](#when-should-i-use-routing-state?) |

### `withRouter` Function Type
```tsx
import { Parser } from 'fp-ts-routing'
import * as N from 'react-fp-ts-routing/lib/Navigation'
import * as A from 'react-fp-ts-routing/lib/Action'
import * as History from 'history'
type OnRoute<S, R> = (
  newRoute: R,
  routingState: S,
  oldRoute: R,
  Action: A.Action,
) => OnRouteResponse<S, R>;
interface OnRouteResponse<S, R> {
  sync?: UpdateRouterParams<S, R>;
  async?: T.Task<UpdateRouterParams<S, R>>;
}
function withRouter<S, R, T extends {} = {}>(
  Router: React.ComponentType<T & ManagedStateRouterProps<S, R>>,
  parser: Parser<R>,
  formatter: ((r: R) => string),
  notFoundRoute: R,
  defaultManagedState: S,
  onRoute?: OnRoute<S, R>,
): React.ComponentType<T>
```

| Type Variable | Description |
| ------------- | ----------- |
| `S`             | [Routing state](#when-should-i-use-routing-state?) type |
| `R`             | Routing ADT type |
| `T`             | Other arbitrary props passed into `Router`, defaults to the empty object |

| Param  | Description  |
| ------ | ------------ |
| `Router`  | Your app's router component |
| `parser` | Converts url path strings into routing ADT |
| `formatter` | Converts routing ADT into a url path string |
| `notFoundRoute` | ADT to use when `parser` can't find a route |
| `defaultRoutingState` | Populates [routing state](#when-should-i-use-routing-state?) before component is mounted |
| `onRoute` | Updates the router using the new route and preexisting [routing state](#when-should-i-use-routing-state?) |

## Internal ADTs

### Navigation

`Navigation` is an ADT representing the different possible [`history navigations`](https://github.com/ReactTraining/history/blob/master/docs/Navigation.md).

| `Navigation<R>` Type | Description |
| ------------- | ----------- |
| `N.push(route: R)` | Reroutes to routing ADT `R` |
| `N.replace(route: R)` | Reroutes to routing ADT `R` [without pushing new entry](https://stackoverflow.com/questions/39340108/what-is-the-trade-off-between-history-push-and-replace) onto the [history stack](https://developer.mozilla.org/en-US/docs/Web/API/History_API), so the browser's `back` button won't be able to go back to original location |
| `N.pushExt(path: string)` | `N.push` that can reroute to somewhere outside of your app |
| `N.replaceExt(path: string)` | `N.replace` that can reroute to somewhere outside of your app |
| `N.go(delta: number)` | Moves `delta` number of times through the session [history stack](https://developer.mozilla.org/en-US/docs/Web/API/History_API). Can be positive or negative. |
| `N.goBack` | Moves back one page in the [history stack](https://developer.mozilla.org/en-US/docs/Web/API/History_API) |
| `N.goForward` | Moves forward one pack in the [history stack](https://developer.mozilla.org/en-US/docs/Web/API/History_API) |

### Action

`Action` is an ADT representing the different possible ways the browser arrived at its current location.

| `Action` Type | Description |
|---------------|-------------|
| `A.push` | The url was pushed onto the stack. (The user clicked a link, or your app used `N.push`) |
| `A.pop` | The url was popped from the stack. (The user hit the browser's `back` button, or your app used `N.go` or `N.goBack`) |
| `A.replace` | The url replaced the top entry of the stack. (Your app used `N.replace`) |


## TODO
- use [`window.history`](https://developer.mozilla.org/en-US/docs/Web/API/Window/history) instead of [`history`](https://github.com/ReactTraining/history)
