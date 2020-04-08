import React from 'react';
import * as E from 'fp-ts/lib/Either';
import { UpdateRouter } from '../../../../src/withRouter';
import * as N from '../../../../src/Navigation';
import { AppState, LoadingError } from '../logic/AppState';
import { AppRoute } from '../logic/RouteTypes';

export default ({ updateRouter }: { updateRouter: UpdateRouter<AppState, AppRoute> }) => (
  <button
    onClick={() => {
      updateRouter({
        routingState: E.left(LoadingError.NOT_LOADED()),
        navigation: N.push(AppRoute.Home()),
      })
    }}
  >
    dismiss squirrel
  </button>
);
