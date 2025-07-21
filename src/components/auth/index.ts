// Authentication components exports

export {
  default as ProtectedRoute,
  AdminRoute,
  FuncionarioRoute,
  AuthenticatedRoute,
} from './ProtectedRoute'

export {
  default as RoleGuard,
  AdminOnly,
  FuncionarioOnly,
  CiudadanoOnly,
  AuthenticatedOnly,
  GuestOnly,
} from './RoleGuard'
