# react-fp-ts-router
An [HOC](https://reactjs.org/docs/higher-order-components.html) that builds a router that represents the current route in react state as an [ADT](https://dev.to/gcanti/functional-design-algebraic-data-types-36kf) and safely manages arbitrary [routing state](#what-should-my-routing-state-be?), which is the intersection of routing logic and render logic.

Thanks to Giulio Canti for [fp-ts](https://github.com/gcanti/fp-ts) and [fp-ts-routing](https://github.com/gcanti/fp-ts-routing)

## Installation
`yarn add react-fp-ts-router`

# Docs

## Full example
[Code from this readme](https://github.com/anthonyjoeseph/react-fp-ts-router/blob/master/example/src/ReadmeExample.tsx)


## Output prop types

The `Router` component that `withRouter` wraps is given these props:

```ts
import * as N from 'react-fp-ts-routing/lib/Navigation'
export type UpdateRouter<S, R> = (params: UpdateRouterParams<S, R>) => void;
export interface UpdateRouterParams<S, R> {
  routingState?: S;
  navigation?: N.Navigation<R>;
}
export interface ManagedStateRouterProps<S, R> {
  routingState: S;
  route: R;
  updateRouter: (u: UpdateRouterParams<S, R>) => void;
}
```

| Prop  | Description  |
| ------ | ------------ |
| `routingState`  | Your router's [routing state](#what-should-my-routing-state-be?) |
| `route` | Your app's current route, represented as your routing ADT |
| `updateRouter` | Updates router with a Navigation wrapping a routing ADT and/or new [routing state](#what-should-my-routing-state-be?) |

## `withRouter` [HOC](https://reactjs.org/docs/higher-order-components.html) function type
```tsx
import { Parser } from 'fp-ts-routing'
import * as N from 'react-fp-ts-routing/lib/Navigation'
import * as A from 'react-fp-ts-routing/lib/Action'
import * as History from 'history'

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
function withRouter<S, R, T extends {} = {}>(
  Router: React.ComponentType<T & ManagedStateRouterProps<S, R>>,
  parser: Parser<R>,
  formatter: ((r: R) => string),
  notFoundRoute: R,
  defaultManagedState: S,
  onRoute?: OnRoute<S, R>,
): React.ComponentType<T>
```

## Params

| Type Variable | Description |
| ------------- | ----------- |
| `S`             | Managed [routing state](#what-should-my-routing-state-be?) |
| `R`             | Routing ADT type |
| `T`             | Other arbitrary props passed into `Router`, defaults to the empty object |

| Param  | Description  |
| ------ | ------------ |
| `Router`  | Your app's router component |
| `parser` | Converts url path strings into routing ADT |
| `formatter` | Converts routing ADT into a url path string |
| `notFoundRoute` | ADT to use when `parser` can't find a route |
| `defaultRoutingState` | Populates [routing state](#what-should-my-routing-state-be?) before component is mounted |
| `onRoute` | Updates the router using the new route and preexisting [routing state](#what-should-my-routing-state-be?) |

## Globals You Must Create

Your app's parser and formatter. Check out the [fp-ts-routing docs](https://github.com/gcanti/fp-ts-routing#usage) for more info. 

This example uses [`unionize`](https://github.com/pelotom/unionize) for its [ADT](https://jrsinclair.com/articles/2019/algebraic-data-types-what-i-wish-someone-had-explained-about-functional-programming/), but you could use simple [union types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types) and [type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards), or you could use the [fp-ts-codegen playground](https://gcanti.github.io/fp-ts-codegen/) to easily generate an ADT and its associated functions.

```ts
import * as R from 'fp-ts-routing';
import * as U from 'unionize';

const RouteADT = U.unionize({
  Landing: {},
  Show: {},
});
type RouteADT = U.UnionOf<typeof RouteADT>
const defaultRoute: RouteADT = RouteADT.Landing();

const landingDuplex = R.end;
const showDuplex = R.lit('show').then(R.end);
const parser = R.zero<RouteADT>()
  .alt(landingDuplex.parser.map(() => RouteADT.Landing()))
  .alt(showDuplex.parser.map(() => RouteADT.Show()));
const formatter = RouteADT.match({
  Landing: () => R.format(landingDuplex.formatter, {}),
  Show: () => R.format(showDuplex.formatter, {}),
});
```

And your [routing state](#what-should-my-routing-state-be?). It can be anything (see below), but we'll use an optional string for this simple example:

```ts
type RoutingState = O.Option<string>
const defaultRoutingState: RoutingState = O.none;
```

## Usage

```tsx
const App = withRouter<RoutingState, RouteADT>(
  ({ routingState, updateRouter }) => pipe(
    routingState,
    O.map(text => (
      <HasTextRoute
        text={text}
        updateRouter={updateRouter}
      />
    )),
    O.getOrElse(() => (
      <NoTextRoute
        updateRouter={updateRouter}
      />
    ))
  ),
  parser,
  formatter,
  defaultRoute,
  defaultRoutingState,
  (route, managedState) => RouteADT.match<OnRouteResponse<RoutingState, RouteADT>>({
    Show: () => ({
      sync: {
        routingState: O.isNone(managedState) ? O.some('from route') : managedState,
      },
    }),
    default: () => ({ }),
  })(route)
);

const NoTextRoute = ({
  updateRouter
}: { updateRouter: UpdateRouter<RoutingState, RouteADT> }) => (
  <div>
    landing
    <button
      onClick={() => updateRouter({
        navigation: N.push(RouteADT.Show()),
        routingState: O.some('from button click'),
      })}
    >
      go to route
    </button>
  </div>
);

const HasTextRoute = ({
  text,
  updateRouter
}: {
  text: string;
  updateRouter: UpdateRouter<RoutingState, RouteADT>;
}) => (
  <div>
    {text}
    <button
      onClick={() => updateRouter({
        routingState: O.none,
        navigation: N.push(RouteADT.Landing()),
      })}
    >
      go to landing
    </button>
  </div>
);
```

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


## What should my routing state be?

If you find yourself doing a stateful redirect like this:

```tsx
// Comp.tsx
componentDidMount() {
  if (this.state.data === 'bad') {
    history.push('badRoute');
  }
}
render() {
  if (this.state.data === 'bad') return <div/>;
  return (...);
}
// in parent component
{route === 'goodRoute' && (
  <Comp />
)}
```

You should put `data` into `routingState` and do this instead:

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

If you find yourself pre-loading data before a reroute with a [setState callback](https://reactjs.org/docs/react-component.html#setstate) like this:

```tsx
<button onClick={() => {
  T.task.map(preLoadData, data => {
    this.setState({ data }, () => history.push('route'));
  })()
}}>load stuff</button>
```

Stop using `history`!

You should put `data` into `routingState` and do this instead:

```tsx
// `updateRouter` will update your routing state before the reroute is triggered
<button onClick={() => {
  T.task.map(preLoadData, data => this.props.updateRouter({
    routingState: data,
    navigation: Navigation.push(RouteADT.route()),
  }))()
}}>load stuff</button>
```

If you find yourself initializing data after a reroute like this:

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

You should put `data` into `routingState` and do this instead:

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

Your routing state should be the state in your app that determines stateful redirects (using `onRoute`), or that needs to be updated before a reroute (using `updateRouter`) or after a reroute (using `onRoute`).

You could also use routing state to reroute users to a 'loading' route until a fetch call returns, or to reroute unauthenticated users to a login route and back again once they're complete.

Routing state is meant to bridge your routing logic and your render logic, in order to de-couple routing logic from the component lifecycle.
