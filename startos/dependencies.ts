import { T } from '@start9labs/start-sdk'
import { KNOWN_BACKENDS } from './backends'
import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'

const descriptions: Record<string, T.LocaleString> = {
  'llama-cpp': {
    en_US:
      'Optional: local GGUF models through llama.cpp. Connect it with the Connect Model Servers action.',
    es_ES:
      'Opcional: modelos GGUF locales a través de llama.cpp. Conéctalo con la acción Conectar servidores de modelos.',
    de_DE:
      'Optional: lokale GGUF-Modelle über llama.cpp. Verbinde es mit der Aktion „Modellserver verbinden“.',
    pl_PL:
      'Opcjonalnie: lokalne modele GGUF przez llama.cpp. Połącz go akcją Połącz serwery modeli.',
    fr_FR:
      'Optionnel : des modèles GGUF locaux via llama.cpp. Connectez-le avec l’action Connecter des serveurs de modèles.',
  },
  vllm: {
    en_US:
      'Optional: local models through vLLM. Connect it with the Connect Model Servers action.',
    es_ES:
      'Opcional: modelos locales a través de vLLM. Conéctalo con la acción Conectar servidores de modelos.',
    de_DE:
      'Optional: lokale Modelle über vLLM. Verbinde es mit der Aktion „Modellserver verbinden“.',
    pl_PL:
      'Opcjonalnie: lokalne modele przez vLLM. Połącz go akcją Połącz serwery modeli.',
    fr_FR:
      'Optionnel : des modèles locaux via vLLM. Connectez-le avec l’action Connecter des serveurs de modèles.',
  },
  ollama: {
    en_US:
      'Optional: local models through Ollama. Connect it with the Connect Model Servers action.',
    es_ES:
      'Opcional: modelos locales a través de Ollama. Conéctalo con la acción Conectar servidores de modelos.',
    de_DE:
      'Optional: lokale Modelle über Ollama. Verbinde es mit der Aktion „Modellserver verbinden“.',
    pl_PL:
      'Opcjonalnie: lokalne modele przez Ollama. Połącz go akcją Połącz serwery modeli.',
    fr_FR:
      'Optionnel : des modèles locaux via Ollama. Connectez-le avec l’action Connecter des serveurs de modèles.',
  },
}

// Each model server is a dependency only while Connect Model Servers has it
// connected.
const backend = <const Id extends string>(id: Id) => {
  const b = KNOWN_BACKENDS.find((k) => k.id === id)!
  return sdk.Dependency.optional(id, {
    description: descriptions[id],
    metadata: { title: b.title, icon: b.icon },
    versionRange: b.versionRange,
    kind: 'running',
    healthChecks: [b.healthCheck],
    enabled: async ({ effects }) =>
      !!(await storeJson.read((s) => id in s.backends).const(effects)),
  })
}

export const dependencies = sdk.Dependencies.of()
  .addDependency(backend('llama-cpp'))
  .addDependency(backend('vllm'))
  .addDependency(backend('ollama'))
