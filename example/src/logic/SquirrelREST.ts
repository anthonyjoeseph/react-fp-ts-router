import * as TE from 'fp-ts/lib/TaskEither';
import { SquirrelStuff } from './AppState';

export type SquirrelError = 'HardNutToCrack' | 'TreeFellDown';

export const getSquirrelFromREST = () => TE.right<SquirrelError, SquirrelStuff>({
  id: 42,
  name: 'Secret Squirrel'
});

export const getNutErrorFromREST = () => TE.left<SquirrelError, SquirrelStuff>(
  'HardNutToCrack',
);

export const getTreeErrorFromREST = () => TE.left<SquirrelError, SquirrelStuff>(
  'TreeFellDown',
);