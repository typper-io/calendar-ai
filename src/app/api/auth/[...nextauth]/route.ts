import authOptions from '@/app/api/auth/[...nextauth]/authOptions'

import nextAuth from 'next-auth'

const handler = nextAuth(authOptions)

export { handler as GET, handler as POST }
