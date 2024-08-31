import { cn } from '@/lib/utils'
import { Heading } from '@/components/heading'
import { Subheading } from '@/components/subheading'
import { SkeletonOne } from '@/components/skeletons/first'
import { SkeletonTwo } from '@/components/skeletons/second'
import { GridLineHorizontal, GridLineVertical } from '@/components/grid-lines'

export const Features = () => {
  const features = [
    {
      title: 'Create events using NL',
      description:
        'Just say "Alignment friend@best.com tomorrow" and the calendar will take the rest.',
      skeleton: <SkeletonOne />,
      className:
        'col-span-1 md:col-span-4 border-b border-r dark:border-neutral-800',
    },
    {
      title: 'Complete assistant ChatGPT Powered',
      description:
        'Our assistant is designed to help you with everything from creating events to managing your calendar.',
      skeleton: <SkeletonTwo />,
      className: 'border-b col-span-1 md:col-span-2 dark:border-neutral-800',
    },
    {
      title: 'Automatically re-schedule events (Coming soon)',
      description:
        "If you're busy, we'll automatically re-schedule your events to a time that works for you.",
      className: 'col-span-1 md:col-span-3 border-r dark:border-neutral-800',
    },
    {
      title: 'Share your calendar with anyone (Coming soon)',
      description:
        'Create a shareable link to your calendar and share it with anyone you want.',
      className: 'col-span-1 md:col-span-3',
    },
  ]
  return (
    <div className="relative z-20 py-10 md:py-40">
      <Heading as="h2">Packed with thousands of features</Heading>
      <Subheading className="text-center">
        From schedule events using natural language to use a entire assistant
        with capabilities of create, re-schedule and cancel events.
      </Subheading>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-6 mt-12">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className=" h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
        <GridLineHorizontal
          style={{
            top: 0,
            left: '-10%',
            width: '120%',
          }}
        />

        <GridLineHorizontal
          style={{
            bottom: 0,
            left: '-10%',
            width: '120%',
          }}
        />

        <GridLineVertical
          style={{
            top: '-10%',
            right: 0,
            height: '120%',
          }}
        />
        <GridLineVertical
          style={{
            top: '-10%',
            left: 0,
            height: '120%',
          }}
        />
      </div>
    </div>
  )
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  )
}

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Heading as="h3" size="sm" className="text-left">
      {children}
    </Heading>
  )
}

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Subheading className="text-left max-w-sm mx-0 md:text-sm my-2">
      {children}
    </Subheading>
  )
}
