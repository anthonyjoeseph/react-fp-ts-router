import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { AppStateWithRoute } from 'react-fp-ts-router';
import { AS, SquirrelStuff, LoadingError } from './AppState';
import { getSquirrelFromREST, getNutErrorFromREST, getTreeErrorFromREST, SquirrelErrorType } from './SquirrelREST';
import { AppRoute } from './RouteTypes';

const squirrelRespToRoutelessState = (
  resp: E.Either<SquirrelErrorType, SquirrelStuff>
): AppStateWithRoute<AS, AppRoute> => ({
  appState: { squirrelStuff: resp },
})

type RetType = T.Task<AppStateWithRoute<AS, AppRoute>>

export const updateStateFromRoute = (
  appState: AS,
): (variant: AppRoute) => RetType => AppRoute.match<RetType>({
  Squirrel: () => E.isLeft(appState.squirrelStuff)
    && appState.squirrelStuff.left.tag === LoadingError.NOT_LOADED().tag
      ? pipe(
          getSquirrelFromREST(),
          T.map(squirrelRespToRoutelessState),
        )
      : T.of({}),
  SquirrelError: ({ type }) => E.isRight(appState.squirrelStuff)
    || appState.squirrelStuff.left.tag === LoadingError.NOT_LOADED().tag
      ? pipe(
        type === 'nut' ? getNutErrorFromREST() : getTreeErrorFromREST(),
        T.map(squirrelRespToRoutelessState),
      )
      : T.of({}),
  default: () => T.of({}),
});

export default updateStateFromRoute;