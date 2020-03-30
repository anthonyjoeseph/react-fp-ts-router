import React from 'react';
import * as E from 'fp-ts/lib/Either';
import { UpdateState } from 'react-callback-router';
import withNarrowerAppState from '../../../src/withNarrowerAppState';
import { AS, ES, LoadingError } from '../logic/AppState';
import DismissSquirrelButton from './DismissSquirrelButton';
import { SquirrelError } from '../logic/SquirrelREST';
import { AppRoute } from '../logic/RouteTypes';

const SquirrelErrorRoute = ({
  appState,
  updateState,
}: {
  appState: AS & ES;
  updateState: UpdateState<AS, AppRoute>;
}) => {
  const message = SquirrelError.match({
    HARD_NUT_TO_CRACK: () => 'Hard nut to crack.',
    TREE_FELL_DOWN: () => 'Tree fell down.',
  })(appState.squirrelStuff.left);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div>{message}</div>
      <DismissSquirrelButton
        updateState={updateState}
      />
    </div>
  );
}

export default withNarrowerAppState(
  SquirrelErrorRoute,
  (a: AS): a is AS & ES => E.isLeft(a.squirrelStuff)
    && a.squirrelStuff.left !== LoadingError.NOT_LOADED(),
);