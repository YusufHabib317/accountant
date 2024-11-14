export type ErrorBackendType ={
  response: {
    status: number | string;
    data: {
      error: {
        message: string;
        key: string;
      };
    };
  }
}
export interface ErrorFrontendType {
  response: {
    status: number | string;
    data: {
      message: {
        key: string;
        fallback:string;

      };
      code: number | string;
    };
  };
}
