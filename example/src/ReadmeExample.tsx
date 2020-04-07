import React from 'react';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as R from 'fp-ts-routing';
import * as U from 'unionize';
import withManagedStateRouter, { UpdateRouter, RoutingResponse } from "react-fp-ts-router";
import * as N from 'react-fp-ts-router/lib/Navigation';

type AppState = O.Option<string>

const AppRoute = U.unionize({
  Landing: {},
  Show: {},
});
type AppRoute = U.UnionOf<typeof AppRoute>

const landingDuplex = R.end;
const showDuplex = R.lit('show').then(R.end);
const parser = R.zero<AppRoute>()
  .alt(landingDuplex.parser.map(() => AppRoute.Landing()))
  .alt(showDuplex.parser.map(() => AppRoute.Show()));

const Ex = withManagedStateRouter<AppState, AppRoute>(
  ({ managedState, updateRouter }) => {
    const breaker = 3;
    return pipe(
      managedState,
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
    );
  },
  parser,
  AppRoute.match({
    Landing: () => R.format(landingDuplex.formatter, {}),
    Show: () => R.format(showDuplex.formatter, {}),
  }),
  AppRoute.Landing(),
  O.none,
  (route, managedState) => AppRoute.match<RoutingResponse<AppState, AppRoute>>({
    Show: () => {
      const bkpt = 3;
      return ({
        sync: {
          newState: O.isNone(managedState) ? O.some('from route') : O.none,
        },
      });
    },
    default: () => ({ }),
  })(route)
);

const NoTextRoute = ({
  updateRouter
}: { updateRouter: UpdateRouter<AppState, AppRoute> }) => (
  <div>
    landing
    <button
      onClick={() => updateRouter({
        navigation: N.push(AppRoute.Show()),
        newState: O.some('from button click'),
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
  updateRouter: UpdateRouter<AppState, AppRoute>;
}) => (
  <div>
    {text}
    <button
      onClick={() => updateRouter({
        newState: O.none,
        navigation: N.push(AppRoute.Landing()),
      })}
    >
      go to landing
    </button>
  </div>
);

export default Ex;