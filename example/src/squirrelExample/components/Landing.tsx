import React from 'react';
import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { RouterProps, UpdateRouterParams } from '../../../../src/withRouter';
import * as N from '../../../../src/Navigation';
import { AppState, SquirrelStuff, LoadingError, LoadingErrorType } from '../logic/AppState';
import SquirrelRoute from './SquirrelRoute';
import SquirrelErrorRoute from './SquirrelErrorRoute';
import { getNutErrorFromREST, getTreeErrorFromREST, SquirrelErrorType } from '../logic/SquirrelREST';
import { AppRoute } from '../logic/RouteTypes';

const Landing = ({
  routingState,
  updateRouter,
}: RouterProps<AppState, AppRoute> ) => {
  return (
    <div>
      <button
        onClick={() => {
          updateRouter({
            routingState: E.right({
              id: 100,
              name: 'Rocky',
            }),
            navigation: N.push(AppRoute.Squirrel()),
          });
        }}
      >
        Summon squirrel
      </button>
      <button
        onClick={() => {
          const runRequest = pipe(
            getNutErrorFromREST(),
            T.map((routingState): UpdateRouterParams<AppState, AppRoute> => ({
              routingState,
              navigation: N.push(AppRoute.SquirrelError({ type: 'nut' })),
            })),
            T.map(updateRouter),
          );
          runRequest();
        }}
      >
        Request dangerous nut
      </button>
      <button
        onClick={() => {
          const runRequest = pipe(
            getTreeErrorFromREST(),
            T.map((routingState): UpdateRouterParams<AppState, AppRoute> => ({
              routingState,
              navigation: N.push(AppRoute.SquirrelError({ type: 'tree' })),
            })),
            T.map(updateRouter),
          );
          runRequest();
        }}
      >
        Request dangerous tree
      </button>
      {E.fold(
        (error: SquirrelErrorType | LoadingErrorType) => error.tag !== LoadingError.NOT_LOADED().tag && (
          <SquirrelErrorRoute
            error={error}
            updateRouter={updateRouter}
          />
        ),
        (squirrelStuff: SquirrelStuff) => (
          <SquirrelRoute
            id={squirrelStuff.id}
            name={squirrelStuff.name}
            updateRouter={updateRouter}
          />
        ),
      )(routingState)}
    </div>
  );
}

export default Landing;
