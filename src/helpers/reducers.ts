import { SingleValueVariants, Unionized } from 'unionize';

type Union<Record> = Unionized<Record, SingleValueVariants<Record, 'tag', 'value'>>;
export const transformOneState = <R>(union: Union<R>) => <S extends typeof union._Tags>(
  stateType: S,
) => <A>(
  fn: (prevState: typeof union._Record[S]) => (action: A) => typeof union._Union,
  prevState: typeof union._Union,
) => (union.is[stateType](prevState) ? fn(prevState.value) : () => prevState);
