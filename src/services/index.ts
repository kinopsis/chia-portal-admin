// Services exports for easy importing

// Dependencias services
export {
  DependenciasClientService,
  dependenciasClientService,
} from './dependencias'

// Subdependencias services
export {
  SubdependenciasServerService,
  SubdependenciasClientService,
  subdependenciasServerService,
  subdependenciasClientService,
} from './subdependencias'

// Temas services
export { TemasClientService, temasClientService } from './temas'

// Tramites services
export {
  TramitesServerService,
  TramitesClientService,
  tramitesServerService,
  tramitesClientService,
} from './tramites'

// OPAs services
export { OPAsServerService, OPAsClientService, opasServerService, opasClientService } from './opas'

// FAQs services
export { FAQsServerService, FAQsClientService, faqsServerService, faqsClientService } from './faqs'

// Service types for convenience
export type {
  Dependencia,
  Subdependencia,
  Tema,
  Tramite,
  OPA,
  FAQ,
  FAQHierarchy,
  SearchFilters,
  PaginatedResponse,
  ApiResponse,
} from '@/types'
