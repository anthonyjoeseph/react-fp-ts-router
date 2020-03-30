import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { AppStateWithRoute } from 'react-callback-router';
import { AS, SquirrelStuff, LoadingError } from './AppState';
import { getSquirrelFromREST, getNutErrorFromREST, getTreeErrorFromREST, SquirrelErrorType } from './SquirrelREST';
import { AppRoute } from './RouteTypes';

const squirrelRespToRoutelessState = (
  resp: E.Either<SquirrelErrorType, SquirrelStuff>
): AppStateWithRoute<AS, AppRoute> => ({
  appState: { squirrelStuff: resp },
})

export const updateStateFromRoute = (
  appState: AS,
): (a: AppRoute) => T.Task<AppStateWithRoute<AS, AppRoute>> => AppRoute.match({
  Squirrel: () => E.isLeft(appState.squirrelStuff)
    && appState.squirrelStuff.left.tag === LoadingError.NOT_LOADED().tag
      ? pipe(
          getSquirrelFromREST(),
          T.map(squirrelRespToRoutelessState),
        )
      : T.of({}),
  NutError: () => E.isRight(appState.squirrelStuff)
    || appState.squirrelStuff.left.tag === LoadingError.NOT_LOADED().tag
      ? pipe(
        getNutErrorFromREST(),
        T.map(squirrelRespToRoutelessState),
      )
      : T.of({}),
  TreeError: () => E.isRight(appState.squirrelStuff)
    || appState.squirrelStuff.left.tag === LoadingError.NOT_LOADED().tag
      ? pipe(
        getTreeErrorFromREST(),
        T.map(squirrelRespToRoutelessState),
      )
      : T.of({}),
  default: () => T.of({}),
});

export default updateStateFromRoute;