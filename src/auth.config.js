/**
 * Edge-compatible auth configuration — no Node.js-only imports.
 * Used by middleware.js to validate JWT sessions without touching the database.
 */
const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/register');

      if (!isLoggedIn && !isAuthPage) return false;
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id;
      return session;
    },
  },
};

export default authConfig;
