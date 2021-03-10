import { getCookie } from './helpers.js';
import { generate_post, generate_profile } from './generators.js';

let pageNumber = 1;
const postsPerPage = 10;
let currentView = 'index';


const csrftoken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', () => {

  document.querySelector('#index-nav-link').addEventListener('click', () => loadView('index'));
  document.querySelector('#btn-next-page').addEventListener('click', onClickNextPageButton);
  document.querySelector('#btn-previous-page').addEventListener('click', onClickPreviousPageButton);

  const followingLink = document.querySelector('#following-nav-link');

  if (followingLink) {
    document.querySelector('#following-nav-link').addEventListener('click', () => loadView('feed'));
  }
  
  const postForm = document.querySelector('#post-form')
  if (postForm) {
    postForm.addEventListener('submit', submit_post);
  }
  loadView('index');
})

function loadPosts(currentView, pageNumber, postsPerPage) {

  // first, remove old posts from the DOM
  document.querySelector('#post-display-div').innerHTML = "";

  // compose url for GET request, conditionals control optionally params
  let url = `/posts?page=${pageNumber}&perPage=${postsPerPage}`;
  if (currentView === 'profile') {
    url = url.concat(`&user=${document.querySelector('#profile-div-title').innerHTML}`);
  }
  if (currentView === 'feed') {
    url = url.concat(`&feed=true`)
  }

  // make GET request to '/posts' route & consume API
  fetch(url)
  .then(response => response.json())
  .then(data => {
    const posts = JSON.parse(data['posts']);
    posts.forEach(post => add_post_to_DOM(post, 'end'));
    document.querySelector('#btn-next-page').style.display = data["has_next_page"] ?
      "block" : "none";
    document.querySelector('#btn-previous-page').style.display = data["has_previous_page"] ?
      "block" : "none";
    document.querySelector('#page-number').innerHTML = `Page ${data["page"]} of ${data["page_count"]}`;
  })
}

function loadView(view) {
  currentView = view;
  pageNumber = 1;

  const profileDiv = document.querySelector('#profile-div-container');
  profileDiv.style.display = (view === 'profile') ? 'block' : 'none';

  const postFormDiv = document.querySelector('#post-form-div');
  postFormDiv.style.display = (view === 'index') ? 'block' : 'none';

  loadPosts(currentView, pageNumber, postsPerPage);
}

function add_post_to_DOM(contents, position = 'end') {
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
    document.querySelector('#post-form-msg').value = "";
  })
}

function onClickPostTitle(contents) {
  // make a GET request to the user profile API route
  fetch(`user/${contents["fields"]["author"]}`)
  .then(response => response.json())
  .then(data => {
    add_profile_to_DOM(data);
    loadView('profile');
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

function onClickNextPageButton(contents) {
  pageNumber++;
  loadPosts(currentView, pageNumber, postsPerPage);
}

function onClickPreviousPageButton(contents) {
  pageNumber--;
  loadPosts(currentView, pageNumber, postsPerPage);
}