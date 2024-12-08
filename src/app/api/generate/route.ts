import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { GenerationOptions } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const options: GenerationOptions = await request.json();

    const formData = new FormData();
    formData.append("prompt", options.prompt);
    
    // Add optional parameters if they exist
    if (options.model) formData.append("model", options.model);
    if (options.aspect_ratio) formData.append("aspect_ratio", options.aspect_ratio);
    if (options.negative_prompt) formData.append("negative_prompt", options.negative_prompt);
    if (options.seed) formData.append("seed", options.seed.toString());
    if (options.cfg_scale) formData.append("cfg_scale", options.cfg_scale.toString());

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          Authorization: `Bearer ${options.apiKey}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}