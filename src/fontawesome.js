// import fontawesome
import { library } from '@fortawesome/fontawesome-svg-core'
// import the icons. 
// it is good pratice to import icons one by one.
import { faList, faChartBar, faUser, faAlignJustify } from '@fortawesome/free-solid-svg-icons'
// add icons.
library.add(faList)
library.add(faChartBar)
library.add(faUser)
library.add(faAlignJustify)

// import icon component
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const FontAwesome = {
  install (Vue) {
    // load the font awesome icon component
    Vue.component('font-awesome-icon', FontAwesomeIcon);
  }
}

export default FontAwesome
