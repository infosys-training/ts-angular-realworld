import { useState, useEffect } from 'react';
import { useParams, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthProvider';
import { profileService } from '../services/profile.service';
import { FollowButton } from '../components/FollowButton';
import { ListErrors } from '../../../shared/components/ListErrors';
import { defaultImage } from '../../../shared/utils';
import type { Profile } from '../models/profile.model';
import type { Errors } from '../../../core/models/errors.model';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [errors, setErrors] = useState<Errors | null>(null);

  const isUser = profile?.username === user?.username;

  useEffect(() => {
    if (!username) return;

    profileService
      .get(username)
      .then(p => setProfile(p))
      .catch(err => {
        setErrors(err.errors || { errors: { error: 'Failed to load profile' } });
      });
  }, [username]);

  const onToggleFollowing = (p: Profile) => {
    setProfile(p);
  };

  return (
    <div className="profile-page">
      {errors && (
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <ListErrors errors={errors} />
            </div>
          </div>
        </div>
      )}
      {profile && (
        <>
          <div className="user-info">
            <div className="container">
              <div className="row">
                <div className="col-xs-12 col-md-10 offset-md-1">
                  <img src={defaultImage(profile.image)} className="user-img" alt="" />
                  <h4>{profile.username}</h4>
                  <p>{profile.bio ?? ''}</p>
                  {!isUser && <FollowButton profile={profile} onToggle={onToggleFollowing} />}
                  {isUser && (
                    <NavLink to="/settings" className="btn btn-sm btn-outline-secondary action-btn">
                      <i className="ion-gear-a"></i> Edit Profile Settings
                    </NavLink>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-md-10 offset-md-1">
                <div className="articles-toggle">
                  <ul className="nav nav-pills outline-active">
                    <li className="nav-item">
                      <NavLink className="nav-link" to={`/profile/${profile.username}`} end>
                        My Posts
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to={`/profile/${profile.username}/favorites`} end>
                        Favorited Posts
                      </NavLink>
                    </li>
                  </ul>
                </div>

                <Outlet context={{ username: profile.username }} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
