import { getCookie } from './helpers.js';
import { generate_post, generate_profile } from './generators.js';

let post_counter = 0;
const posts_per_request = 20;
const csrftoken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', () => {

  document.querySelector('#index-nav-link').addEventListener('click', () => load_view('index'));

  const followingLink = document.querySelector('#following-nav-link');

  if (followingLink) {
    document.querySelector('#following-nav-link').addEventListener('click', () => load_view('feed'));
  }
  
  const postForm = document.querySelector('#post-form')
  if (postForm) {
    postForm.addEventListener('submit', submit_post);
  }

  load_view('index');
})

function loadPosts(user = null, feed = false) {
  const start = post_counter;
  const end = post_counter + posts_per_request;
  post_counter = end + 1;

  let url = `/posts?start=${start}&end=${end}`;

  if (user) {
    url = url.concat(`&user=${user}`);
  }

  if (feed) {
    url = url.concat(`&feed=true`)
  }

  fetch(url)
  .then(response => response.json())
  .then(data => {
    data.forEach(post => add_post_to_DOM(post, 'end'));
  })
}

function load_view(view) {
  document.querySelector('#post-display-div').innerHTML = "";
  post_counter = 0;

  const profile_div = document.querySelector('#profile-div-container');
  profile_div.style.display = view === 'profile' ? 'block' : 'none';

  const post_form_div = document.querySelector('#post-form-div');
  post_form_div.style.display = view === 'index' || view === 'feed' ? 'block' : 'none';

  if (view === 'index') {
    post_form_div.style.display = 'block';
    profile_div.style.display = 'none';
    loadPosts();
  } else if (view === 'profile') {
    post_form_div.style.display = 'none';
    profile_div.style.display = 'block';

    const username = document.querySelector('#profile-div-title').innerHTML;

    loadPosts(username);
  } else if (view ===  'feed') {
    post_form_div.style.display = 'none';
    profile_div.style.display = 'none';
    loadPosts(null, "feed");
  } 
}

function add_post_to_DOM(contents, position = 'end') {
  post_counter++;
  const post = generate_post(contents["fields"]);

  // add listener to title (loads profile on click)
  const title = post.querySelector(".post-title");
  title.addEventListener('click', () => onClickPostTitle(contents));
  
  // append/prepend post to DOM
  if (position === 'end') {
    document.querySelector('#post-display-div').append(post);
  } else {
    document.querySelector('#post-display-div').prepend(post);
  }
}

function add_profile_to_DOM(contents) {

  const profile = generate_profile(contents);
  
  // add listener to follow button (follows/unfollows on click)
  const followButton = profile.querySelector("#follow-button")
  followButton.addEventListener('click', () => onClickFollowButton(contents))

  // replace old profile HTML with new
  document.querySelector("#profile-div-container").innerHTML = "";
  document.querySelector("#profile-div-container").appendChild(profile);
}

function submit_post(event) {
  event.preventDefault();
  
  // create POST request using form data
  fetch('/submit_post', {
    method: 'POST',
    credentials: 'same-origin',
    headers:{
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRFToken' : csrftoken,
    },
    body: JSON.stringify({
      'message': document.querySelector('#post-form-msg').value
    })
  })

  // API response contains the new post - add it to the DOM
  .then(response => response.json())
  .then(post => {
    add_post_to_DOM(post, 'front');
  })
}

function onClickPostTitle(contents) {
  // make a GET request to the user profile API route
  fetch(`user/${contents["fields"]["author"]}`)
  .then(response => response.json())
  .then(data => {
    add_profile_to_DOM(data);
    load_view('profile');
  })
}

function onClickFollowButton(contents) {
  // make a GET request to the follow API route
  fetch(`user/${contents['username']}/follow`)

  // use JSON response to re-generate profile from new data in DB
  .then(response => response.json())
  .then(data => {
    add_profile_to_DOM(data);
  })
}