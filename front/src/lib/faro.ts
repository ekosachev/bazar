import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk'

const collectorUrl = import.meta.env.VITE_FARO_COLLECTOR_URL as string | undefined

export function initFaro() {
  if (!collectorUrl) {
    return
  }

  initializeFaro({
    url: collectorUrl,
    app: {
      name: 'bazar-front',
      version: '0.0.0',
      environment: import.meta.env.MODE,
    },
    instrumentations: getWebInstrumentations(),
  })
}
