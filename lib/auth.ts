import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signInSchema } from "@/validations/auth";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = signInSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        await connectDB();
        const user = await User.findOne({ email }).select("+passwordHash +authVersion");
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.avatar || null,
          authVersion: user.authVersion ?? 0,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username;
        token.authVersion = (user as any).authVersion ?? 0;
      } else if (token.id) {
        // Password recovery increments authVersion to invalidate every existing JWT.
        await connectDB();
        const currentUser = await User.findById(token.id).select("+authVersion").lean();
        if (!currentUser || (currentUser.authVersion ?? 0) !== Number(token.authVersion ?? 0)) {
          token.id = undefined;
          token.username = undefined;
          token.authVersion = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.id) return { ...session, user: undefined };
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
