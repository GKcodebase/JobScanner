export type ErrorWithContext = {
  message: string;
  stack?: string;
  context?: unknown;
};

export type FirestoreError = {
  timestamp: Date;
  error: ErrorWithContext;
  userAgent: string;
};