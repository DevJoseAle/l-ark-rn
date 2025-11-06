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
      image: "./assets/Logo_lark.png",
      resizeMode: "contain",
      backgroundColor: "#F8FBFF"
    },
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.devjoseale.lark",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      },
      splash: {
        image: "./assets/Logo_lark.png",
        resizeMode: "contain",
        backgroundColor: "#F8FBFF",
        dark: {
          image: "./assets/Logo_lark.png",
          resizeMode: "contain",
          backgroundColor: "#1E2A36"
        }
      }
    },
    
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.devjoseale.lark",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "lark",
              host: "campaign",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      // ✅ Splash específico para Android
      splash: {
        image: "./assets/Logo_lark.png",
        resizeMode: "contain",
        backgroundColor: "#F8FBFF",
        dark: {
          image: "./assets/Logo_lark.png",
          resizeMode: "contain",
          backgroundColor: "#1E2A36"
        }
      }
    },
    
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      // ✅ Splash para web
      splash: {
        image: "./assets/Logo_lark.png",
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
          // ✅ Plugin usa el mismo logo que la config principal
          image: "./assets/Logo_lark.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#F8FBFF",
          dark: {
            image: "./assets/Logo_lark.png",
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