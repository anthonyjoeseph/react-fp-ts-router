import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { AppStateWithRoute } from 'react-callback-router';
import * as History from 'history';
import { AS, SquirrelStuff, LoadingError } from './AppState';
import { getSquirrelFromREST, getNutErrorFromREST, getTreeErrorFromREST, SquirrelErrorType } from './SquirrelREST';
import { parseRoute, AppRoute } from './RouteTypes';

const squirrelRespToRoutelessState = (
  resp: E.Either<SquirrelErrorType, SquirrelStuff>
): AppStateWithRoute<AS> => ({
  appState: { squirrelStuff: resp },
})

export const updateStateFromRoute = (
  appState: AS,
  location: History.Location<History.LocationState>,
  _: History.Action,
): T.Task<AppStateWithRoute<AS>> => {
  const four: AppRoute = parseRoute(location.pathname);
  if (
    location.pathname === '/squirrel'
    && E.isLeft(appState.squirrelStuff)
    && appState.squirrelStuff.left === LoadingError.NOT_LOADED()
  ) {
    return pipe(
      getSquirrelFromREST(),
      T.map(squirrelRespToRoutelessState),
    );
  }
  if (
    E.isRight(appState.squirrelStuff)
    || appState.squirrelStuff.left === LoadingError.NOT_LOADED()
  ) {
    if (location.pathname === '/nutError') {
      return pipe(
        getNutErrorFromREST(),
        T.map(squirrelRespToRoutelessState),
      );
    }
    if (location.pathname === '/treeError') {
      return pipe(
        getTreeErrorFromREST(),
        T.map(squirrelRespToRoutelessState),
      );
    }
  }
  return T.of({});
};

export default updateStateFromRoute;