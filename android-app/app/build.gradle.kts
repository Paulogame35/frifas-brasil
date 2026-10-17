plugins {
    id("com.android.application")
}

android {
    namespace = "br.com.frifasbrasil.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "br.com.frifasbrasil.app"
        minSdk = 23
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.browser:browser:1.8.0")
}
