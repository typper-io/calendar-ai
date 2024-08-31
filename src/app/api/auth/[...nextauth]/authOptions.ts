import { AuthOptions, TokenSet, User } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'

const isDev = process.env.NODE_ENV === 'development'
const domain = isDev ? 'localhost' : '' // TODO add domain

interface ExtendedToken extends JWT {
  accessToken: string
  accessTokenExpires: number
  refreshToken: string
  user: User
  error?: string
}

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 40000,
      },
      authorization: {
        params: {
          scope:
            'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }): Promise<ExtendedToken> {
      if (account && user) {
        return {
          accessToken: account.access_token!,
          accessTokenExpires: Date.now() + Number(account.expires_in)! * 1000,
          refreshToken: account.refresh_token!,
          user,
        }
      }

      if (Date.now() < (token as ExtendedToken).accessTokenExpires) {
        return token as ExtendedToken
      }

      return refreshAccessToken(token as ExtendedToken)
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedToken
      return {
        ...session,
        user: extendedToken.user,
        accessToken: extendedToken.accessToken,
        error: extendedToken.error,
      }
    },
  },
  cookies: {
    ...(!isDev && {
      sessionToken: {
        name: '__Secure-next-auth.session-token',
        options: {
          httpOnly: true,
          sameSite: 'none',
          path: '/',
          domain,
          secure: true,
        },
      },
    }),
  },
}

async function refreshAccessToken(
  token: ExtendedToken,
): Promise<ExtendedToken> {
  try {
    const url =
      'https://oauth2.googleapis.com/token?' +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      })

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })

    const refreshedTokens: TokenSet = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token!,
      accessTokenExpires:
        Date.now() + Number(refreshedTokens.expires_in)! * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

export default authOptions
