export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    statusCode: number;
    message: string;
    details: string[];
    path: string;
    timestamp: string;
  };
};
