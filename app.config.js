// app.config.js
console.log("Cargando configuración de Expo...");
export default {
  expo: {
    name: "L-ark",
    slug: "L-ark",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "lark",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/Logo_lark.png",
      resizeMode: "contain",
      backgroundColor: "#F8FBFF"
    },
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.devjoseale.lark",
      // ✅ Universal Links para iOS
      associatedDomains: [
        "applinks:l-ark.app",
        "applinks:www.l-ark.app"
      ],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      },
      splash: {
        image: "./assets/images/Logo_lark.png",
        resizeMode: "contain",
        backgroundColor: "#F8FBFF",
        dark: {
          image: "./assets/images/Logo_lark.png",
          resizeMode: "contain",
          backgroundColor: "#1E2A36"
        }
      }
    },
    
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/icon.png",
        backgroundImage: "./assets/images/icon.png",
        monochromeImage: "./assets/images/icon.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.devjoseale.lark",
      // ✅ Intent Filters actualizados con Universal Links
      intentFilters: [
        // Scheme personalizado (lark://)
        {
          action: "VIEW",
          data: [
            {
              scheme: "lark",
              host: "campaign",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        // ✅ Universal Links (https://)
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "l-ark.app",
              pathPrefix: "/campaign"
            },
            {
              scheme: "https",
              host: "www.l-ark.app",
              pathPrefix: "/campaign"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      splash: {
        image: "./assets/images/Logo_lark.png",
        resizeMode: "contain",
        backgroundColor: "#F8FBFF",
        dark: {
          image: "./assets/images/Logo_lark.png",
          resizeMode: "contain",
          backgroundColor: "#1E2A36"
        }
      }
    },
    
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      splash: {
        image: "./assets/images/Logo_lark.png",
        resizeMode: "contain",
        backgroundColor: "#F8FBFF"
      }
    },
    
    plugins: [
      "expo-router",
      [
        "expo-web-browser",
        {
          experimentalLauncherActivity: true
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/Logo_lark.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#F8FBFF",
          dark: {
            image: "./assets/images/Logo_lark.png",
            backgroundColor: "#1E2A36"
          }
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Necesitamos acceso a tu cámara para verificar tu identidad mediante fotos de tu documento y selfie",
          microphonePermission: false
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Necesitamos acceso a tus fotos para subir imágenes a campañas y la Bóveda"
        }
      ],
      [
        "expo-document-picker",
        {
          iCloudContainerEnvironment: "Production"
        }
      ],
      [
        "expo-local-authentication",
        {
          faceIDPermission: "Usamos Face ID para proteger tu Bóveda"
        }
      ],
      [
        "expo-iap",
        {
          appleTeamId: "G2VZD86Z48"
        }
      ]
    ],
    
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      router: {},
      eas: {
        projectId: "476ac01a-5600-4fa9-9c91-1689daa93e04"
      }
    }
  }
};