type S3ACL = 'public-read' | 'private' | 'public-read-write' | 'authenticated-read' | 'aws-exec-read' | 'bucket-owner-read' | 'bucket-owner-full-control' | 'log-delivery-write';
type FileUploadServiceInput = [
    axiosInstance: any,
    get_presigned_url: string,
    folder?: string,
    ACL?: S3ACL,
    should_convert_image_to_webp?: boolean
];
export declare class FileUploadService {
    folder: string;
    name: string;
    ACL: S3ACL;
    ContentType: string;
    extension: string;
    size: number;
    lastModified: string;
    source: any;
    should_convert_image_to_webp: boolean;
    imageMaxWidth: number;
    imageMaxHeight: number;
    imageQuality: number;
    status: string;
    progress: number;
    fileContentBlob: any;
    file_path: string;
    file_name: string;
    file_url: string;
    get_presigned_url: string;
    presigned_url: string;
    isLoading: boolean;
    axiosInstance: any;
    constructor(...args: FileUploadServiceInput);
    get color(): "#ef4444" | "#3b82f6" | "#22c55e" | "#eab308" | "#6b7280";
    get formatted_name(): string;
    get formatted_size(): string;
    wait(ms: number): Promise<unknown>;
    setFile(file: any): void;
    setFileFromMediaRecorded(ContentType: string, recordedChunks: any): void;
    setFileFromBlob(blob: any, ContentType?: string): void;
    private setExtensionAndNameForImageToImprovePerformance;
    upload(): Promise<void>;
    uploadBlob(): Promise<void>;
    uploadRecordedMedia(): Promise<void>;
    get getFileIsImage(): boolean;
    protected getPresignedUrlFromApi(): Promise<void>;
    private readFileAndUpload;
    private convertImageToWebp;
    protected uploadFileToAws(multipart_chunk?: any): Promise<void>;
}
export {};
