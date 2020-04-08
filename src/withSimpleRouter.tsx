import React, { Component } from 'react';
import { Parser } from 'fp-ts-routing';
import withRouter from './withRouter';
import * as N from './Navigation';

export interface SimpleRouterProps<R> {
  route: R;
  setRoute: (navigation: N.Navigation<R>) => void;
}

/**
 * Represents the current route in state as an {@link https://dev.to/gcanti/functional-design-algebraic-data-types-36kf ADT}.
 * Uses {@link https://github.com/ReactTraining/history#readme history} under the hood.
 * You can make your own ADTs with 
 * {@link https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types union types}
 * and {@link https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards type guards},
 * or you can use the {@link https://gcanti.github.io/fp-ts-codegen/ fp-ts-codegen playground}
 * to easily generate them and their associated functions.
 * 
 * @template R - Routing ADT type
 * @param Router - Your app's router component
 * @param parser - Converts url path strings into routing ADT
 * @param formatter - Converts routing ADT into a url path string
 * @param notFoundRoute - ADT to use when parser can't find a route
 */
export default function withSimpleRouter<R, T extends {} = {}>(
  Router: React.ComponentType<T & SimpleRouterProps<R>>,
  parser: Parser<R>,
  formatter: ((r: R) => string),
  notFoundRoute: R,
): React.ComponentType<T>{
  return class SimpleRouter extends Component<T>{

    render(): JSX.Element {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const SimpleRouter = withRouter(
        ({ route, updateRouter }) => (
          <Router
            route={route}
            setRoute={(navigation: N.Navigation<R>): void => updateRouter({
              navigation,
            })}
            {...this.props}
          />
        ),
        parser,
        formatter,
        notFoundRoute,
        undefined,
      );
      return (
        <SimpleRouter />
      );
    }
  };
}
