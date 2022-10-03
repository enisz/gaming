import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { ThemeContextProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { UserContextProvider } from './context/UserContext';
import AuthLayout from './layouts/AuthLayout';
import CollectionPage from './pages/CollectionPage';
import GamePage from './pages/GamePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MarketplacePage from './pages/MarketplacePage';
import MessagesPage from './pages/MessagesPage';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import ProtectedLayout from './layouts/ProtectedLayout';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import WishlistPage from './pages/WishlistPage';

function App() {  
  return (
    <BrowserRouter>
      <ThemeContextProvider>
        <UserContextProvider>
          <Switch>
            <Redirect from="/" to="/auth/login" exact />
            <Route path="/auth">
              <AuthLayout>
                <Switch>
                  {/* { getUser() !== null && <Redirect from="/auth" to="/home" />} */}
                  <Route path="/auth/login" exact component={LoginPage} />
                  <Route path="/auth/register" exact component={RegisterPage} />
                  <Redirect from="/auth" to="/auth/login" exact />
                </Switch>
              </AuthLayout>
            </Route>
            <Route path="/">
              <ProtectedLayout>
                <Switch>
                  <PrivateRoute path="/home" exact component={HomePage} />
                  <PrivateRoute path="/search" exact component={SearchPage} />
                  <PrivateRoute path="/settings" component={SettingsPage} />
                  <PrivateRoute path="/game/:id/:slug" exact component={GamePage} />
                  <PrivateRoute path="/users" exact component={UsersPage} />
                  <PrivateRoute path="/users/:username" exact component={ProfilePage} />
                  <PrivateRoute path="/marketplace" exact component={MarketplacePage} />
                  <PrivateRoute path="/messages" exact component={MessagesPage} />
                  <PrivateRoute path="/collection" exact component={CollectionPage} />
                  <PrivateRoute path="/wishlist" exact component={WishlistPage} />
                  <Redirect to="/home" />
                </Switch>
              </ProtectedLayout>
            </Route>
          </Switch>
        </UserContextProvider> 
      </ThemeContextProvider>
      <Toaster gutter={0} toastOptions={{ duration: 5000, position: "bottom-right", style: { boxShadow: "none", backgroundColor: "transparent" }}} />
    </BrowserRouter>
  ); 
}

export default App;
