import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useFocusVisible } from "@react-aria/interactions";
import { serviceWorkerFile } from "virtual:vite-plugin-service-worker";
import * as Sentry from "@sentry/react";
import { Provider as JotaiProvider } from "jotai";

import "./App.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/noto-serif";

import { HydrogenRootView } from "./views/HydrogenRootView";
import { SplashScreen } from "./views/components/splash-screen/SplashScreen";
import { PageNotFound } from "./views/components/page-not-found/PageNotFound";
import { LoadingScreen } from "./views/components/loading-screen/LoadingScreen";

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

window.onload = () => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register(serviceWorkerFile, { type: "module" }).then((reg) => {
      console.log("Service worker is registered.");
    });
  }
};

function FocusOutlineManager() {
  const { isFocusVisible } = useFocusVisible();
  useEffect(() => {
    document.body.style.setProperty("--focus-outline", isFocusVisible ? "var(--tc-surface) solid 2px" : "none");
  }, [isFocusVisible]);
  return <></>;
}

const LandingPage = lazy(() => import("./site/LandingPage"));
const PreviewBlog = lazy(() => import("./site/PreviewBlog"));
const LoginView = lazy(() => import("./views/login/LoginView"));
const GLTFViewer = lazy(() => import("./views/gltf-viewer/GLTFViewer"));
const AssetPipeline = lazy(() => import("./views/asset-pipeline/AssetPipeline"));
const SessionView = lazy(() => import("./views/session/SessionView"));
const WorldRootView = lazy(() => import("./views/session/world/WorldRootView"));
const MainMenuRootView = lazy(() => import("./views/session/world/MainMenuRootView"));

export function App() {
  return (
    <JotaiProvider>
      <FocusOutlineManager />
      <SentryRoutes>
        <Route element={<HydrogenRootView />}>
          <Route
            path="/landing"
            element={
              <Suspense fallback={<SplashScreen />}>
                <LandingPage />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <LoginView />
              </Suspense>
            }
          />
          <Route
            element={
              <Suspense fallback={<LoadingScreen />}>
                <SessionView />
              </Suspense>
            }
          >
            {/* enter world by id */}
            <Route
              path="world/:worldId"
              element={
                <Suspense fallback={<></>}>
                  <WorldRootView />
                </Suspense>
              }
            />
            {/* enter world by alias */}
            <Route
              path="world/"
              element={
                <Suspense fallback={<></>}>
                  <WorldRootView />
                </Suspense>
              }
            />
            <Route
              path="/"
              element={
                <Suspense fallback={<></>}>
                  <MainMenuRootView />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/scene-preview"
            element={
              <Suspense fallback={<></>}>
                <GLTFViewer />
              </Suspense>
            }
          />
        </Route>
        <Route
          path="/preview"
          element={
            <Suspense fallback={<SplashScreen />}>
              <PreviewBlog />
            </Suspense>
          }
        />
        <Route
          path="/viewer"
          element={
            <Suspense fallback={<SplashScreen />}>
              <GLTFViewer />
            </Suspense>
          }
        />
        <Route
          path="/pipeline"
          element={
            <Suspense fallback={<SplashScreen />}>
              <AssetPipeline />
            </Suspense>
          }
        />
        <Route path="*" element={<PageNotFound />} />
      </SentryRoutes>
    </JotaiProvider>
  );
}
