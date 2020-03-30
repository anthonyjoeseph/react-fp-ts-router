import React from 'react';
import * as E from 'fp-ts/lib/Either';
import { UpdateState } from 'react-callback-router';
import { AS, LoadingError } from '../logic/AppState';
import { homeDuplex, AppRoute } from '../logic/RouteTypes';
import { Route } from 'fp-ts-routing';

export default ({ updateState }: { updateState: UpdateState<AS, AppRoute> }) => (
  <button
    onClick={() => {
      updateState({
        appState: { squirrelStuff: E.left(LoadingError.NOT_LOADED()) },
        route: homeDuplex.formatter.run(Route.empty, {}),
      })
    }}
  >
    dismiss squirrel
  </button>
);