export interface GenerationOptions {
  prompt: string;
  model?:
    | "sd3.5-large"
    | "sd3.5-large-turbo"
    | "sd3.5-medium"
    | "sd3-large"
    | "sd3-large-turbo"
    | "sd3-medium";
  aspect_ratio?:
    | "16:9"
    | "1:1"
    | "21:9"
    | "2:3"
    | "3:2"
    | "4:5"
    | "5:4"
    | "9:16"
    | "9:21";
  negative_prompt?: string;
  seed?: number;
  cfg_scale?: number;
  apiKey?: string;
}
