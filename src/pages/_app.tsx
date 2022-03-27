import { AppProps } from "next/app";
import { Header } from "../components/Header";
import { SessionProvider as NextAuthProvaider } from "next-auth/react";
import "../styles/global.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextAuthProvaider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </NextAuthProvaider>
  );
}

export default MyApp;
