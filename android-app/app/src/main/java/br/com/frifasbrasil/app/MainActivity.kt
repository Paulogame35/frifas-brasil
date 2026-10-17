package br.com.frifasbrasil.app

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class MainActivity : Activity() {
    private val portalUrl = "https://frifasbrasil.com.br/"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = LinearLayout(this)
        root.orientation = LinearLayout.VERTICAL
        root.gravity = Gravity.CENTER
        root.setPadding(32, 32, 32, 32)
        root.setBackgroundColor(Color.rgb(9, 10, 12))

        val title = TextView(this)
        title.text = getString(R.string.home_title)
        title.textSize = 28f
        title.setTextColor(Color.WHITE)
        title.gravity = Gravity.CENTER

        val subtitle = TextView(this)
        subtitle.text = getString(R.string.home_subtitle)
        subtitle.textSize = 16f
        subtitle.setTextColor(Color.LTGRAY)
        subtitle.gravity = Gravity.CENTER

        val openButton = Button(this)
        openButton.text = getString(R.string.open_site)
        openButton.isAllCaps = false
        openButton.setOnClickListener {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(portalUrl))
            startActivity(intent)
        }

        root.addView(title, centeredParams(16))
        root.addView(subtitle, centeredParams(24))
        root.addView(openButton, centeredParams(0))

        setContentView(root)
    }

    private fun centeredParams(bottom: Int): LinearLayout.LayoutParams {
        return LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply {
            bottomMargin = bottom
        }
    }
}
