/**
 * Tracing service for application diagnostics
 * This provides a structured way to log different types of events in the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'ui' | 'calculation' | 'constraint' | 'performance' | 'scenario';

// Configuration for tracing
interface TracingConfig {
  enabled: boolean;
  minLevel: LogLevel;
  enabledCategories: LogCategory[];
}

// Object to store performance timers
const performanceTimers: Record<string, number> = {};

// Default configuration
let config: TracingConfig = {
  enabled: process.env.NODE_ENV === 'development',
  minLevel: 'info',
  enabledCategories: ['calculation', 'constraint', 'performance', 'scenario']
};

/**
 * Check if tracing is enabled for the given level and category
 */
function isEnabled(level: LogLevel, category: LogCategory): boolean {
  if (!config.enabled) return false;
  
  const levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  
  const isLevelEnabled = levelPriority[level] >= levelPriority[config.minLevel];
  const isCategoryEnabled = config.enabledCategories.includes(category);
  
  return isLevelEnabled && isCategoryEnabled;
}

/**
 * Configure the tracing service
 */
export function configureTracing(newConfig: Partial<TracingConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Log a message with the given level and category
 */
export function log(level: LogLevel, category: LogCategory, message: string, data?: any): void {
  if (!isEnabled(level, category)) return;
  
  const formattedCategory = `[${category.toUpperCase()}]`;
  const timestamp = new Date().toISOString();
  
  if (data) {
    console[level](`${timestamp} ${formattedCategory} ${message}`, data);
  } else {
    console[level](`${timestamp} ${formattedCategory} ${message}`);
  }
}

/**
 * Start a performance timer
 */
export function startTimer(timerId: string): void {
  if (!isEnabled('debug', 'performance')) return;
  
  performanceTimers[timerId] = performance.now();
  log('debug', 'performance', `Started timer: ${timerId}`);
}

/**
 * End a performance timer and log the elapsed time
 */
export function endTimer(timerId: string, category: LogCategory = 'performance'): number {
  if (!isEnabled('debug', 'performance')) return 0;
  
  if (!performanceTimers[timerId]) {
    log('warn', 'performance', `Timer not found: ${timerId}`);
    return 0;
  }
  
  const startTime = performanceTimers[timerId];
  const endTime = performance.now();
  const elapsed = endTime - startTime;
  
  log('info', category, `${timerId} completed in ${elapsed.toFixed(2)}ms`);
  
  delete performanceTimers[timerId];
  return elapsed;
}

/**
 * Log a calculation event
 */
export function logCalculation(message: string, data?: any): void {
  log('info', 'calculation', message, data);
}

/**
 * Log a constraint determination event
 */
export function logConstraint(message: string, data?: any): void {
  log('info', 'constraint', message, data);
}

/**
 * Log a UI event
 */
export function logUI(message: string, data?: any): void {
  log('info', 'ui', message, data);
}

/**
 * Log a scenario calculation event
 */
export function logScenario(message: string, data?: any): void {
  log('info', 'scenario', message, data);
}

/**
 * Log an error event
 */
export function logError(category: LogCategory, message: string, error?: any): void {
  log('error', category, message, error);
}

// Export all functions
export const tracingService = {
  configureTracing,
  log,
  startTimer,
  endTimer,
  logCalculation,
  logConstraint,
  logUI,
  logScenario,
  logError
}; 