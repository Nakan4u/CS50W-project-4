export function generateEditButton() {
  const button = document.createElement('button');
  button.type = "button";
  button.className = "edit-btn btn btn-secondary float-right";
  button.innerHTML = "Edit";

  return button;
}

export function generate_post(pk, contents) {
  const post = document.createElement('div');
  post.className = "post card";
  post.id = `${pk}`;
  post.innerHTML = `
    <div class="post-body card-body">
      <h5 class="post-title card-title">${contents['author']}</h5>
      <h6 class="card-subtitle mb-2 text-muted">${contents['timestamp']}</h6>
      <p class="card-text">${contents['message']}</p>
      <textarea class="card-text-editor form-control" style="display:none"></textarea>
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
  followButton.className = "button btn btn-primary";
  profile.appendChild(followButton);

  return profile;
}

