import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3000", "192.168.0.49:3000", "192.168.0.49", "*"],
};

export default nextConfig;
