// https://caniuse.com/#feat=fileapi
// https://caniuse.com/#feat=url (no IE 11?)
// https://caniuse.com/#feat=bloburls

// Check list:
// - [x] progress
// - [x] cancellation
// - [-] metadata (location/Exif)?
// - [x] clear input on submit?
// - [x] submit to API
// - [-] pause/resume?
// - [x] surface errors in UI
// - [-] progressive enhancement?
// - [-] content type filter
// - [x] limit
// - [x] retry requests on fail
// - [x] terminology: posting/submitting/publishing
// - [x] validate: megapixels
// - [x] clear limit warning when count drops below
// - [x] remove/cancel
// - [x] retry all failed network requests
// - [x] filter out invalid
// - [x] corrupt (failed to load image -> failed to fetch dimensions)
// - [x] validate: file type
// - [x] validate: file size
// - [x] naming (publish/submit/post)
// - [x] retry publishing request failed
// - [x] demos
// - [ ] tests: reducer logic e.g. limit
// - [ ] share
// - [ ] API limit

// Workflows to test
// - retry failed upload
// - retry failed publish
// - validation errors
// - validation failed

import React from 'react';
import * as ReactDOM from 'react-dom';
import Main from './components/Main';

const el = <Main />;

const reactContainerEl = document.querySelector('.reactContainer');
ReactDOM.render(el, reactContainerEl);
