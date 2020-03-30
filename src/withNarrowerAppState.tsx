import React, { Component } from 'react';

interface JustStateProps<S> {
  appState: S;
}

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
      return <div/>
    }
  };
}
