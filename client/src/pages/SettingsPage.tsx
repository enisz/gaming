import { useEffect } from 'react';
import { Switch, NavLink, Route, Redirect } from 'react-router-dom';
import useSiteHeaderContext from '../hooks/useSiteHeaderContext';
import useUserContext from '../hooks/useUserContext';
import SettingsPlatformsPage from './settings/SettingsPlatformsPage';
import SettingsProfilePage from './settings/SettingsProfilePage';
import SettingsSecurityPage from './settings/SettingsSecurityPage';

export default function SettingsPage(): JSX.Element {
    const { user } = useUserContext();
    const { setBg, setOverlay, setSize } = useSiteHeaderContext();

    useEffect(
        () => {
            setBg();
            setOverlay();
            setSize();
        }
    );

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-3 col-12">
                    <div className="card shadow mb-4">
                        <div className="card-body text-center">
                            <img src="/img/avatar.png" alt={user.unm} className="mb-3 side-panel-avatar rounded-circle border border-3 shadow-sm img-fluid" />
                            <h5 className="card-title">{user.unm}</h5>
                        </div>
                        <div className="list-group list-group-flush">
                            <NavLink to="/settings/profile" className="list-group-item list-group-item-action">
                                <i className="fas fa-user-circle fa-fw me-2"></i>
                                Profile
                            </NavLink>
                            <NavLink to="/settings/security" className="list-group-item list-group-item-action">
                                <i className="fas fa-shield-alt fa-fw me-2"></i>
                                Security
                            </NavLink>
                            <NavLink to="/settings/platforms" className="list-group-item list-group-item-action">
                                <i className="fas fa-laptop fa-fw me-2"></i>
                                Platforms
                            </NavLink>
                        </div>
                    </div>
                </div>

                <div className="col-md-9 col-12">
                    <Switch>
                        <Route path="/settings/profile" exact component={SettingsProfilePage} />
                        <Route path="/settings/security" exact component={SettingsSecurityPage} />
                        <Route path="/settings/platforms" exact component={SettingsPlatformsPage} />
                        <Redirect from="/settings" to="/settings/profile" exact />
                    </Switch>
                </div>
            </div>
        </div>
    );
}