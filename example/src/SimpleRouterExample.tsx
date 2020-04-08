import React from 'react';
import * as U from 'unionize';
import * as R from 'fp-ts-routing';
import { withSimpleRouter } from 'react-fp-ts-router';
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

const App = withSimpleRouter<RouteADT>(
  ({ route, setRoute }) => route.tag === 'Landing'
    ? (
      <div>
        <button onClick={() => setRoute(N.push(RouteADT.Show()))}>
          show
        </button>
      </div>
    ) : (
      <div>
        <button onClick={() => setRoute(N.push(RouteADT.Landing()))}>
          hide
        </button>
      </div>
    ),
  parser,
  formatter,
  defaultRoute,
);

export default App;
