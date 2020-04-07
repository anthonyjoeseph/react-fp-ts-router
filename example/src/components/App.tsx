import withManagedStateRouter from 'react-fp-ts-router';
import { defaultAppState, AppState } from '../logic/AppState';
import onRoute from '../logic/OnRoute';
import Landing from './Landing';
import { AppRoute, parser, formatter } from '../logic/RouteTypes';

const App = withManagedStateRouter<AppState, AppRoute>(
  Landing,
  parser,
  formatter,
  AppRoute.NotFound(),
  defaultAppState,
  onRoute,
);

export default App;