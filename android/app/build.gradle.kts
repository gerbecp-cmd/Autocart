plugins { id("com.android.application") }

val configuredApiUrl = (project.findProperty("AUTOCART_API_URL") as String?) ?: ""
val configuredApplicationId = (project.findProperty("AUTOCART_APPLICATION_ID") as String?) ?: "com.autocart.app"
val configuredVersionCode = (project.findProperty("AUTOCART_VERSION_CODE") as String?)?.toIntOrNull() ?: 340
val configuredVersionName = (project.findProperty("AUTOCART_VERSION_NAME") as String?) ?: "3.4.0"

android {
    namespace = "com.autocart.app"
    compileSdk = 36
    defaultConfig {
        applicationId = configuredApplicationId
        minSdk = 26
        targetSdk = 36
        versionCode = configuredVersionCode
        versionName = configuredVersionName
        buildConfigField("String", "AUTOCART_API_URL", "\"${configuredApiUrl.replace("\\", "\\\\").replace("\"", "\\\"")}\"")
    }
    buildFeatures { buildConfig = true }
    sourceSets.getByName("main").assets.srcDir("../../web")
    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.16.0")
}