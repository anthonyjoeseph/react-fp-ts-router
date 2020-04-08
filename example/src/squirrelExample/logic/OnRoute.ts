import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { OnRouteResponse } from 'react-fp-ts-router';
import * as N from 'react-fp-ts-router/lib/Navigation';
import { AppState } from './AppState';
import { getSquirrelFromREST, SquirrelError } from './SquirrelREST';
import { AppRoute } from './RouteTypes';

export const onRoute = (
  route: AppRoute,
  managedState: AppState,
) => {
  return AppRoute.match<OnRouteResponse<AppState, AppRoute>>({
    NotFound: () => ({
      sync: {
        navigation: N.push(AppRoute.Home()),
      }
    }),
    Squirrel: () => pipe(
      managedState,
      E.fold(
        (error): OnRouteResponse<AppState, AppRoute> => error.tag === 'NOT_LOADED'
          ? ({
            async: pipe(
              getSquirrelFromREST(),
              T.map((routingState) => ({
                routingState,
              }))
            ),
          })
          : ({
            sync: {
              navigation: N.push(AppRoute.SquirrelError({ 
                type: SquirrelError.match<'nut' | 'tree'>({
                  HARD_NUT_TO_CRACK: () => 'nut',
                  TREE_FELL_DOWN: () => 'tree',
                })(error)
              })),
            } 
          }),
        () => ({}),
      ),
    ),
    SquirrelError: () => pipe(
      managedState,
      E.orElse((error) => error.tag === 'NOT_LOADED'
        ? E.right(undefined)
        : E.left(undefined),
      ),
      E.fold(
        () => ({}),
        () => ({
          sync: {
            navigation: N.push(AppRoute.Home()),
          } 
        }),
      ),
    ),
    default: () => ({ }),
  })(route);
}

export default onRoute;