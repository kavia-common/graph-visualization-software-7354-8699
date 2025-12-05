import React, { useContext, useMemo } from 'react';
import ExampleNode from './samples/ExampleNode';
import ExampleEdge from './samples/ExampleEdge';

const PluginRegistryContext = React.createContext(null);

// PUBLIC_INTERFACE
export function PluginRegistryProvider({ children }) {
  /**
   * Plugin registry: provides nodeTypes and edgeTypes maps consumed by GraphCanvas.
   * Additional plugin registration can be added here later with dynamic loading.
   */
  const value = useMemo(() => {
    return {
      nodeTypes: {
        exampleNode: ExampleNode,
      },
      edgeTypes: {
        exampleEdge: ExampleEdge,
      },
    };
  }, []);

  return (
    <PluginRegistryContext.Provider value={value}>
      {children}
    </PluginRegistryContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function usePlugins() {
  /** Access plugin registry. */
  const ctx = useContext(PluginRegistryContext);
  return ctx || { nodeTypes: {}, edgeTypes: {} };
}
