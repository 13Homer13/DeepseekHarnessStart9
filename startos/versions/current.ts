import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.2-rc.3:0',
  releaseNotes: {
    en_US:
      'Updates DeepSeek Harness to 0.2.2-rc.3. Code review in Git worktrees, named and nested subagents, retry settings for failed model requests, saved API keys shown masked, and an experimental importer for past DeepSeek App or web conversations. Connect Model Servers can now connect Strata. Requires StartOS 0.4.2 or later.',
    es_ES:
      'Actualiza DeepSeek Harness a 0.2.2-rc.3. Revisión de código en worktrees de Git, subagentes con nombre y anidados, ajustes de reintento para solicitudes fallidas al modelo, claves API guardadas mostradas enmascaradas y un importador experimental de conversaciones anteriores de la app o la web de DeepSeek. Conectar servidores de modelos ahora puede conectar Strata. Requiere StartOS 0.4.2 o posterior.',
    de_DE:
      'Aktualisiert DeepSeek Harness auf 0.2.2-rc.3. Code-Review in Git-Worktrees, benannte und verschachtelte Subagenten, Wiederholungseinstellungen für fehlgeschlagene Modellanfragen, gespeicherte API-Schlüssel werden maskiert angezeigt, und ein experimenteller Import früherer Unterhaltungen aus der DeepSeek-App oder -Web. „Modellserver verbinden“ kann jetzt Strata verbinden. Erfordert StartOS 0.4.2 oder neuer.',
    pl_PL:
      'Aktualizuje DeepSeek Harness do wersji 0.2.2-rc.3. Przegląd kodu w worktree Git, nazwane i zagnieżdżone subagenty, ustawienia ponawiania nieudanych żądań do modelu, zapisane klucze API wyświetlane w formie zamaskowanej oraz eksperymentalny import wcześniejszych rozmów z aplikacji lub wersji webowej DeepSeek. Połącz serwery modeli może teraz połączyć Strata. Wymaga StartOS 0.4.2 lub nowszego.',
    fr_FR:
      'Met à jour DeepSeek Harness vers 0.2.2-rc.3. Revue de code dans les worktrees Git, sous-agents nommés et imbriqués, réglages de nouvelle tentative pour les requêtes au modèle qui échouent, clés API enregistrées affichées masquées, et un import expérimental des anciennes conversations de l’app ou du web DeepSeek. Connecter des serveurs de modèles peut désormais connecter Strata. Nécessite StartOS 0.4.2 ou ultérieur.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
