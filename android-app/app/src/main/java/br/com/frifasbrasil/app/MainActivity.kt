package br.com.frifasbrasil.app

import android.app.Activity
import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.browser.customtabs.CustomTabsIntent

class MainActivity : Activity() {
    private val portalUrl = "https://frifasbrasil.com.br/"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.rgb(9, 10, 12)
        window.navigationBarColor = Color.rgb(9, 10, 12)
        window.decorView.systemUiVisibility = 0

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(dp(28), dp(32), dp(28), dp(32))
            setBackgroundColor(Color.rgb(9, 10, 12))
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        val brand = TextView(this).apply {
            text = getString(R.string.home_title)
            textSize = 30f
            setTextColor(Color.WHITE)
            typeface = Typeface.create("sans-serif-black", Typeface.BOLD)
            gravity = Gravity.CENTER
            letterSpacing = 0.04f
        }

        val accent = TextView(this).apply {
            text = "NOTÍCIAS • FREE FIRE • COMUNIDADE"
            textSize = 11f
            setTextColor(Color.rgb(229, 57, 53))
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
            gravity = Gravity.CENTER
            letterSpacing = 0.08f
        }

        val subtitle = TextView(this).apply {
            text = getString(R.string.home_subtitle)
            textSize = 16f
            setTextColor(Color.rgb(205, 208, 214))
            gravity = Gravity.CENTER
            setLineSpacing(dp(4).toFloat(), 1.0f)
        }

        val openButton = Button(this).apply {
            text = getString(R.string.open_site)
            textSize = 16f
            isAllCaps = false
            setTextColor(Color.WHITE)
            setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(229, 57, 53)))
            setOnClickListener { openPortal() }
        }

        val note = TextView(this).apply {
            text = getString(R.string.app_note)
            textSize = 12f
            setTextColor(Color.rgb(150, 155, 164))
            gravity = Gravity.CENTER
            setLineSpacing(dp(3).toFloat(), 1.0f)
        }

        root.addView(brand, centeredParams(bottom = 8))
        root.addView(accent, centeredParams(bottom = 24))
        root.addView(subtitle, centeredParams(bottom = 28))
        root.addView(openButton, centeredParams(bottom = 20))
        root.addView(note, centeredParams())
        setContentView(root)
    }

    private fun openPortal() {
        val customTabsIntent = CustomTabsIntent.Builder()
            .setShowTitle(true)
            .setToolbarColor(Color.rgb(9, 10, 12))
            .setUrlBarHidingEnabled(true)
            .build()

        customTabsIntent.launchUrl(this, Uri.parse(portalUrl))
    }

    private fun centeredParams(bottom: Int = 0): LinearLayout.LayoutParams {
        return LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply {
            bottomMargin = dp(bottom)
        }
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()
}
