import React from 'react';
import * as E from 'fp-ts/lib/Either';
import { withNarrowerAppState, UpdateState } from 'react-callback-router'
import { AS, ES } from '../logic/AppState';
import DismissSquirrelButton from './DismissSquirrelButton';

const SquirrelErrorRoute = ({
  appState,
  updateState,
}: {
  appState: AS & ES;
  updateState: UpdateState<AS>;
}) => {
  let message: string;
  switch(appState.squirrelStuff.left) {
    case 'HardNutToCrack':
      message = 'Hard nut to crack.';
      break;
    case 'TreeFellDown':
      message = 'Tree fell down.';
      break;
  }
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
    && a.squirrelStuff.left !== 'NotLoaded',
);