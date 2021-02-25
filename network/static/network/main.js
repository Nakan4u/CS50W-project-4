import { getCookie } from './helpers.js';
import { generate_post, generate_profile } from './generators.js';

let post_counter = 0;
const posts_per_request = 20;
const csrftoken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#index-nav-link').addEventListener('click', () => {
    load_view('index');
  })

  const postForm = document.querySelector('#post-form')
  if (postForm) {
    postForm.addEventListener('submit', submit_post);
  }

  load_view('index');
})

function load_posts(user = null, feed = false) {
  const start = post_counter;
  const end = post_counter + posts_per_request;
  post_counter = end + 1;

  let url = `/posts?start=${start}&end=${end}`;

  if (user) {
    url = url.concat(`&user=${user}`);
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

  const profile_div = document.querySelector('#profile-div');
  profile_div.style.display = view === 'profile' ? 'block' : 'none';

  const post_form_div = document.querySelector('#post-form-div');
  post_form_div.style.display = view === 'index' ? 'block' : 'none';

  if (view === 'index') {
    post_form_div.style.display = 'block';
    profile_div.style.display = 'none';
    load_posts();
  } else if (view === 'profile') {
    post_form_div.style.display = 'none';
    profile_div.style.display = 'block';
    load_posts(document.querySelector('#profile-div-title').innerHTML);
  }
}


function add_post_to_DOM(contents, position = 'end') {
  post_counter++;
  const post = generate_post(contents["fields"]);

  // add listener to title (loads profile on click)
  const title = post.querySelector(".post-title");
  title.addEventListener('click', () => {
    fetch(`user/${contents["fields"]["author"]}`)
    .then(response => response.json())
    .then(data => {
      document.querySelector('#profile-div').innerHTML = generate_profile(data);
      load_view('profile');
    })
  })
  
  // append/prepend post to DOM
  if (position === 'end') {
    document.querySelector('#post-display-div').append(wrapper);
  } else {
    document.querySelector('#post-display-div').prepend(wrapper);
  }
}

function submit_post(event) {
  event.preventDefault();
  
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
  // add post to DOM
  .then(response => response.json())
  .then(post => {
    add_post_to_DOM(post, 'front');
  })
}