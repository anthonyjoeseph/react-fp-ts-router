import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import * as History from 'history';
import { AS, SquirrelStuff } from './AppState';
import { getSquirrelFromREST, getNutErrorFromREST, getTreeErrorFromREST, SquirrelError } from './SquirrelREST';
import { AppStateWithRoute } from 'react-callback-router';

const squirrelRespToRoutelessState = (
  resp: E.Either<SquirrelError, SquirrelStuff>
): AppStateWithRoute<AS> => ({
  appState: { squirrelStuff: resp },
})

export const updateStateFromRoute = (
  appState: AS,
  location: History.Location<History.LocationState>,
  _: History.Action,
): T.Task<AppStateWithRoute<AS>> => {
  if (
    location.pathname === '/squirrel'
    && E.isLeft(appState.squirrelStuff)
    && appState.squirrelStuff.left === 'NotLoaded'
  ) {
    return pipe(
      getSquirrelFromREST(),
      T.map(squirrelRespToRoutelessState),
    );
  }
  if (
    E.isRight(appState.squirrelStuff)
    || appState.squirrelStuff.left === 'NotLoaded'
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