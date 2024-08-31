'use client'

import Link from 'next/link'
import { IconBrandGoogleFilled } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div>
      <div className="flex items-center w-full justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-10">
            <div className="mt-10">
              <div className="mt-6 w-full flex items-center justify-center">
                <Button
                  onClick={() =>
                    signIn('google', {
                      callbackUrl: '/app',
                    })
                  }
                  className="w-full py-1.5 gap-2 items-center"
                >
                  <IconBrandGoogleFilled className="h-5 w-5" />
                  <span className="text-sm font-semibold leading-6">
                    Google
                  </span>
                </Button>
              </div>

              <p className="text-muted-foreground text-sm text-center mt-8">
                By clicking on sign in, you agree to our{' '}
                <Link href="#" className="text-muted-foreground/80">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-muted-foreground/80">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
