import * as TE from 'fp-ts/lib/TaskEither';
import { unionize, UnionOf } from 'unionize';
import { SquirrelStuff } from './AppState';

export const SquirrelError = unionize({
  HARD_NUT_TO_CRACK: {},
  TREE_FELL_DOWN: {},
});
export type SquirrelErrorType = UnionOf<typeof SquirrelError>

export const getSquirrelFromREST = () => TE.right<SquirrelErrorType, SquirrelStuff>({
  id: 42,
  name: 'Secret Squirrel'
});

export const getNutErrorFromREST = () => TE.left<SquirrelErrorType, SquirrelStuff>(
  SquirrelError.HARD_NUT_TO_CRACK(),
);

export const getTreeErrorFromREST = () => TE.left<SquirrelErrorType, SquirrelStuff>(
  SquirrelError.TREE_FELL_DOWN(),
);