import DashboardLayout from '../components/Dashboard/Layout/DashboardLayout.vue'
import OneColumnLayout from '../components/Dashboard/Layout/OneColumnLayout.vue'
import VutifyLayout from '../components/Dashboard/Layout/VutifyLayout.vue'
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
import SolrProductSearch from '../components/Dashboard/Views/SolrProductSearch.vue'
import SolrInspector from '../components/Dashboard/Views/SolrInspector.vue'
import SolrEventQueue from '../components/Dashboard/Views/SolrEventQueue.vue'
import SolrTracking from '../components/Dashboard/Views/SolrTracking.vue'
import SolrLogging from '../components/Dashboard/Views/SolrLogging.vue'
import AttivioInspector from '../components/Dashboard/Views/AttivioInspector.vue'
import RevaSearch from '../components/Dashboard/Views/RevaSearch.vue'
import RevaSolrSearch from '../components/Dashboard/Views/RevaSolrSearch.vue'
import IHFPage from '../components/Dashboard/Views/IHFPage.vue'
// Game
import GameBoard from '../components/Dashboard/Views/GameBoard.vue'
import TeamBoard from '../components/Dashboard/Views/TeamBoard.vue'
// Charts
import ChartBoard from '../components/Dashboard/Views/ChartBoard.vue'

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    redirect: '/solr/solrsearch'
    //redirect: '/reva'
    //redirect: '/admin/overview'
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  // app for vuetify layout
  {
    path: '/vy',
    component: VutifyLayout,
    redirect: '/vy/gameboard',
    // children are nested routes.
    // they will be loaded inside the parent component
    children: [
      {
        path: 'gameboard',
        name: 'Game Board',
        component: GameBoard
      },
      {
        path: 'teamboard',
        name: 'Team Board',
        component: TeamBoard 
      }
    ]
  },
  // app for game board and team board.
  {
    path: '/game',
    component: OneColumnLayout,
    redirect: '/game/gameboard',
    // children are nested routes.
    // they will be loaded inside the parent component
    children: [
      {
        path: 'gameboard',
        name: 'Game Board',
        component: GameBoard
      },
      {
        path: 'teamboard',
        name: 'Team Board',
        component: TeamBoard 
      }
    ]
  },
  // app for reva
  {
    path: '/reva',
    component: OneColumnLayout,
    redirect: '/reva/revasolrsearch',
    children: [
      {
        path: 'ihomefinder',
        name: 'IHF Data',
        component: IHFPage
      },
      {
        path: 'revasearch',
        name: 'Reva Search',
        component: RevaSearch
      },
      {
        path: 'revasolrsearch',
        name: 'Reva Solr Search',
        component: RevaSolrSearch
      },
      {
        path: 'attivioinspector',
        name: 'Attivio Inspector',
        component: AttivioInspector
      }
    ]
  },
  // solr search and inspection.
  {
    path: '/solr',
    component: OneColumnLayout,
    redirect: '/solr/solrsearch',
    children: [
      {
        path: 'solrsearch',
        name: 'Solr Search',
        component: SolrSearch
      },
      {
        path: 'productsearch',
        name: 'Product Search',
        component: SolrProductSearch
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
      }
    ]
  },
  // admin staff
  {
    path: '/admin',
    component: DashboardLayout,
    redirect: '/admin/overview',
    // children are nested routes.
    // they will be loaded inside the parent component
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: Overview
      },
      {
        path: 'chartboard',
        name: 'Chart Board',
        component: ChartBoard
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
        path: 'solrtracking',
        name: 'Solr Tracking',
        component: SolrTracking
      },
      {
        path: 'solrlogging',
        name: 'Solr Logging',
        component: SolrLogging
      },
      {
        path: 'attivioinspector',
        name: 'Attivio Inspector',
        component: AttivioInspector
      },
      {
        path: 'revasearch',
        name: 'Reva Search',
        component: RevaSearch
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
