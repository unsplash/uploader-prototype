import pipe from 'lodash/flow';
import omitBy from 'lodash/omitBy';
import React from 'react';
import getDisplayName from 'recompose/getDisplayName';
import { isUndefined } from 'util';
import { ObjectDiff } from './typescript';

const withDefaultsParams = <DefaultParams extends {}>(defaultParams: DefaultParams) => <
  Params extends DefaultParams
>(
  inputParams: ObjectDiff<Params, DefaultParams>,
) =>
  pipe(
    // If a prop is provided with a value of `undefined`, we want the default prop to take
    // precedence. This ensures the behaviour matches that of React's built-in `defaultProps`
    // static property on components, as well as default values for function parameters.
    () => omitBy(inputParams, isUndefined) as ObjectDiff<Params, DefaultParams>,
    inputParamsMinusUndefined =>
      ({
        // We cast spreaded objects to any to workaround TS issue when spreading generic objects
        // https://github.com/Microsoft/TypeScript/issues/14409
        ...(defaultParams as any),
        ...(inputParamsMinusUndefined as any),
      } as Params),
  )();

export const withDefaultsFn = <DefaultParams, Params extends DefaultParams, Result>(
  fn: (params: Params) => Result,
  defaultParams: DefaultParams,
): ((inputParams: ObjectDiff<Params, DefaultParams>) => Result) =>
  pipe(
    withDefaultsParams(defaultParams),
    fn,
  );

export const withDefaults = function<DefaultProps>(defaults: DefaultProps) {
  return function<Props extends DefaultProps>(C: React.ComponentType<Props>) {
    type InputProps = ObjectDiff<Props, DefaultProps>;
    const WithDefaults: React.SFC<InputProps> = pipe(
      withDefaultsParams(defaults),
      props => <C {...props} />,
    );
    WithDefaults.displayName = `WithDefaults(${getDisplayName(C)})`;
    return WithDefaults;
  };
};
