import React from 'react';
import * as E from 'fp-ts/lib/Either';
import { UpdateState } from 'react-callback-router'
import { AS } from '../logic/AppState';

export default ({ updateState }: { updateState: UpdateState<AS> }) => (
  <button
    onClick={() => {
      updateState({
        appState: { squirrelStuff: E.left('NotLoaded') },
        route: '/',
      })
    }}
  >
    dismiss squirrel
  </button>
);