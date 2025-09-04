import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Task, User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * Actions for the app state reducer
 */
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'ar' }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: number; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_SELECTED_INTERVAL'; payload: number }
  | { type: 'SET_CURRENT_TIME'; payload: Date }
  | { type: 'RESET_STATE' };

/**
 * App context value interface
 */
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setLoading: (loading: boolean) => void;
    setUser: (user: User | null) => void;
    setLanguage: (language: 'en' | 'ar') => void;
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Task) => void;
    updateTask: (id: number, updates: Partial<Task>) => void;
    deleteTask: (id: number) => void;
    setRecording: (recording: boolean) => void;
    setSelectedInterval: (interval: number) => void;
    setCurrentTime: (time: Date) => void;
    resetState: () => void;
  };
}

/**
 * Initial app state
 */
const initialState: AppState = {
  tasks: [],
  isRecording: false,
  selectedInterval: 60,
  currentTime: new Date(),
  isLoading: false,
  user: null,
  language: 'en',
};

/**
 * App state reducer
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'ADD_TASK':
      return { 
        ...state, 
        tasks: [...state.tasks, action.payload] 
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case 'SET_RECORDING':
      return { ...state, isRecording: action.payload };
    
    case 'SET_SELECTED_INTERVAL':
      return { ...state, selectedInterval: action.payload };
    
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    
    case 'RESET_STATE':
      return { ...initialState, currentTime: new Date() };
    
    default:
      return state;
  }
}

/**
 * Validator for app state data
 */
function validateAppState(value: any): value is Partial<AppState> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.tasks === undefined || Array.isArray(value.tasks)) &&
    (value.isRecording === undefined || typeof value.isRecording === 'boolean') &&
    (value.selectedInterval === undefined || typeof value.selectedInterval === 'number') &&
    (value.isLoading === undefined || typeof value.isLoading === 'boolean') &&
    (value.language === undefined || ['en', 'ar'].includes(value.language))
  );
}

// Create context
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * App context provider component
 */
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Persist state to local storage
  const { 
    value: persistedState, 
    setValue: saveState, 
    loading: storageLoading 
  } = useLocalStorage<Partial<AppState>>('appState', {}, validateAppState);

  // Load persisted state on mount
  useEffect(() => {
    if (!storageLoading && persistedState) {
      // Restore persisted state
      if (persistedState.tasks) {
        dispatch({ type: 'SET_TASKS', payload: persistedState.tasks });
      }
      if (persistedState.selectedInterval !== undefined) {
        dispatch({ type: 'SET_SELECTED_INTERVAL', payload: persistedState.selectedInterval });
      }
      if (persistedState.language) {
        dispatch({ type: 'SET_LANGUAGE', payload: persistedState.language });
      }
      if (persistedState.user) {
        dispatch({ type: 'SET_USER', payload: persistedState.user });
      }
    }
  }, [storageLoading, persistedState]);

  // Persist state changes
  useEffect(() => {
    if (!storageLoading) {
      const stateToSave: Partial<AppState> = {
        tasks: state.tasks,
        selectedInterval: state.selectedInterval,
        language: state.language,
        user: state.user,
      };
      saveState(stateToSave).catch(console.error);
    }
  }, [state.tasks, state.selectedInterval, state.language, state.user, storageLoading, saveState]);

  // Action creators
  const actions = {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setUser: (user: User | null) => dispatch({ type: 'SET_USER', payload: user }),
    setLanguage: (language: 'en' | 'ar') => dispatch({ type: 'SET_LANGUAGE', payload: language }),
    setTasks: (tasks: Task[]) => dispatch({ type: 'SET_TASKS', payload: tasks }),
    addTask: (task: Task) => dispatch({ type: 'ADD_TASK', payload: task }),
    updateTask: (id: number, updates: Partial<Task>) => dispatch({ type: 'UPDATE_TASK', payload: { id, updates } }),
    deleteTask: (id: number) => dispatch({ type: 'DELETE_TASK', payload: id }),
    setRecording: (recording: boolean) => dispatch({ type: 'SET_RECORDING', payload: recording }),
    setSelectedInterval: (interval: number) => dispatch({ type: 'SET_SELECTED_INTERVAL', payload: interval }),
    setCurrentTime: (time: Date) => dispatch({ type: 'SET_CURRENT_TIME', payload: time }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
  };

  const contextValue: AppContextValue = {
    state,
    dispatch,
    actions,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to use app context
 * @returns App context value
 * @throws Error if used outside AppProvider
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}