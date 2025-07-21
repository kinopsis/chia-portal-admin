import React from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'

export interface FooterProps {
  className?: string
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Servicios',
      links: [
        { label: 'Trámites en Línea', href: '/tramites', icon: '📋' },
        { label: 'OPAs', href: '/opas', icon: '⚡' },
        { label: 'Preguntas Frecuentes', href: '/faqs', icon: '❓' },
        { label: 'Dependencias', href: '/dependencias', icon: '🏛️' },
        { label: 'Directorio Telefónico', href: '/directorio', icon: '📞' },
      ],
    },
    {
      title: 'Información Institucional',
      links: [
        { label: 'Acerca de Chía', href: '/acerca', icon: '🏙️' },
        { label: 'Organigrama', href: '/organigrama', icon: '📊' },
        { label: 'Plan de Desarrollo', href: '/plan-desarrollo', icon: '📈' },
        { label: 'Transparencia', href: '/transparencia', icon: '🔍' },
        { label: 'Rendición de Cuentas', href: '/rendicion-cuentas', icon: '📋' },
      ],
    },
    {
      title: 'Contacto',
      links: [
        { label: '(601) 123-4567', href: 'tel:+576011234567', icon: '☎️' },
        { label: 'info@chia.gov.co', href: 'mailto:info@chia.gov.co', icon: '✉️' },
        { label: 'Carrera 11 # 17-25', href: 'https://maps.google.com', icon: '📍' },
        { label: 'Chía, Cundinamarca', href: 'https://maps.google.com', icon: '🗺️' },
        { label: 'Lun - Vie: 8:00 AM - 5:00 PM', href: '#', icon: '🕐' },
      ],
    },
    {
      title: 'Síguenos',
      links: [
        { label: 'Facebook', href: 'https://facebook.com/alcaldiachia', icon: '📘', external: true },
        { label: 'Twitter', href: 'https://twitter.com/alcaldiachia', icon: '🐦', external: true },
        { label: 'Instagram', href: 'https://instagram.com/alcaldiachia', icon: '📸', external: true },
        { label: 'YouTube', href: 'https://youtube.com/alcaldiachia', icon: '📺', external: true },
        { label: 'WhatsApp', href: 'https://wa.me/573001234567', icon: '💬', external: true },
      ],
    },
  ]

  const legalLinks = [
    { label: 'Política de Privacidad', href: '/privacidad' },
    { label: 'Términos de Uso', href: '/terminos' },
    { label: 'Política de Cookies', href: '/cookies' },
    { label: 'Accesibilidad', href: '/accesibilidad' },
    { label: 'Mapa del Sitio', href: '/sitemap' },
  ]

  return (
    <footer className={clsx('bg-gray-900 text-white', className)}>
      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4 text-primary-yellow">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm group"
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">
                        {link.icon}
                      </span>
                      <span>{link.label}</span>
                      {link.external && (
                        <span className="text-xs opacity-60">↗</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-4 text-primary-yellow">
              Mantente Informado
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Recibe las últimas noticias y actualizaciones de la Alcaldía de Chía
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-yellow"
              />
              <button
                type="button"
                className="px-6 py-2 bg-primary-yellow text-gray-900 font-semibold rounded-lg hover:bg-primary-yellow-alt transition-colors"
              >
                Suscribirse
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Links */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="container-custom py-4">
          <div className="flex flex-wrap justify-center space-x-6 text-sm">
            {legalLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gray-950 border-t border-gray-700">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🏛️</span>
              </div>
              <div>
                <p className="font-semibold text-white">Alcaldía de Chía</p>
                <p className="text-sm text-gray-400">Portal de Atención Ciudadana</p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                © {currentYear} Alcaldía de Chía. Todos los derechos reservados.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Desarrollado con ❤️ para los ciudadanos de Chía
              </p>
            </div>
          </div>

          {/* Government Compliance */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <div className="flex flex-wrap justify-center items-center space-x-6 text-xs text-gray-500">
              <span>🏛️ Gobierno de Colombia</span>
              <span>🔒 Sitio Seguro</span>
              <span>♿ Accesible WCAG AA</span>
              <span>📱 Responsive Design</span>
              <span>🌐 gov.co</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
