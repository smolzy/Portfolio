export interface GposeImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  // Custom context fields stored in Cloudinary
  title: string;
  zone: string;
  job: string;
  preset: string;
  tags: string[];
  created_at: string;
}

export interface UploadFormData {
  title: string;
  zone: string;
  job: string;
  preset: string;
  tags: string;
}

export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  context?: {
    custom?: {
      title?: string;
      zone?: string;
      job?: string;
      preset?: string;
    };
  };
  tags?: string[];
  created_at: string;
}
