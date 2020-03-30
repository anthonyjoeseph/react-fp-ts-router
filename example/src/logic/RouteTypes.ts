import {
  end,
  lit,
  zero,
  str,
} from "fp-ts-routing";
import { unionize, UnionOf, ofType } from "unionize";

export const AppRoute = unionize({
  Home: {},
  Squirrel: {},
  SquirrelError: ofType<{ type: 'nut' | 'tree' }>(),
  NotFound: {}
});
export type AppRoute = UnionOf<typeof AppRoute>;

export const homeDuplex = end;
export const squirrelDuplex = lit('squirrel').then(end);
export const squirrelErrorDuplex = lit('error').then(str('id')).then(end);

export const appRouter = zero<AppRoute>()
  .alt(homeDuplex.parser.map(() => AppRoute.Home()))
  .alt(squirrelDuplex.parser.map(() => AppRoute.Squirrel()))
  .alt(squirrelErrorDuplex.parser.map(({ id }) => id === 'nut' || id === 'tree'
    ? AppRoute.SquirrelError({ type: id })
    : AppRoute.NotFound()
  ));
