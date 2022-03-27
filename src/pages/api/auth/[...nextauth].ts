import { fauna } from "../../../services/fauna";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { query } from "faunadb";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const { email } = user;
      await fauna.query(
        query.Create(query.Collection("users"), { date: { email } })
      );
      return true;
    },
  },
});
