let post_counter = 0;
const posts_per_request = 20;

document.addEventListener('DOMContentLoaded', () => {
  const postForm = document.querySelector('#post-form')
  if (postForm) {
    postForm.addEventListener('submit', submit_post);
  }
  load_posts();
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

function load_posts() {
  const start = post_counter;
  const end = post_counter + posts_per_request;
  counter = end + 1;

  fetch(`/posts?start=${start}&end=${end}`)
  .then(response => response.json())
  .then(data => {
    data.forEach(post => add_post_to_DOM(post, 'end'));
  })
}

function add_post_to_DOM(contents, position = 'end') {
  const post = document.createElement('div');
  const title = document.createElement('h5');
  const timestamp = document.createElement('h6');
  const body = document.createElement('div');
  
  post.className = 'post card-body';

  title.className = 'card-title';
  title.innerHTML = contents["fields"]["author"];
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
  console.log(position)
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
    console.log(post)
    add_post_to_DOM(post, 'front');
  })
}