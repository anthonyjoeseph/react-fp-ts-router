import React from 'react';
import { UpdateRouter } from '../../../../src/withRouter';
import { AppState } from '../logic/AppState';
import DismissSquirrelButton from './DismissSquirrelButton';
import { AppRoute } from '../logic/RouteTypes';

const SquirrelRoute = ({
  id,
  name,
  updateRouter,
}: {
  id: number;
  name: string;
  updateRouter: UpdateRouter<AppState, AppRoute>;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div>squirrel id: {id}</div>
    <div>squirrel name: {name}</div>
    <DismissSquirrelButton
      updateRouter={updateRouter}
    />
  </div>
);

export default SquirrelRoute;