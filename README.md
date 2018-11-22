# unsplash-uploader-prototype

[Demo](https://unsplash.github.io/uploader-prototype/)

An open-source prototype of the [Unsplash uploader](https://mobile.twitter.com/lukechesser/status/1062111667289550855).

This prototype is very close to the uploader we have in production today, with the exception of some style and content changes. We hope it’s a useful case study to anyone who wants to build a similar application or wants to use similar technologies/patterns (TypeScript, React, Redux, redux-observable, and finite-state machines).

[Read the blog post which dives deep into the technical architecture](https://medium.com/unsplash/building-the-unsplash-uploader-880a5ba0d442).

<img width="500" src="./screenshot.png" />

## Development

```sh
yarn
npm run compile:watch
npm run start:server
open http://localhost:8080
# OR
open http://localhost:8080/?should_render_demos
```
