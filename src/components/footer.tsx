import Link from 'next/link'

export const Footer = () => {
  const socials = [
    {
      name: 'Twitter',
      href: 'https://twitter.com/typper_io',
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/typper-io',
    },
    {
      name: 'GitHub',
      href: 'https://github.com/typper-io',
    },
  ]
  return (
    <div className="relative">
      <div className="border-t border-neutral-100  dark:border-neutral-800 px-8 pt-20 pb-32 relative bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto text-sm text-neutral-500 dark:text-neutral-400 flex sm:flex-row flex-col justify-between items-start ">
          <div>
            <p>
              Build with 💙 by <Link href="https://typper.io">Typper</Link>
            </p>
          </div>
          <div className="grid grid-cols-3 gap-10 items-start mt-10 md:mt-0">
            <div className="flex justify-center space-y-4 flex-col mt-4">
              {socials.map((link) => (
                <Link
                  key={link.name}
                  className="transition-colors text-muted-foreground text-xs sm:text-sm"
                  href={link.href}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-5xl md:text-9xl lg:text-[18rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 dark:from-neutral-950 to-neutral-200 dark:to-neutral-800 inset-x-0">
        CALENDAR AI
      </p>
    </div>
  )
}
