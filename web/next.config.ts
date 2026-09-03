import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Next 16 writes an AGENTS.md and a CLAUDE.md into this directory on first
   * dev run. The repo already has a deliberate CLAUDE.md at its root, and a
   * second auto-generated one here would shadow it with boilerplate about
   * Next's own conventions. Off.
   */
  agentRules: false,
};

export default nextConfig;
