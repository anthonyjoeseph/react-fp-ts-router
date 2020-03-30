import React from 'react';
import * as E from 'fp-ts/lib/Either';
import { UpdateState } from 'react-callback-router';
import withNarrowerAppState from '../../../src/withNarrowerAppState';
import { AS, SS } from '../logic/AppState';
import DismissSquirrelButton from './DismissSquirrelButton';
import { AppRoute } from '../logic/RouteTypes';

const SquirrelRoute = ({
  appState,
  updateState,
  customColor,
}: {
  appState: AS & SS;
  updateState: UpdateState<AS, AppRoute>;
  customColor: string;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div>squirrel id: {appState.squirrelStuff.right.id}</div>
    <div>squirrel name: {appState.squirrelStuff.right.name}</div>
    <div>custom color: {customColor}</div>
    <DismissSquirrelButton
      updateState={updateState}
    />
  </div>
);

export default withNarrowerAppState(
  SquirrelRoute,
  (a: AS): a is AS & SS => E.isRight(a.squirrelStuff),
);