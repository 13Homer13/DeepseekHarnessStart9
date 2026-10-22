import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0-rc.2:1',
  releaseNotes: {
    en_US: 'Updates Node.js to 22.23.4 with security fixes.',
    es_ES: 'Actualiza Node.js a 22.23.4 con correcciones de seguridad.',
    de_DE: 'Aktualisiert Node.js auf 22.23.4 mit Sicherheitskorrekturen.',
    pl_PL: 'Aktualizuje Node.js do wersji 22.23.4 z poprawkami bezpieczeństwa.',
    fr_FR: 'Met à jour Node.js vers 22.23.4 avec des correctifs de sécurité.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
