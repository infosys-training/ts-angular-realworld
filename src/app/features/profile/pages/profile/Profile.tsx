import { useState, useEffect } from 'react';
import { useParams, Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/auth.context';
import { profileService } from '../../services/profile.service';
import { Profile as ProfileModel } from '../../models/profile.model';
import { Errors } from '../../../../core/models/errors.model';
import { FollowButton } from '../../components/FollowButton';
import { ListErrors } from '../../../../shared/components/ListErrors';
import { defaultImage } from '../../../../shared/utils';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileModel | null>(null);
  const [errors, setErrors] = useState<Errors | null>(null);
  const isUser = user?.username === profile?.username;

  useEffect(() => {
    if (!username) return;
    setProfile(null);
    setErrors(null);

    profileService
      .get(username)
      .then(setProfile)
      .catch(err => {
        setErrors(err.errors ? err : { errors: { error: 'Failed to load profile' } });
      });
  }, [username]);

  const onToggleFollowing = (updated: ProfileModel) => {
    setProfile(updated);
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
                  <img src={defaultImage(profile.image)} className="user-img" />
                  <h4>{profile.username}</h4>
                  <p>{profile.bio ?? ''}</p>
                  {!isUser && <FollowButton profile={profile} onToggle={onToggleFollowing} />}
                  {isUser && (
                    <Link to="/settings" className="btn btn-sm btn-outline-secondary action-btn">
                      <i className="ion-gear-a"></i> Edit Profile Settings
                    </Link>
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

                <Outlet />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
