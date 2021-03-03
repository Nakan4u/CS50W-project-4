export function generate_post(contents) {
  const post = document.createElement('div');
  post.className = "card";
  post.innerHTML = `
    <div class="card">
      <div class="post card-body">
        <h5 class="post-title card-title">${contents['author']}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${contents['timestamp']}</h6>
        <div class="card-text">${contents['message']}</div>
      </div>
    </div>
  `
  return post;
}

export function generate_profile(contents) {
  const profile = document.createElement('div');
  profile.innerHTML = `
    <h3 id="profile-div-title">${contents['username']}</h3>
    <div>${contents['post-count']} Posts</div>
    <div>Following ${contents['following']}</div>
    <div>Followed by ${contents['followed-by']}</div>
  `;

  const followButton = document.createElement('button');
  followButton.innerHTML = contents['is_followed'] ? 'Unfollow' : 'Follow';
  followButton.id = "follow-button";
  followButton.className = "button btn-primary";
  profile.appendChild(followButton);

  return profile;
}

