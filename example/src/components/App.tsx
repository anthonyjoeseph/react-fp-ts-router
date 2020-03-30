import { withCallbackRoutes } from 'react-callback-router';
import { AS, defaultAppStateFromRouter } from '../logic/AppState';
import updateStateFromRoute from '../logic/UpdateStateFromRoute';
import Landing from './Landing';

const App = withCallbackRoutes<AS>(
  Landing,
  defaultAppStateFromRouter,
  updateStateFromRoute,
);

export default App;