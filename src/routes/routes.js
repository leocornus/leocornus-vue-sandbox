import DashboardLayout from '../components/Dashboard/Layout/DashboardLayout.vue'
// GeneralViews
import NotFound from '../components/GeneralViews/NotFoundPage.vue'

import Login from '../components/Dashboard/Views/Login.vue'

// Admin pages
import Overview from '../components/Dashboard/Views/Overview.vue'
import UserProfile from '../components/Dashboard/Views/UserProfile.vue'
import TableList from '../components/Dashboard/Views/TableList.vue'
import Typography from '../components/Dashboard/Views/Typography.vue'
import Icons from '../components/Dashboard/Views/Icons.vue'
import Maps from '../components/Dashboard/Views/Maps.vue'
import Notifications from '../components/Dashboard/Views/Notifications.vue'

// real estate dashboard.
import RealEstate from '../components/Dashboard/Views/RealEstate.vue'
// D3 tryout page.
import D3Tryout from '../components/Dashboard/Views/D3Tryout.vue'
import SPTryout from '../components/Dashboard/Views/SPTryout.vue'
import SolrSearch from '../components/Dashboard/Views/SolrSearch.vue'
import SolrInspector from '../components/Dashboard/Views/SolrInspector.vue'
import SolrEventQueue from '../components/Dashboard/Views/SolrEventQueue.vue'
import AttivioInspector from '../components/Dashboard/Views/AttivioInspector.vue'

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    redirect: '/admin/solrsearch'
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/admin',
    component: DashboardLayout,
    redirect: '/admin/overview',
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: Overview
      },
      {
        path: 'realestate',
        name: 'Real Estate',
        component: RealEstate
      },
      {
        path: 'd3tryout',
        name: 'D3 Tryout',
        component: D3Tryout 
      },
      {
        path: 'sptryout',
        name: 'Sharepoint Tryout',
        component: SPTryout 
      },
      {
        path: 'solrsearch',
        name: 'Solr Search',
        component: SolrSearch
      },
      {
        path: 'solrinspector',
        name: 'Solr Inspector',
        component: SolrInspector
      },
      {
        path: 'solreventqueue',
        name: 'Solr Event Queue',
        component: SolrEventQueue
      },
      {
        path: 'attivioinspector',
        name: 'Attivio Inspector',
        component: AttivioInspector
      },
      {
        path: 'user',
        name: 'User',
        component: UserProfile
      },
      {
        path: 'table-list',
        name: 'Table List',
        component: TableList
      },
      {
        path: 'typography',
        name: 'Typography',
       component: Typography
      },
      {
        path: 'icons',
        name: 'Icons',
        component: Icons
      },
      {
        path: 'maps',
        name: 'Maps',
        component: Maps
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: Notifications
      }
    ]
  },
  { path: '*', component: NotFound }
]

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes
