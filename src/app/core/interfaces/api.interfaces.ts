export interface ApiMessage {
    code: string;          
    message: string;       
    correlationId?: string;
    details?: unknown;
  }
  
  export interface UploadCsvResponse {
    ok: boolean;
    message: ApiMessage;
  }
  