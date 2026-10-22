import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.0-rc.2:1',
  releaseNotes: {
    en_US:
      'Updates Node.js to 22.23.4 with security fixes and the StartOS SDK to 3.1.0.',
    es_ES:
      'Actualiza Node.js a 22.23.4 con correcciones de seguridad y el SDK de StartOS a 3.1.0.',
    de_DE:
      'Aktualisiert Node.js auf 22.23.4 mit Sicherheitskorrekturen und das StartOS-SDK auf 3.1.0.',
    pl_PL:
      'Aktualizuje Node.js do wersji 22.23.4 z poprawkami bezpieczeństwa oraz SDK StartOS do wersji 3.1.0.',
    fr_FR:
      'Met à jour Node.js vers 22.23.4 avec des correctifs de sécurité et le SDK StartOS vers 3.1.0.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
