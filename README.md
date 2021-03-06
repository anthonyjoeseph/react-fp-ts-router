# THIS REPO IS DEPRECATED
### React/[history](https://github.com/ReactTraining/history) middleware libraries are discouraged, better to use fp-ts-routing and the native [browser history api](https://developer.mozilla.org/en-US/docs/Web/API/History_API) 
### [Blog post](https://dev.to/anthonyjoeseph/type-safe-routing-with-fp-ts-routing-2fli)
### (also [integrates](https://www.learnrxjs.io/learn-rxjs/operators/creation/fromevent) well with [redux-observable](https://redux-observable.js.org/): `fromEvent(window, 'popstate')`)

# react-fp-ts-router
An [HOC](https://reactjs.org/docs/higher-order-components.html) that builds a router that represents the current route in react state as an [ADT](https://dev.to/gcanti/functional-design-algebraic-data-types-36kf) (another more in depth explanation of ADTs [here]((https://jrsinclair.com/articles/2019/algebraic-data-types-what-i-wish-someone-had-explained-about-functional-programming/))) and safely manages an [interceptable](#what-is-an-interceptable).

Alternative to [react-router-dom](https://reacttraining.com/react-router/web/)

Thanks to Giulio Canti for [fp-ts](https://github.com/gcanti/fp-ts) and [fp-ts-routing](https://github.com/gcanti/fp-ts-routing). Thanks [React Training](https://reacttraining.com/) for [`history`](https://github.com/ReactTraining/history).

## Installation
`yarn add react-fp-ts-router`

# Usage

Check out the [fp-ts-routing docs](https://github.com/gcanti/fp-ts-routing#usage) for more info on parsers and formatters.

These examples use [`unionize`](https://github.com/pelotom/unionize) for their route [ADTs](https://jrsinclair.com/articles/2019/algebraic-data-types-what-i-wish-someone-had-explained-about-functional-programming/), but you could use simple [union types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types) and [type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards), or you could use the [fp-ts-codegen playground](https://gcanti.github.io/fp-ts-codegen/) to easily generate ADTs and their associated functions.

## `withStaticRouter`

If your app has no state that depends on or affects the way the current route changes, you can use `withStaticRouter`. Be advised, however, that if [routing anti-patterns](#when-do-i-need-an-interceptable) start to creep into your app, you should use `withInterceptingRouter` and an [`interceptable`](#what-is-an-interceptable?) instead.

This example creates a web app with the following rules:
  - At the '/' route, it renders a 'show' button that reroutes to '/show'
  - At the '/show' route, it renders a 'hide' button that reroutes to '/'.
  - At a route it doesn't recognize, it behaves as though it's at the '/' route.

[Example code](https://github.com/anthonyjoeseph/react-fp-ts-router/blob/master/example/src/StaticRouterExample.tsx)

[Live site](http://static-example-router.s3-website-us-east-1.amazonaws.com/)

## `withInterceptingRouter` example

This example uses a simple [optional](https://github.com/gcanti/fp-ts/blob/master/test/Option.ts) `string` as its [`interceptable`](#what-is-an-interceptable?). This `interceptable` will be set differently depending on how the app's route is changed.

It creates a version of the above example, with the following additional rules:
  - it displays an `interceptable` at '/show'
  - the `interceptable` is set to 'from button click' when routed to '/show' from the 'show' button
  - the `interceptable` is set to 'from route' when routed to '/show' directly from the browser
  - it redirects any unrecognized route to '/'

[Example code](https://github.com/anthonyjoeseph/react-fp-ts-router/blob/master/example/src/InterceptingRouterExample.tsx)

[Live site](http://intercepting-example-router.s3-website-us-east-1.amazonaws.com/)

# What is an interceptable?

An `interceptable` models state that depends on or affects the way the current route changes.

An `interceptable` is used to de-couple routing logic from the component lifecycle.

# When do I need an interceptable?

Here are common routing anti-patterns that appear when using `withStaticRouter`, and alternative solutions that use `interceptable` and `withInterceptingRouter`.

## Stateful redirection

If you're using `withStaticRouter` and you find yourself doing a stateful redirect like this:

```tsx
// Redirector.tsx
componentDidMount() {
  navigate(N.push(MyRouteADT.badRoute()));
}
render() {
  return null;
}
// in parent component
{route === MyRouteADT.goodRoute() && (
  data.type === 'bad'
    ? (
      <Redirector />
    )
    : (
      <Comp
        data={data.good}
      />
    )
)}
```

You might be frustrated that `Redirector` is forced to implement `render`. You might also recognize this as [`UNSAFE_componentWillReceiveProps`](https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops) in disguise.

You should use `withInterceptingRouter` instead, and move `data` into your `interceptable`:

```tsx
const interceptRoute = (
  route: MyRouteADT,
  interceptable: MyInterceptable,
): InterceptRouteResponse<MyRouteADT, MyInterceptable> => {
  if (route === 'goodRoute' && interceptable.data.type === 'bad') {
    return {
      sync: {
        redirect: Navigate.push(RouteADT.badRoute()),
      }
    }
  } 
}
// in parent component
{route === 'goodRoute' && interceptable.data.type !== 'bad' (
  <Comp
    goodData={data.good}
  />
)}
```

## Loading data after a reroute

If you're using `withStaticRouter` and you find yourself initializing data after a reroute like this:

```tsx
// HandleDataInitialization.tsx
state = { data: undefined };
componentDidMount() {
  if (this.props.route === RouteADT.loadedRoute()) {
    // this.state.data can't be initialized yet,
    // because this.state.data is always
    // undefined on componentDidMount(), so
    // redirect to RouteADT.loadingRoute()
    navigate(N.push(RouteADT.loadingRoute()));
  }
  // runInitialize() will only be invoked once, even
  // after a redirect from RouteADT.loadedRoute(),
  // because this component is rendered at both
  // RouteADT.loadingRoute() and RouteADT.loadedRoute()
  // so a redirect will not trigger a new componentDidMount()
  const runInitialize = T.task.map(initializeData(), data => {
    this.setState({ data });
    navigate(N.push(RouteADT.loadedRoute()));
  });
  runInitialize();
}
render(){
  if (this.state.data === undefined) return (
    <LoadingSpinner />
  );
  return (
    <DataComp
      data={this.state.data}
    />
  );
}
// in parent component
{ (route === RouteADT.loadedRoute() || route === RouteADT.loadingRoute()) && (
  <HandleDataInitialization />
)}
```

You should be appalled at your impenetrable routing logic. You might also recognize this as [`UNSAFE_componentWillReceiveProps`](https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops) in an even sneakier disguise.

You should use `withInterceptingRouter` instead, and move `data` into your `interceptable`:

```tsx
const interceptRoute = (
  route: MyRoute,
  interceptable: MyInterceptable,
): InterceptRouteResponse<MyRouteADT, MyInterceptable> => {
  if (
    route === RouteADT.loadedRoute()
    && interceptable.data === undefined
  ) {
    return {
      sync: {
        redirect: N.push(RouteADT.loadingRoute()),
      }
    };
  }
  if (route === RouteADT.loadingRoute()) {
    return {
      async: T.task.map(initializeData(), data => ({
        interceptable: {
          ...this.props.interceptable,
          data,
        }
        redirect: N.push(RouteADT.loadedRoute())
      })),
    }
  }
}
// in parent component
{(
  route === routeADT.loadedRoute() || route === RouteADT.loadingRoute()
) && (
  interceptable.data !== undefined
    ? <DataComp
      data={interceptable.data}
    />
    : <LoadingSpinner />
)}
```

# FAQ

## Why does `setInterceptable` return a `Task<I>`? It's annoying that I have to remember to invoke it every time I use it

### Loading data before a reroute

If you do this:

```tsx
// in a component
<button onClick={() => {
  const runReroutedData = T.task.map(
    loadReroutedData(),
    reroutedData => {
      navigate(RouteADT.loadedRoute());
      const runSetInterceptable = this.props.setInterceptable(reroutedData);
      runSetInterceptable();
    }
  );
  runReroutedData();
}}>reroute</button>
// in your interceptRoute
const interceptRoute = (
  route: MyRouteADT,
  interceptable: MyInterceptable
): InterceptRouteResponse<MyRouteADT, MyInterceptable> => {
  if (route === RouteADT.loadedRoute() && interceptable === undefined) {
    return {
      async: T.task.map(loadInitializedData, initializedData => {
        return {
          interceptable: initializedData,
        }
      }),
    }
  }
}
```

You may be surprised that clicking `reroute` causes interceptable to be set to `initializedData`.

This is because `navigate` triggers `interceptRoute` before `setInterceptable` can enqueue changes to `interceptable`. This causes `interceptRoute` to think that `interceptable` is uninitialized, which will trigger a `Task` that returns `initializedData`, which will clobber `reroutedData`.

You should do this instead:

```tsx
<button onClick={() => {
  const runReroutedData = pipe(
    preLoadData(),
    T.chain(this.props.setInterceptable),
    T.map(() => navigate(N.push(RouteADT.route()))),
  );
  runReroutedData();
}}>load stuff</button>
```

The `Task` returned by `setInterceptable` uses a [`setState` callback](https://reactjs.org/docs/react-component.html#setstate) to ensure `interceptable` is updated before it resolves. It resolves into the latest `interceptable` state.

While it may be annoying to have to invoke this task every time you want to use `setInterceptable`, it forces you to consider its runtime asynchronicity at compile time. As we have seen, it can be dangerous to think of `setInterceptable` as synchronous in relation to navigation.

## Can I have more than one router in my app?

You can, but you shouldn't. React offers no way to enforce this at compile time, but if `react-fp-ts-router` could prevent multiple router components or multiple instances of router components, it would. `withInterceptingRouter` is an [HOC](https://reactjs.org/docs/higher-order-components.html) only because its parameters are constants, so passing them in through props wouldn't make sense. It's not meant to create a reusable component.

The `route` prop provided to the router is meant to be the [single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth) of the browser's current route.

## Isn't it cumbersome to [drill](https://kentcdodds.com/blog/prop-drilling/) the current route through all of my components's props?

While you are encouraged to use [react context](https://reactjs.org/docs/context.html) to avoid drilling `setInterceptable`, drilling `route` is actually a feature.

A good practice with this library is to nest several routing ADTs together to mirror your app's component tree hierarchy. This enables you to ensure the correctness of your render logic at compile time. In this example, we see that the `LoggedIn` and `LoggedOut` components are relieved of the responsibility of handling irrelevant routes. This is one advantage we gain by having the current route represented globally.

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

## Why is interceptable global?

At first, this seems unintuitive. One of the advantages of React is that it allows state to be distributed across many components. This [minimizes re-renders](#minimizing-re-renders-functionally) and [localizes interrelated data within the nodes of a deeply nested tree](#transforming-deeply-nested-state-functionally). All of these advantages seem lost when state is consolidated in your topmost component.

However, `interceptable` is tightly coupled to the current route because, by definition, it depends on or affects the way the current route changes. Since the current route is global, interceptable must also be global.

On closer analysis, this makes sense. `interceptRoute` must handle any incoming route, so it wouldn't make sense to have multiple `interceptRoute`s that handled different `interceptable`s because they would have overlapping domains.

### Minimizing re-renders functionally

For these reasons listed above, interceptable should be minimal. State unrelated to the current route should be handled elsewhere.

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
const Landing = ({ interceptable }) => (
  <Memoized
    text={interceptable.text}
    num={interceptable.num}
  />
);
```

### Transforming deeply nested state functionally

[Optics](https://github.com/gcanti/monocle-ts) can help you transform deeply nested interceptable:

```ts
import * as M from 'monocle-ts';
import * as T from 'fp-ts/lib/Task';
import { pipe } from 'fp-ts/lib/pipeable';
interface MyInterceptable {
  user: {
    memories: {
      childhood: {
        favoriteColor?: string;
      }
    }
  }
}
const favoriteColorLens = M.Lens.fromPath<MyInterceptable>()([
  'user', 'memories', 'childhood', 'favoriteColor',
]);
const interceptRoute = (route: R, interceptable: MyInterceptable) => {
  if (
    route.type === 'favoriteColorRoute'
    && favoriteColorLens.get(interceptable) === undefined
  ) {
    return {
      async: {
        interceptable: pipe(
          loadFavoriteColor(),
          T.map(
            (favoriteColor) => favoriteColorLens.set(favoriteColor)(interceptable)
          )
        )
      },
    }
  }
};
```

# Docs

## `createNavigator`

`createNavigator` creates a function that you can export and use anywhere in your app to reroute using the provided routing [ADT](https://dev.to/gcanti/functional-design-algebraic-data-types-36kf). Internally, `withInterceptingRouter` uses `createNavigator` for redirects.

### `createNavigator` Function Type

```ts
import { Navigation } from 'react-fp-ts-routing';
export function createNavigator <R>(
  formatter: ((r: R) => string),
): (navigation: Navigation<R>) => void
```

| Type Variable | Description |
| ------------- | ----------- |
| `R`             | Routing ADT type |

| Param  | Description  |
| ------ | ------------ |
| `formatter` | Converts routing ADT into a url path string |

## `withStaticRouter` [HOC](https://reactjs.org/docs/higher-order-components.html)

### `withStaticRouter` Output Prop Types

The `Router` component that `withInterceptingRouter` wraps is given the props `SimpleRouterProps<R>`:

```ts
interface SimpleRouterProps<R> {
  route: R;
}
```
| Type Variable | Description |
| ------------- | ----------- |
| `R`             | Routing ADT type |

| Prop  | Description  |
| ------ | ------------ |
| `route` | Your app's current route, represented as your routing ADT |

### `withStaticRouter` Function Type
```tsx
import { Parser } from 'fp-ts-routing'
import * as History from 'history'
function withStaticRouter<R, T extends {} = {}>(
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
| `notFoundRoute` | ADT to use when `parser` can't find a route |

## `withInterceptingRouter` [HOC](https://reactjs.org/docs/higher-order-components.html)

### `withInterceptingRouter` Output Prop Types

The `Router` component that `withInterceptingRouter` wraps is given the props `RouterProps<S, R>`:

```ts
import * as N from 'react-fp-ts-routing/lib/Navigation';
export interface InterceptingRouterProps<R, I> {
  route: R;
  interceptable: I;
  setInterceptable: SetInterceptable<I>;
}
export type SetInterceptable<I> = (newInterceptable?: I) => T.Task<void>;
```
| Type Variable | Description |
| ------------- | ----------- |
| `R`             | Routing ADT type |
| `I`             | [interceptable](#what-is-an-interceptable) type |

| Prop  | Description  |
| ------ | ------------ |
| `interceptable`  | Your router's [interceptable](#what-is-an-interceptable) |
| `route` | Your app's current route, represented as your routing ADT |
| `updateRouter` | Optionally updates [interceptable](#what-is-an-interceptable) and then optionally invokes a [`Navigation`](#internal-adts) |

### `withInterceptingRouter` Function Type
```tsx
import { Parser } from 'fp-ts-routing'
import { Navigation, Action } from 'react-fp-ts-routing';
import * as History from 'history'
type InterceptRoute<R, I> = (
  newRoute: R,
  interceptable: I,
  oldRoute: R,
  Action: Action,
) => InterceptRouteResponse<R, I>;
interface InterceptRouteResponse<R, I> {
  sync?: Interception<R, I>;
  async?: T.Task<Interception<R, I>>;
}
interface Interception<R, I> {
  interceptable?: I;
  redirect?: Navigation<R>;
}
function withInterceptingRouter<S, R, T extends {} = {}>(
  Router: React.ComponentType<T & ManagedStateRouterProps<S, R>>,
  parser: Parser<R>,
  formatter: ((r: R) => string),
  notFoundRoute: R,
  defaultManagedState: S,
  interceptRoute?: interceptRoute<S, R>,
): React.ComponentType<T>
```

| Type Variable | Description |
| ------------- | ----------- |
| `R`             | Routing ADT type |
| `I`             | [interceptable](#what-is-an-interceptable) type |
| `T`             | Other arbitrary props passed into `Router`, defaults to the empty object |

| Param  | Description  |
| ------ | ------------ |
| `Router`  | Your app's router component |
| `parser` | Converts url path strings into routing ADT |
| `formatter` | Converts routing ADT into a url path string |
| `notFoundRoute` | ADT to use when `parser` can't find a route |
| `defaultinterceptable` | Populates [interceptable](#what-is-an-interceptable) before component is mounted |
| `interceptRoute` | Updates the router using the new route and preexisting [interceptable](#what-is-an-interceptable) |

## Internal ADTs

### Navigation

`Navigation` is an ADT representing the different possible [`history navigations`](https://github.com/ReactTraining/history/blob/master/docs/Navigation.md).

| `Navigation<R>` Type | Description |
| ------------- | ----------- |
| `Navigation.push(route: R)` | Reroutes to routing ADT `R` |
| `Navigation.replace(route: R)` | Reroutes to routing ADT `R` [without pushing new entry](https://stackoverflow.com/questions/39340108/what-is-the-trade-off-between-history-push-and-replace) onto the [history stack](https://developer.mozilla.org/en-US/docs/Web/API/History_API), so the browser's `back` button won't be able to go back to original location |
| `Navigation.pushExt(path: string)` | `N.push` that can reroute to somewhere outside of your app |
| `Navigation.replaceExt(path: string)` | `N.replace` that can reroute to somewhere outside of your app |
| `Navigation.go(delta: number)` | Moves `delta` number of times through the session [history stack](https://developer.mozilla.org/en-US/docs/Web/API/History_API). Can be positive or negative. |
| `Navigation.goBack` | Moves back one page in the [history stack](https://developer.mozilla.org/en-US/docs/Web/API/History_API) |
| `Navigation.goForward` | Moves forward one pack in the [history stack](https://developer.mozilla.org/en-US/docs/Web/API/History_API) |

### Action

`Action` is an ADT representing the different possible ways the browser arrived at its current location.

| `Action` Type | Description |
|---------------|-------------|
| `Action.push` | The url was pushed onto the stack. (The user clicked a link, or your app used `N.push`) |
| `Action.pop` | The url was popped from the stack. (The user hit the browser's `back` button, or your app used `N.go` or `N.goBack`) |
| `Action.replace` | The url replaced the top entry of the stack. (Your app used `N.replace`) |


## TODO
- use [`window.history`](https://developer.mozilla.org/en-US/docs/Web/API/Window/history) and [WindowEventHandlers](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers) instead of [`history`](https://github.com/ReactTraining/history)
