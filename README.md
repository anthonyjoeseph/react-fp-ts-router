# react-fp-ts-router
Represents the current route in state as an [ADT](https://dev.to/gcanti/functional-design-algebraic-data-types-36kf) and safely manages arbitrary routing state. Manages the intersection of routing logic and render logic.

Vaguely inspired by [real world halogen](https://github.com/thomashoneyman/purescript-halogen-realworld)

Thanks to Giulio Canti for [fp-ts](https://github.com/gcanti/fp-ts) and [fp-ts-routing](https://github.com/gcanti/fp-ts-routing)

## Installation
`yarn add react-fp-ts-router`

# Docs

## Full example
[Code from this readme](https://github.com/anthonyjoeseph/react-fp-ts-router/blob/master/example/src/ReadmeExample.tsx)

## Globals You Must Create

Your routing state:

```ts
type RoutingState = O.Option<string>
```

Your app's parser and formatter. This example uses [`unionize`](https://github.com/pelotom/unionize) for its [ADT](https://jrsinclair.com/articles/2019/algebraic-data-types-what-i-wish-someone-had-explained-about-functional-programming/), but you could use simple [union types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types) and [type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards), or you could use the [fp-ts-codegen playground](https://gcanti.github.io/fp-ts-codegen/) to easily generate an ADT and its associated functions.

```ts
import * as R from 'fp-ts-routing';
import * as U from 'unionize';

const RouteADT = U.unionize({
  Landing: {},
  Show: {},
});
type RouteADT = U.UnionOf<typeof RouteADT>

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

## Router

Represents the current route in state as an [ADT](https://dev.to/gcanti/functional-design-algebraic-data-types-36kf) and safely manages arbitrary routing state.

Uses [history](https://github.com/ReactTraining/history#readme) under the hood.

### What should my routing state be?

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
// `onRoute` is called before the `route` prop is changed
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

In summary: your routing state should be the state in your app that determines stateful redirects (using `onRoute`), or that needs to be updated before a reroute (using `updateRouter`) or after a reroute (using `onRoute`).

You could also use routing state to reroute users to a 'loading' route until a fetch call returns, or to reroute unauthenticated users to a login route and back again once they're complete.

Routing state is meant to bridge your routing logic and your render logic, in order to de-couple routing logic from the component lifecycle.

### Types
```tsx
import { Parser } from 'fp-ts-routing'
import * as History from 'history'

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
function withRouter<S, R>(
  Router: React.ComponentType<ManagedStateRouterProps<S, R>>,
  parser: Parser<R>,
  formatter: ((r: R) => string),
  notFoundRoute: R,
  defaultManagedState: S,
  onRoute?: OnRoute<S, R>,
): React.ComponentType<{}>
```

### Params

| Type Variable | Description |
| ------------- | ----------- |
| S             | Managed routing state |
| R             | Routing ADT type |

| Param  | Description  |
| ------ | ------------ |
| Router  | Your app's router component |
| parser | Converts url path strings into routing ADT |
| formatter | Converts routing ADT into a url path string
| notFoundRoute | ADT to use when `parser` can't find a route |
| defaultRoutingState | Populates managed state before component is mounted |
| onRoute | Updates the router using the new route and preexisting routing state |

### Usage

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
  RouteADT.Landing(),
  O.none,
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
