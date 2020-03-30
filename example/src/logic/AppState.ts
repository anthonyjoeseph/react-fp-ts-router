import * as E from 'fp-ts/lib/Either';
import { DefaultStateFromRoute } from 'react-callback-router';
import { unionize, UnionOf } from 'unionize';
import { SquirrelError, SquirrelErrorType } from './SquirrelREST';

export interface SquirrelStuff {
  id: number;
  name: string;
}

export const LoadingError = unionize({
  NOT_LOADED: {},
});

export type LoadingErrorType = UnionOf<typeof LoadingError>;

// App State
export interface AS {
  squirrelStuff: E.Either<LoadingErrorType | SquirrelErrorType, SquirrelStuff>;
};

// Successful Squirrel State
export interface SS {
  squirrelStuff: E.Right<SquirrelStuff>;
}

// Error Squirrel State
export interface ES {
  squirrelStuff: E.Left<SquirrelErrorType>;
}

export const defaultAppStateFromRouter: DefaultStateFromRoute<AS> = () => ({
  squirrelStuff: E.left<LoadingErrorType, SquirrelStuff>(LoadingError.NOT_LOADED()),
});