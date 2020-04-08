import * as E from 'fp-ts/lib/Either';
import { unionize, UnionOf } from 'unionize';
import { SquirrelErrorType } from './SquirrelREST';

export interface SquirrelStuff {
  id: number;
  name: string;
}

export const LoadingError = unionize({
  NOT_LOADED: {},
});

export type LoadingErrorType = UnionOf<typeof LoadingError>;

// App State
export type AppState = E.Either<LoadingErrorType | SquirrelErrorType, SquirrelStuff>;

export const defaultAppState: AppState = E.left<LoadingErrorType, SquirrelStuff>(
  LoadingError.NOT_LOADED(),
);