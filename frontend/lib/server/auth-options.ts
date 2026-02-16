import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { serverEnv } from "./env";
import { prisma } from "./prisma";

function isAdminRole(role: { name: string; isSystem: boolean } | null | undefined) {
  const roleName = (role?.name || "").toLowerCase();
  return (
    !!role?.isSystem ||
    roleName === "administrator" ||
    roleName === "admin" ||
    roleName === "owner"
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase() || "";
        const password = credentials?.password || "";
        if (!email || !password) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
          include: {
            role: true,
          },
        });
        if (!user || !user.isActive) return null;

        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name || "",
          is_admin: isAdminRole(user.role),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = String(user.id);
        token.email = user.email || "";
        token.name = user.name || "";
        token.is_admin = Boolean((user as { is_admin?: boolean }).is_admin);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.sub || "");
        session.user.email = String(token.email || "");
        session.user.name = String(token.name || "");
        session.user.is_admin = Boolean(token.is_admin);
      }
      return session;
    },
  },
  secret: serverEnv.AUTH_SECRET,
};
