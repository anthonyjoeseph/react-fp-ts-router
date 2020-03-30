import React, { Component } from 'react';

interface JustStateProps<S> {
  appState: S;
}

/**
 * Renders components who accept a
 * narrower version of the global state
 * 
 * @template S - Global app state
 * @template N - Narrower app state
 * @template T - All of the wrapped component's props
 * @param WrappedComponent - Component with narrow app state
 * @param renderCondition - Type predicate to narrow component type
 */
export default function withNarrowerAppState<
  S, N extends S, T extends JustStateProps<N>
>(
  WrappedComponent: React.ComponentType<T>,
  renderCondition: (a: S) => a is N
): React.ComponentType<Omit<T, keyof JustStateProps<N>> & JustStateProps<S>> {
  return class NarrowerAppState extends Component<
    Omit<T, keyof JustStateProps<N>> & JustStateProps<S>
  > {
    public render(): JSX.Element {
      const { appState } = this.props;
      if (renderCondition(appState)) {
        return <WrappedComponent
          {...this.props as T}
          appState={appState}
        />;
      }
      return <React.Fragment/>;
    }
  };
}
