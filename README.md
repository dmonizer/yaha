# yaha

as it seems shape of my head is not meant for home assistant's yaml configuration, and you need to automate your home - what more reasonable solution there is than write your own tool, huh?

idea is to have 
 - a central server (js) running different sensors (js) which load data from wherever (web, mqtt, bluetooth, whatnot) and publish state back to server.
 - separate backend component, which serves states as an REST(?) or websockets? to
 - frontend (of which there can be multiple then - web, app(s), console etc)


# How to install

git clone

npm i

npm run startServer


open frontend/index.html in browser.
