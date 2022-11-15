import env from 'env-var'

export const NODE_ENV = env.get('NODE_ENV').required().asString()

export const PORT = env.get('PORT').required().asInt()

// Service token used to talk to other INV services
export const AUTOMATIONS_TOKEN = env.get('AUTOMATIONS_TOKEN').required().asString()

// Other Invisible services
export const NIDAVELLIR_URL = env.get('NIDAVELLIR_URL').required().asString()
export const BRAGI_URL = env.get('BRAGI_URL').required().asString()
export const LAMBDA_URL = env.get('LAMBDA_URL').required().asString()
export const ULTRON_URL = env.get('ULTRON_URL').required().asString()
export const USER_SERVICE_URL = env.get('USER_SERVICE_URL').required().asString()
export const MIMIR_URL = env.get('MIMIR_URL').required().asString()
export const MIDGARD_URL = env.get('MIDGARD_URL').required().asString()
export const MANTICORE_PROCESS_ENGINE_URL = env
  .get('MANTICORE_PROCESS_ENGINE_URL')
  .required()
  .asString()

// Third party API credentials and such
export const GOOGLE_ADMIN_EMAIL = env.get('GOOGLE_ADMIN_EMAIL').required().asString()
export const GOOGLE_SEARCH_API_KEY = env.get('GOOGLE_SEARCH_API_KEY').required().asString()
export const GOOGLE_SEARCH_CX = env.get('GOOGLE_SEARCH_CX').required().asString()

// Hunter Api
export const HUNTER_TOKEN = env.get('HUNTER_TOKEN').required().asString()

// Slack Bot
export const SLACK_API_BOT_TOKEN = env.get('SLACK_API_BOT_TOKEN').required().asString()

// Zoom
export const ZOOM_URL = 'https://api.zoom.us/v2'
export const ZOOM_API_KEY = env.get('ZOOM_API_KEY').required().asString()
export const ZOOM_SECRET = env.get('ZOOM_SECRET').required().asString()

// Bungalow scrapers
export const HOTPADS_SCRAPERS_URL = env.get('HOTPADS_SCRAPERS_URL').asString()
export const ZILLOW_SCRAPERS_URL = env.get('ZILLOW_SCRAPERS_URL').asString()

// Flow
export const FLOW_DB_URL = env.get('FLOW_DB_URL').required().asString()
