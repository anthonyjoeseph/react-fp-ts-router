import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { RoutingResponse } from 'react-fp-ts-router';
import { LoadingError, AppState } from './AppState';
import { getSquirrelFromREST, getNutErrorFromREST, getTreeErrorFromREST } from './SquirrelREST';
import { AppRoute } from './RouteTypes';

export const updateStateFromRoute = (
  route: AppRoute,
  managedState: AppState,
) => {
  return AppRoute.match<RoutingResponse<AppState, AppRoute>>({
    Squirrel: () => pipe(
      managedState,
      E.orElse(
        (error) => error.tag === LoadingError.NOT_LOADED().tag
          ? E.left(undefined)
          : E.right(undefined)
      ),
      E.fold(
        (): RoutingResponse<AppState, AppRoute> => ({
          async: pipe(
            getSquirrelFromREST(),
            T.map(newState => ({ newState }))
          ),
        }),
        (): RoutingResponse<AppState, AppRoute> => ({}),
      ),
    ),
    SquirrelError: ({ type }) => pipe(
      managedState,
      E.orElse(
        (error) => error.tag === LoadingError.NOT_LOADED().tag
          ? E.right(undefined)
          : E.left(undefined)
      ),
      E.fold(
        () => ({ }),
        () => ({
          async: pipe(
            type === 'nut' ? getNutErrorFromREST() : getTreeErrorFromREST(),
            T.map((resp) => ({
              newState: resp,
            })),
          ),
        })
      ),
    ),
    default: () => ({ }),
  })(route);
}

export default updateStateFromRoute;