package br.com.gees.leiria

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView // <- adicione essa importação
import android.os.Bundle

class MainActivity : ReactActivity() {
  override fun getMainComponentName(): String = "fidelidadeappleiria"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return object : ReactActivityDelegate(this, mainComponentName) {
      override fun createRootView(): ReactRootView {
        return RNGestureHandlerEnabledRootView(this@MainActivity)
      }
    }
  }
}
