/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional URL of a server-side proxy for a future LLM-backed RAVI-AI. Never put API keys here. */
  readonly VITE_ASSISTANT_ENDPOINT?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
