export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting DeepSeek Harness': 0,
  'Web Interface': 1,
  'The web interface is not responding yet': 2,
  'The web interface is ready': 3,
  // interfaces.ts
  'The DeepSeek Harness agent — chat, workspace files, and its shell': 10,
  // actions/setPassword.ts
  'Set Web Interface Password': 16,
  'Reset Web Interface Password': 17,
  'Generate the password your browser asks for when opening the web interface. The username is always "admin".': 18,
  'The current password stops working as soon as this runs.': 19,
  'Web Interface Password Set': 20,
  'Save the password now — it is not shown again. Anyone who has it can run commands on this server through the agent.': 21,
  Username: 22,
  Password: 23,
  // init/watchPassword.ts
  'The agent can run shell commands and has no login of its own — set a password before starting it': 25,
  // actions/connectModelServers.ts
  'Connect Model Servers': 30,
  "Give the agent the models served by Strata, llama.cpp, vLLM, or Ollama on this server, with no address or key to type. Run it again after changing a server's model.": 31,
  'Model servers': 32,
  'Model servers installed on this server. Checking one adds its models to DeepSeek Harness; unchecking one removes them. A server must be running, with a model loaded, when you connect it.': 33,
  'No supported model server is installed. Install Strata, llama.cpp, vLLM, or Ollama first.': 34,
  '${title} is not installed.': 35,
  '${title} has not published its API key yet. Start it once, then run this again.': 36,
  '${title} is not reachable. Start it, wait until it is ready, then run this again.': 37,
  '${title} is not serving a model yet. Set one up in ${title}, then run this again.': 38,
  'Model Servers Disconnected': 39,
  'DeepSeek Harness no longer uses a model server on this server.': 40,
  'Model Servers Connected': 41,
  "DeepSeek Harness restarts to apply this. Then pick a model under ${providers} in the model picker. Run this again after you change a server's model.": 42,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
