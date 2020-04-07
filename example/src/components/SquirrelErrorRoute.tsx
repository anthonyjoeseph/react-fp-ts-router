import React from 'react';
import { UpdateRouter } from 'react-fp-ts-router';
import { AppState } from '../logic/AppState';
import DismissSquirrelButton from './DismissSquirrelButton';
import { SquirrelError, SquirrelErrorType } from '../logic/SquirrelREST';
import { AppRoute } from '../logic/RouteTypes';

const SquirrelErrorRoute = ({
  error,
  updateRouter,
}: {
  error: SquirrelErrorType;
  updateRouter: UpdateRouter<AppState, AppRoute>;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div>
      {SquirrelError.match({
        HARD_NUT_TO_CRACK: () => 'Hard nut to crack.',
        TREE_FELL_DOWN: () => 'Tree fell down.',
      })(error)}
    </div>
    <DismissSquirrelButton
      updateRouter={updateRouter}
    />
  </div>
);

export default SquirrelErrorRoute;
