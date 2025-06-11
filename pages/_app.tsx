import App from 'next/app'
import Router, { useRouter } from 'next/router';
import nprogress from 'nprogress/nprogress.js';

import { SECRET } from 'utils';
import Common from 'context/Common';
import { getTokenData, getUserById } from 'services';

import type { AppProps } from 'next/app'
import { getCookie } from 'cookies-next';
import { SettingsConsumer } from 'components/admin/@core/context/settingsContext';
import ThemeComponent from 'components/admin/@core/theme/ThemeComponent';
import UserLayout from 'components/admin/layouts/UserLayout';
import { NextPage } from 'next';

import 'material-react-toastify/dist/ReactToastify.css';
import 'styles/nprogress.css';
import 'tailwindcss/tailwind.css';
import 'components/admin/@core/styles/libs/global.css';
import 'styles/dark.css';
import 'styles/globals.css';
import { useEffect, useState } from 'react';

Router.events.on('routeChangeStart', nprogress.start);
Router.events.on('routeChangeError', nprogress.done);
Router.events.on('routeChangeComplete', nprogress.done);

type ExtendedAppProps = AppProps & {
  Component: NextPage & {
    getLayout: Function;
  };
}


export default function MyApp({ Component, pageProps }: ExtendedAppProps) {
  const [isServer, SetIsServer] = useState(true);
  const getLayout: any = typeof Component.getLayout == "function" ? Component.getLayout : ((page: any) => <UserLayout>{page}</UserLayout>)

  const router = useRouter()
  const data = router.pathname.split('/')

  useEffect(() => {
    SetIsServer(false);
  }, []);



  return (
    <>

      <Common.provider pageProps={pageProps}>
        {
          data[1] === 'admin' ? (
            <>
              {isServer ? (
                <Component {...pageProps} />
              ) : (
                <SettingsConsumer>
                  {({ settings }) => {
                    return <ThemeComponent settings={settings}>
                      {getLayout(
                        <Common.provider pageProps={pageProps}>
                          <Component {...pageProps} />
                        </Common.provider>)}
                    </ThemeComponent>
                  }}
                </SettingsConsumer>
              )}
            </>
          ) : (
            <Component {...pageProps} />
          )
        }


      </Common.provider>
    </>
  )
}

MyApp.getStaticProps = async (appContext: any) => {
  const appProps: any = await App.getInitialProps(appContext);
  const context = appContext.ctx;
  const token = context?.req ? context.req?.cookies?.[SECRET] || "" : getCookie(SECRET);;
  const data: any = getTokenData(token);
  if (data) {
    const loginUser = await getUserById(data.user.id);
    appProps.pageProps = {
      token: data.token,
      user: loginUser
    };
  }
  appProps.pageProps.isAuthenticated = data ? true : false;

  return { ...appProps }
}
