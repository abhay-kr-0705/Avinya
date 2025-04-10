interface ErrorLog {
  timestamp: string;
  error: Error;
  context?: Record<string, unknown>;
  user?: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLog[] = [];

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  log(error: Error, context?: Record<string, unknown>, user?: string) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error,
      context,
      user
    };

    this.logs.push(errorLog);
    console.error('Error logged:', errorLog);

    // In production, you would send this to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      this.sendToErrorTracking(errorLog);
    }
  }

  private async sendToErrorTracking(errorLog: ErrorLog) {
    try {
      const response = await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });

      if (!response.ok) {
        console.error('Failed to send error to tracking service');
      }
    } catch (e) {
      console.error('Error sending log to tracking service:', e);
    }
  }

  getLogs(): ErrorLog[] {
    return this.logs;
  }
}

export const logger = ErrorLogger.getInstance();