import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.1-rc.5:0',
  releaseNotes: {
    en_US:
      "Updates DeepSeek Harness to 0.2.1-rc.5. The model's thinking is shown more clearly in conversations, and diagnostic messages no longer mix into the output of ACP sessions.",
    es_ES:
      'Actualiza DeepSeek Harness a 0.2.1-rc.5. El razonamiento del modelo se muestra con más claridad en las conversaciones, y los mensajes de diagnóstico ya no se mezclan con la salida de las sesiones ACP.',
    de_DE:
      'Aktualisiert DeepSeek Harness auf 0.2.1-rc.5. Die Denkschritte des Modells werden in Unterhaltungen übersichtlicher angezeigt, und Diagnosemeldungen gelangen nicht mehr in die Ausgabe von ACP-Sitzungen.',
    pl_PL:
      'Aktualizuje DeepSeek Harness do wersji 0.2.1-rc.5. Rozumowanie modelu jest wyraźniej pokazywane w rozmowach, a komunikaty diagnostyczne nie trafiają już do wyjścia sesji ACP.',
    fr_FR:
      "Met à jour DeepSeek Harness vers 0.2.1-rc.5. Le raisonnement du modèle s'affiche plus clairement dans les conversations, et les messages de diagnostic ne se mêlent plus à la sortie des sessions ACP.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
