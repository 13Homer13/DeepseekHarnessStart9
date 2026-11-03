import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.1-rc.3:1',
  releaseNotes: {
    en_US:
      "Fixes chats with llama.cpp on this server, which failed with an authentication error on StartOS 0.4.1. DeepSeek Harness now connects to llama.cpp's new OpenAI-compatible API interface with its API key, read automatically. Update llama.cpp first, then run Connect Model Servers again if llama.cpp does not appear. An API key typed into a StartOS model server's card in Settings → Models is now removed on start, because it overrode the key StartOS supplies.",
    es_ES:
      'Corrige los chats con llama.cpp en este servidor, que fallaban con un error de autenticación en StartOS 0.4.1. DeepSeek Harness ahora se conecta a la nueva interfaz API compatible con OpenAI de llama.cpp con su clave de API, que lee automáticamente. Actualice primero llama.cpp y, si llama.cpp no aparece, vuelva a ejecutar Conectar servidores de modelos. Una clave de API escrita en la tarjeta de un servidor de modelos de StartOS en Ajustes → Modelos ahora se elimina al iniciar, porque reemplazaba la clave que proporciona StartOS.',
    de_DE:
      'Behebt Chats mit llama.cpp auf diesem Server, die unter StartOS 0.4.1 mit einem Authentifizierungsfehler scheiterten. DeepSeek Harness verbindet sich jetzt mit der neuen OpenAI-kompatiblen API-Schnittstelle von llama.cpp und liest deren API-Schlüssel automatisch. Aktualisieren Sie zuerst llama.cpp und führen Sie „Modellserver verbinden“ erneut aus, falls llama.cpp nicht erscheint. Ein API-Schlüssel, der in Einstellungen → Modelle in die Karte eines StartOS-Modellservers eingegeben wurde, wird jetzt beim Start entfernt, weil er den von StartOS bereitgestellten Schlüssel überschrieb.',
    pl_PL:
      'Naprawia czaty z llama.cpp na tym serwerze, które w StartOS 0.4.1 kończyły się błędem uwierzytelniania. DeepSeek Harness łączy się teraz z nowym interfejsem API zgodnym z OpenAI w llama.cpp, a jego klucz API odczytuje automatycznie. Najpierw zaktualizuj llama.cpp, a jeśli llama.cpp się nie pojawi, uruchom ponownie akcję Połącz serwery modeli. Klucz API wpisany w Ustawienia → Modele na karcie serwera modeli StartOS jest teraz usuwany przy starcie, bo zastępował klucz dostarczany przez StartOS.',
    fr_FR:
      'Corrige les discussions avec llama.cpp sur ce serveur, qui échouaient avec une erreur d’authentification sous StartOS 0.4.1. DeepSeek Harness se connecte désormais à la nouvelle interface API compatible OpenAI de llama.cpp avec sa clé d’API, lue automatiquement. Mettez d’abord llama.cpp à jour, puis relancez Connecter des serveurs de modèles si llama.cpp n’apparaît pas. Une clé d’API saisie dans la carte d’un serveur de modèles StartOS, dans Paramètres → Modèles, est désormais supprimée au démarrage, car elle remplaçait la clé fournie par StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
