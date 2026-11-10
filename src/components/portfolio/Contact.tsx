import { FileText, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons'
import { contactIntro, contacts, profile } from '@/content/portfolio'
import { sections } from '@/content/navigation'
import { ui } from '@/content/ui'
import { SectionHeading } from './SectionHeading'
import { Terminal } from './Terminal'
import { useLanguage } from './language'

interface ContactProps {
  onOpenGallery: () => void
}

const linkClass =
  'group flex items-center gap-3 border-b border-on-rust/25 py-4 font-mono text-sm transition-colors hover:text-sand-deep focus-visible:text-sand-deep'

export function Contact({ onOpenGallery }: ContactProps) {
  const { tx } = useLanguage()
  const section = sections[6]

  return (
    <section id="contato" aria-labelledby="contato-title" className="scroll-mt-[38px]">
      <div className="bg-rust text-on-rust">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 md:px-12 md:py-24">
          <SectionHeading
            index="06"
            title={section ? tx(section.label) : 'Contato'}
            id="contato-title"
            tone="on-rust"
            command={`$ ${tx(contactIntro.command)}`}
          />

          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
            <Terminal onOpenGallery={onOpenGallery} />

            <nav aria-label={tx(ui.contact.channels)}>
              <ul>
                <li>
                  <a href={contacts.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <GithubIcon className="size-4" />
                    <span className="flex-1">github</span>
                    <span className="text-on-rust/70">{contacts.githubHandle}</span>
                  </a>
                </li>
                <li>
                  <a href={contacts.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <LinkedinIcon className="size-4" />
                    <span className="flex-1">linkedin</span>
                    <span className="text-on-rust/70">{contacts.linkedinHandle}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${contacts.email}`} className={linkClass}>
                    <Mail className="size-4" aria-hidden="true" />
                    <span className="flex-1">{tx(ui.contact.email)}</span>
                    <span className="truncate text-on-rust/70">{contacts.email}</span>
                  </a>
                </li>
                <li>
                  <a href={profile.cvHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <FileText className="size-4" aria-hidden="true" />
                    <span className="flex-1 uppercase">{tx(profile.cvLabel)}</span>
                    <span className="text-on-rust/70">pdf</span>
                  </a>
                </li>
              </ul>
              <p className="mt-6 text-sm text-on-rust/75">
                {tx(profile.location)} · {tx(profile.availability)}
              </p>
            </nav>
          </div>
        </div>
      </div>
    </section>
  )
}
