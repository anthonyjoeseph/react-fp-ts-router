import React from 'react';
import * as T from 'fp-ts/lib/Task';
import * as R from 'fp-ts-routing';
import * as U from 'unionize';
import {
  withCallbackRoutes, withNarrowerAppState, UpdateState,
} from "react-fp-ts-router";
import { homeDuplex } from './logic/RouteTypes';

interface AppState {
  text?: string;
}

const AppRoute = U.unionize({
  Landing: {},
  Show: {},
  NotFound: {}
});
type AppRoute = U.UnionOf<typeof AppRoute>

const landingDuplex = R.end;
const showDuplex = R.lit('show').then(R.end);
const parser = R.zero<AppRoute>()
  .alt(landingDuplex.parser.map(() => AppRoute.Landing()))
  .alt(showDuplex.parser.map(() => AppRoute.Show()));

const NoTextRoute = withNarrowerAppState(
  ({
    updateState
  }: {
    appState: {};
    updateState: UpdateState<AppState, AppRoute>;
  }) => (
    <div>
      landing
      <button
        onClick={() => updateState({
          appState: { text: 'from button click' },
          route: showDuplex.formatter.run(R.Route.empty, {}),
        })}
      >
        go to route
      </button>
    </div>
  ),
  (appState: AppState): appState is {} => appState.text === undefined
);

const HasTextRoute = withNarrowerAppState(
  ({
    appState,
    updateState
  }: {
    appState: { text: string };
    updateState: UpdateState<AppState, AppRoute>;
  }) => (
    <div>
      {appState.text}
      <button
        onClick={() => updateState({
          appState: { text: undefined },
          route: homeDuplex.formatter.run(R.Route.empty, {}),
        })}
      >
        go to landing
      </button>
    </div>
  ),
  (appState: AppState): appState is { text: string } => appState.text !== undefined
);

const Ex = withCallbackRoutes<AppState, AppRoute>(
  ({ appState, updateState }) => {
    return (
      <div>
        <HasTextRoute
          appState={appState}
          updateState={updateState}
        />
        <NoTextRoute
          appState={appState}
          updateState={updateState}
        />
      </div>
    )
  },
  parser,
  AppRoute.NotFound(),
  (_: AppRoute): AppState => ({}),
  (appState) => AppRoute.match({
    Show: () => T.of(appState.text === undefined
      ? ({ appState: { text: 'from route' } })
      : ({})),
    default: () => T.of({}),
  })
);

export default Ex;