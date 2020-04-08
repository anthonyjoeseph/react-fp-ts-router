import React from 'react';
import * as T from 'fp-ts/lib/Task';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as R from 'fp-ts-routing';
import * as U from 'unionize';
import {
  InterceptRoute, withInterceptingRouter,
  SetInterceptable, createNavigator,
  InterceptRouteResponse,
} from "react-fp-ts-router";
import * as N from 'react-fp-ts-router/lib/Navigation';

const RouteADT = U.unionize({
  Landing: {},
  Show: {},
  NotFound: {},
});
type RouteADT = U.UnionOf<typeof RouteADT>
const notFoundRoute: RouteADT = RouteADT.NotFound();

const landingDuplex = R.end;
const showDuplex = R.lit('show').then(R.end);
const parser = R.zero<RouteADT>()
  .alt(landingDuplex.parser.map(() => RouteADT.Landing()))
  .alt(showDuplex.parser.map(() => RouteADT.Show()));
const formatter = RouteADT.match({
  Landing: () => R.format(landingDuplex.formatter, {}),
  Show: () => R.format(showDuplex.formatter, {}),
  NotFound: () => R.format(landingDuplex.formatter, {}),
});

type Interceptable = O.Option<string>
const defaultRoutingState: Interceptable = O.none;

const onRoute: InterceptRoute<RouteADT, Interceptable> = (
  route,
  routingState,
) => RouteADT.match<InterceptRouteResponse<RouteADT, Interceptable>>({
  Show: () => ({
    sync: {
      interceptable: O.isNone(routingState) ? O.some('from route') : routingState,
    },
  }),
  NotFound: () => ({
    sync: {
      redirect: N.replace(RouteADT.NotFound()),
    }
  }),
  default: () => ({ }),
})(route);

const navigate = createNavigator(formatter);

const App = withInterceptingRouter<RouteADT, Interceptable>(
  ({ interceptable, setInterceptable }) => pipe(
    interceptable,
    O.map(text => (
      <HasText
        text={text}
        setInterceptable={setInterceptable}
      />
    )),
    O.getOrElse(() => (
      <NoText
        setInterceptable={setInterceptable}
      />
    ))
  ),
  parser,
  formatter,
  notFoundRoute,
  defaultRoutingState,
  onRoute,
);

const NoText = ({
  setInterceptable
}: { setInterceptable: SetInterceptable<Interceptable> }) => (
  <div>
    landing
    <br/>
    <button
      onClick={() => {
        const runUpdate = pipe(
          setInterceptable(O.some('from button click')),
          T.map(() => navigate(N.push(RouteADT.Show()))),
        );
        runUpdate();
      }}
    >
      go to route
    </button>
  </div>
);

const HasText = ({
  text,
  setInterceptable
}: {
  text: string;
  setInterceptable: SetInterceptable<Interceptable>;
}) => (
  <div>
    {text}
    <br/>
    <button
      onClick={() => {
        const runUpdate = pipe(
          setInterceptable(O.none),
          T.map(() => navigate(N.push(RouteADT.Landing()))),
        );
        runUpdate();
      }}
    >
      go to landing
    </button>
  </div>
);

export default App;