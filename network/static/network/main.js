let post_counter = 0;
const posts_per_request = 100;

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

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

const csrftoken = getCookie('csrftoken');

function load_posts(user = null, feed = false) {
  const start = post_counter;
  const end = post_counter + posts_per_request;
  counter = end + 1;

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
    console.log(document.querySelector('#profile-div-title').innerHTML);
    load_posts(document.querySelector('#profile-div-title').innerHTML);
  }
}


function add_post_to_DOM(contents, position = 'end') {
  const post = document.createElement('div');
  
  const timestamp = document.createElement('h6');
  const body = document.createElement('div');
  
  post.className = 'post card-body';

  // Card title
  const title = document.createElement('h5');
  title.className = 'card-title';
  title.innerHTML = contents["fields"]["author"];
  title.addEventListener('click', () => {
    fetch(`user/${title.innerHTML}`)
    .then(() => {
      document.querySelector('#profile-div-title').innerHTML = contents["fields"]["author"];
      load_view('profile');
    })
  })
  post.appendChild(title);
  
  timestamp.className = 'card-subtitle mb-2 text-muted';
  timestamp.innerHTML = contents["fields"]["timestamp"];
  post.appendChild(timestamp);

  body.className = 'card-text';
  body.innerHTML = contents["fields"]["message"];
  post.appendChild(body);

  const wrapper = document.createElement('div');
  wrapper.className = 'card';
  wrapper.appendChild(post);

  if (position === 'end') {
    document.querySelector('#post-display-div').append(wrapper);
  } else {
    document.querySelector('#post-display-div').prepend(wrapper);
  }
  counter++;
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
  .then(response => response.json())
  .then(post => {
    add_post_to_DOM(post, 'front');
  })
}