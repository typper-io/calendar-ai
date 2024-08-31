import { Background } from '@/components/background'
import { Container } from '@/components/container'
import { CTA } from '@/components/cta'
import { Features } from '@/components/features'
import { Hero } from '@/components/hero'

export default function Home() {
  return (
    <div className="relative overflow-hidden ">
      <Background />
      <Container className="flex min-h-screen flex-col items-center justify-between ">
        <Hero />
        <Features />
      </Container>
      <div className="relative">
        <Background />
        <CTA />
      </div>
    </div>
  )
}
