import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profile.service';
import { useAuth } from '../../../core/auth/AuthProvider';
import type { Profile } from '../models/profile.model';

export function FollowButton({ profile, onToggle }: { profile: Profile; onToggle: (profile: Profile) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = profile.following
        ? await profileService.unfollow(profile.username)
        : await profileService.follow(profile.username);
      onToggle(updated);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      className={`btn btn-sm action-btn ${isSubmitting ? 'disabled' : ''} ${
        profile.following ? 'btn-secondary' : 'btn-outline-secondary'
      }`}
      onClick={handleClick}
      disabled={isSubmitting}
    >
      <i className="ion-plus-round"></i>
      &nbsp;
      {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
    </button>
  );
}
