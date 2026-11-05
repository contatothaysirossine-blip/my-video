// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
// Keep frames close to lossless so the footage doesn't lose detail.
Config.setJpegQuality(100);
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.setX264Preset("slow");
Config.setOverwriteOutput(true);
