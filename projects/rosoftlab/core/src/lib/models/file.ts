import { BaseModelConfig } from "../core";
import { BaseModel } from "./base.model";

@BaseModelConfig({
  type: 'file'
})
export class File extends BaseModel {
  // Gets or sets the file binary
  fileBinary?: number[];

  // Gets or sets the file mime type
  mimeType?: string;

  // Gets or sets the SEO friendly filename of the file
  filename?: string;

  // Gets or sets the S3 file name
  s3FileName?: string;

  // Gets or sets if the file is a temporary one and not saved to s3
  isTemporary: boolean = false;

  // Gets or sets the hash of the file
  hash?: string;
}
