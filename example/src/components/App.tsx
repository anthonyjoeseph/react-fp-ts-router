import withCallbackRoutes from 'react-callback-router';
import { AS, defaultAppStateFromRouter } from '../logic/AppState';
import updateStateFromRoute from '../logic/UpdateStateFromRoute';
import Landing from './Landing';
import { AppRoute, appRouter } from '../logic/RouteTypes';

const App = withCallbackRoutes<AS, AppRoute>(
  Landing,
  appRouter,
  AppRoute.NotFound(),
  defaultAppStateFromRouter,
  updateStateFromRoute,
);

export default App;