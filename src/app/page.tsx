"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { GenerationOptions } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_KEY_STORAGE_KEY = "sd_api_key";

const StableImageGeneratePage: React.FC = () => {
  const [options, setOptions] = useState<GenerationOptions>({
    prompt: "",
    model: "sd3.5-large",
    aspect_ratio: "1:1",
    negative_prompt: "",
    seed: 0,
    cfg_scale: 7.5,
  });
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSeed, setLastSeed] = useState<number | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [tempApiKey, setTempApiKey] = useState<string>("");

  useEffect(() => {
    // Check for API key in localStorage on component mount
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!storedApiKey) {
      setShowApiKeyDialog(true);
    } else {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, tempApiKey.trim());
      setApiKey(tempApiKey.trim());
      setShowApiKeyDialog(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const formData = new FormData();
      formData.append("prompt", options.prompt);
      if (options.model) formData.append("model", options.model);
      if (options.aspect_ratio)
        formData.append("aspect_ratio", options.aspect_ratio);
      if (options.negative_prompt)
        formData.append("negative_prompt", options.negative_prompt);
      if (options.seed) formData.append("seed", options.seed.toString());
      if (options.cfg_scale)
        formData.append("cfg_scale", options.cfg_scale.toString());

      const response = await axios.post(
        "https://api.stability.ai/v2beta/stable-image/generate/sd3",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const { image: imageData, finish_reason, seed } = response.data;

      if (imageData && finish_reason === "SUCCESS") {
        setImage(`data:image/png;base64,${imageData}`);
        setLastSeed(seed);
      } else {
        setError("No image was generated.");
      }
    } catch (error) {
      if (error instanceof AxiosError && error.status === 401) {
        setError("Invalid API Key");
      } else {
        setError("An error occurred while generating the image.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!image) return;

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = image;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `generated-${timestamp}.png`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // API Key Dialog Component
  const ApiKeyDialog = () => (
    <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your API Key</DialogTitle>
          <DialogDescription>
            Please enter your Stable Diffusion API key to continue. This will be
            stored securely in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            type="password"
            placeholder="Enter your API key"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
          />
          <Button
            onClick={handleApiKeySubmit}
            className="w-full"
            disabled={!tempApiKey.trim()}
          >
            Save API Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <ApiKeyDialog />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Stable Diffusion Generator
            </h1>
            <p className="text-gray-600">Create stunning AI-generated images</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Model
              </label>
              <select
                value={options.model}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    model: e.target.value as GenerationOptions["model"],
                  }))
                }
                className="w-full p-3 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="sd3.5-large">
                  ✨ SD 3.5 Large (6.5 credits)
                </option>
                <option value="sd3.5-large-turbo">
                  ⚡ SD 3.5 Large Turbo (4 credits)
                </option>
                <option value="sd3.5-medium">
                  💎 SD 3.5 Medium (3.5 credits)
                </option>
                <option value="sd3-large">🌟 SD 3 Large (6.5 credits)</option>
                <option value="sd3-large-turbo">
                  ⚡ SD 3 Large Turbo (4 credits)
                </option>
                <option value="sd3-medium">💫 SD 3 Medium (3.5 credits)</option>
              </select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Aspect Ratio
              </label>
              <select
                value={options.aspect_ratio}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    aspect_ratio: e.target
                      .value as GenerationOptions["aspect_ratio"],
                  }))
                }
                className="w-full p-3 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="1:1">1:1 Square</option>
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait</option>
                <option value="3:2">3:2 Standard</option>
                <option value="2:3">2:3 Portrait</option>
                <option value="4:5">4:5</option>
                <option value="5:4">5:4</option>
                <option value="21:9">21:9 Ultrawide</option>
                <option value="9:21">9:21 Tall</option>
              </select>
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Prompt
            </label>
            <textarea
              placeholder="Describe your image in detail..."
              value={options.prompt}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, prompt: e.target.value }))
              }
              className="w-full h-32 p-4 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Negative Prompt{" "}
              <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              placeholder="Specify what you don't want to see..."
              value={options.negative_prompt}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  negative_prompt: e.target.value,
                }))
              }
              className="w-full h-24 p-4 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seed */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Seed{" "}
                <span className="text-gray-500 font-normal">
                  (Last: {lastSeed ?? "none"})
                </span>
              </label>
              <input
                type="number"
                value={options.seed}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    seed: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full p-3 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                min="0"
                max="4294967294"
              />
            </div>

            {/* CFG Scale */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                CFG Scale{" "}
                <span className="text-blue-500 font-medium">
                  ({options.cfg_scale})
                </span>
              </label>
              <input
                type="range"
                value={options.cfg_scale}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    cfg_scale: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                min="1"
                max="10"
                step="0.1"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !options.prompt}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Image"
            )}
          </button>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {image && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Generated Image
              </h2>
              <div className="relative group">
                <img
                  src={image}
                  alt="Generated"
                  onClick={handleDownload}
                  className="w-full rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-xl"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StableImageGeneratePage;
