import React, { Component } from 'react';
import { Parser } from 'fp-ts-routing';
import withInterceptingRouter from './withInterceptingRouter';

export interface StaticRouterProps<R> {
  route: R;
}

/**
 * Represents the current route in state as a provided routing {@link https://dev.to/gcanti/functional-design-algebraic-data-types-36kf ADT}.
 * Vulnerable to routing anti-patterns. If your routing is dynamic, using `withInterceptingRouter` instead.
 * Uses {@link https://github.com/ReactTraining/history#readme history} under the hood.
 * You can make your own ADTs with 
 * {@link https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types union types}
 * and {@link https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards type guards},
 * or you can use the {@link https://gcanti.github.io/fp-ts-codegen/ fp-ts-codegen playground}
 * to easily generate them and their associated functions.
 * 
 * @template R - Routing ADT type
 * @template T - Arbitrary props passed through Router, defaults to the empty object
 * @param Router - Your app's router component
 * @param parser - Converts url path strings into routing ADT
 * @param notFoundRoute - ADT to use when parser can't find a route
 */
export default function withStaticRouter<R, T extends {} = {}>(
  Router: React.ComponentType<T & StaticRouterProps<R>>,
  parser: Parser<R>,
  notFoundRoute: R,
): React.ComponentType<T>{
  return class SimpleRouter extends Component<T>{
    render = (): JSX.Element => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const SimpleRouter = withInterceptingRouter(
        ({ route }) => (
          <Router
            route={route}
            {...this.props}
          />
        ),
        parser,
        () => '',
        notFoundRoute,
        undefined,
        () => ({ }),
      );
      return (
        <SimpleRouter />
      );
    };
  };
}
