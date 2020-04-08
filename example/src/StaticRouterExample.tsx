import React from 'react';
import * as U from 'unionize';
import * as R from 'fp-ts-routing';
import { withStaticRouter, createNavigator } from 'react-fp-ts-router';
import * as N from 'react-fp-ts-router/lib/Navigation';

const RouteADT = U.unionize({
  Landing: {},
  Show: {},
});
type RouteADT = U.UnionOf<typeof RouteADT>
const defaultRoute: RouteADT = RouteADT.Landing();

const landingDuplex = R.end;
const showDuplex = R.lit('show').then(R.end);
const parser = R.zero<RouteADT>()
  .alt(landingDuplex.parser.map(() => RouteADT.Landing()))
  .alt(showDuplex.parser.map(() => RouteADT.Show()));
const formatter = RouteADT.match({
  Landing: () => R.format(landingDuplex.formatter, {}),
  Show: () => R.format(showDuplex.formatter, {}),
});

const navigate = createNavigator(formatter);

const App = withStaticRouter<RouteADT>(
  ({ route }) => RouteADT.match({
    Landing: () => (
      <div>
        <button onClick={() => navigate(N.push(RouteADT.Show()))}>
          show
        </button>
      </div>
    ),
    Show: () => (
      <div>
        <button onClick={() => navigate(N.push(RouteADT.Landing()))}>
          landing
        </button>
      </div>
    ),
  })(route),
  parser,
  defaultRoute,
);

export default App;
