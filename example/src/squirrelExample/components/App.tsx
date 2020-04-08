import withRouter from '../../../../src/withRouter';
import { defaultAppState, AppState } from '../logic/AppState';
import onRoute from '../logic/OnRoute';
import Landing from './Landing';
import { AppRoute, parser, formatter } from '../logic/RouteTypes';

const App = withRouter<AppState, AppRoute>(
  Landing,
  parser,
  formatter,
  AppRoute.NotFound(),
  defaultAppState,
  onRoute,
);

export default App;