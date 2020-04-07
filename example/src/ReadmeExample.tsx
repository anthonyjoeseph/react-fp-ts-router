import React from 'react';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as R from 'fp-ts-routing';
import * as U from 'unionize';
import withRouter, { UpdateRouter, OnRouteResponse } from "react-fp-ts-router";
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

type RoutingState = O.Option<string>
const defaultRoutingState: RoutingState = O.none;

const App = withRouter<RoutingState, RouteADT>(
  ({ routingState, updateRouter }) => pipe(
    routingState,
    O.map(text => (
      <HasTextRoute
        text={text}
        updateRouter={updateRouter}
      />
    )),
    O.getOrElse(() => (
      <NoTextRoute
        updateRouter={updateRouter}
      />
    ))
  ),
  parser,
  formatter,
  defaultRoute,
  defaultRoutingState,
  (route, managedState) => RouteADT.match<OnRouteResponse<RoutingState, RouteADT>>({
    Show: () => ({
      sync: {
        routingState: O.isNone(managedState) ? O.some('from route') : managedState,
      },
    }),
    default: () => ({ }),
  })(route)
);

const NoTextRoute = ({
  updateRouter
}: { updateRouter: UpdateRouter<RoutingState, RouteADT> }) => (
  <div>
    landing
    <button
      onClick={() => updateRouter({
        navigation: N.push(RouteADT.Show()),
        routingState: O.some('from button click'),
      })}
    >
      go to route
    </button>
  </div>
);

const HasTextRoute = ({
  text,
  updateRouter
}: {
  text: string;
  updateRouter: UpdateRouter<RoutingState, RouteADT>;
}) => (
  <div>
    {text}
    <button
      onClick={() => updateRouter({
        routingState: O.none,
        navigation: N.push(RouteADT.Landing()),
      })}
    >
      go to landing
    </button>
  </div>
);

export default App;