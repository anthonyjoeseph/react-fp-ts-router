import * as E from 'fp-ts/lib/Either';
import { SquirrelError } from './SquirrelREST';
import { DefaultStateFromRoute } from 'react-callback-router';

export interface SquirrelStuff {
  id: number;
  name: string;
}

export type LoadingTypeError = 'NotLoaded';

// App State
export interface AS {
  squirrelStuff: E.Either<LoadingTypeError | SquirrelError, SquirrelStuff>;
};

// Successful Squirrel State
export interface SS {
  squirrelStuff: E.Right<SquirrelStuff>;
}

// Error Squirrel State
export interface ES {
  squirrelStuff: E.Left<SquirrelError>;
}

export const defaultAppStateFromRouter: DefaultStateFromRoute<AS> = () => ({
  squirrelStuff: E.left<LoadingTypeError, SquirrelStuff>('NotLoaded'),
});