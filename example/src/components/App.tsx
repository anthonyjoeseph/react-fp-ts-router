import withManagedStateRouter from 'react-fp-ts-router';
import { defaultAppState, AppState } from '../logic/AppState';
import updateStateFromRoute from '../logic/UpdateStateFromRoute';
import Landing from './Landing';
import { AppRoute, parser, formatter } from '../logic/RouteTypes';

const App = withManagedStateRouter<AppState, AppRoute>(
  Landing,
  parser,
  formatter,
  AppRoute.Home(),
  defaultAppState,
  updateStateFromRoute,
);

export default App;