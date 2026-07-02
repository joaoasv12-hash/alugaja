import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma/enums";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { profile: true },
        });

        if (!user || !user.passwordHash) return null;

        const senhaCorreta = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!senhaCorreta) return null;

        if (user.status === "SUSPENDED" || user.status === "BANNED") {
          throw new Error("Conta suspensa ou banida.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.name ?? user.email,
          image: user.profile?.avatarUrl ?? null,
          roles: user.roles,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as { roles?: Role[] }).roles ?? [Role.TENANT];
      }

      if (trigger === "update" && session?.roles) {
        token.roles = session.roles;
      }

      // Sincroniza papéis do banco a cada refresh do token
      if (token.id && !user) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { roles: true, status: true },
        });
        if (dbUser) token.roles = dbUser.roles;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as Role[];
      }
      return session;
    },
    async signIn({ user, account }) {
      // Para OAuth (Google), cria perfil se não existir
      if (account?.provider === "google" && user.id) {
        const existingProfile = await db.profile.findUnique({
          where: { userId: user.id },
        });
        if (!existingProfile && user.name) {
          await db.profile.create({
            data: {
              userId: user.id,
              name: user.name,
              avatarUrl: user.image ?? null,
            },
          });
        }

        // Promove automaticamente a SUPER_ADMIN se for o e-mail designado
        if (user.email === process.env.SUPER_ADMIN_EMAIL) {
          await db.user.update({
            where: { id: user.id },
            data: { roles: [Role.SUPER_ADMIN, Role.LANDLORD, Role.TENANT] },
          });
        }
      }
      return true;
    },
  },
};
