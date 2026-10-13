import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'

export const current = VersionInfo.of({
  version: '0.2.0-rc.2:0',
  releaseNotes: {
    en_US: `Updates DeepSeek Harness to 0.2.0-rc.2. The new Connect Model Servers action gives the agent the models served by llama.cpp, vLLM, or Ollama on this server, with no address or key to type. Settings → Models in the web interface now works on StartOS too, so you can add any other model provider there instead of only DeepSeek. A DeepSeek API key is no longer required to get started. The Set DeepSeek API Key action and the DeepSeek API health check are removed: if you stored your key with that action, enter it again in Settings → Models.`,
    es_ES: `Actualiza DeepSeek Harness a 0.2.0-rc.2. La nueva acción Conectar servidores de modelos da al agente los modelos que sirven llama.cpp, vLLM u Ollama en este servidor, sin escribir direcciones ni claves. Settings → Models en la interfaz web también funciona ya en StartOS, así que puedes añadir allí cualquier otro proveedor de modelos y no solo DeepSeek. Ya no hace falta una clave API de DeepSeek para empezar. Se eliminan la acción «Establecer la clave API de DeepSeek» y la comprobación de la API de DeepSeek: si guardaste tu clave con esa acción, vuelve a introducirla en Settings → Models.`,
    de_DE: `Aktualisiert DeepSeek Harness auf 0.2.0-rc.2. Die neue Aktion „Modellserver verbinden“ gibt dem Agenten die Modelle, die llama.cpp, vLLM oder Ollama auf diesem Server bereitstellen, ohne Adresse oder Schlüssel einzutippen. Auch Settings → Models in der Weboberfläche funktioniert jetzt auf StartOS, sodass du dort jeden weiteren Modellanbieter hinzufügen kannst, statt nur DeepSeek. Ein DeepSeek-API-Schlüssel ist für den Start nicht mehr nötig. Die Aktion „DeepSeek-API-Schlüssel festlegen“ und die DeepSeek-API-Prüfung entfallen: Wenn du deinen Schlüssel mit dieser Aktion gespeichert hast, gib ihn in Settings → Models erneut ein.`,
    pl_PL: `Aktualizuje DeepSeek Harness do 0.2.0-rc.2. Nowa akcja Połącz serwery modeli daje agentowi modele serwowane przez llama.cpp, vLLM lub Ollama na tym serwerze, bez wpisywania adresu ani klucza. Settings → Models w interfejsie WWW również działa teraz na StartOS, więc możesz tam dodać dowolnego innego dostawcę modeli, a nie tylko DeepSeek. Klucz API DeepSeek nie jest już potrzebny na start. Usunięto akcję „Ustaw klucz API DeepSeek” i sprawdzanie API DeepSeek: jeśli klucz był zapisany tą akcją, wpisz go ponownie w Settings → Models.`,
    fr_FR: `Met à jour DeepSeek Harness vers 0.2.0-rc.2. La nouvelle action Connecter des serveurs de modèles donne à l’agent les modèles servis par llama.cpp, vLLM ou Ollama sur ce serveur, sans adresse ni clé à saisir. Settings → Models dans l’interface web fonctionne aussi désormais sur StartOS : vous pouvez y ajouter n’importe quel autre fournisseur de modèles, et plus seulement DeepSeek. Une clé API DeepSeek n’est plus nécessaire pour commencer. L’action « Définir la clé API DeepSeek » et la vérification de l’API DeepSeek sont supprimées : si vous aviez enregistré votre clé avec cette action, saisissez-la à nouveau dans Settings → Models.`,
  },
  migrations: {
    // Releases before 0.2 kept a DeepSeek key here for the removed Set DeepSeek
    // API Key action. Nothing reads it now, so keep it off the disk and out of
    // future backups.
    up: async ({ effects }) => {
      await storeJson.update(effects, (s) => {
        if (!s || !('apiKey' in s)) return null
        const { apiKey, ...rest } = s
        return rest
      })
    },
    down: IMPOSSIBLE,
  },
})
