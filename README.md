# Twitch Multi VOD

Twitch multi VOD is a webapp that lets you play Twitch VODs at the same time and sync them up. I built it because I wanted to use it to watch some streamers play SCP at the same time. [And it was worth it](https://twitchmultivod.com/#/775309607?t=8h12m43s/775595078). If you've noticed an issue feel free to submit it—I'll definitely see it as I get emails for this repo, and probably will end up dealing with it if possible. Unfortunately the Twitch API is limiting, so I can't guarantee getting to everything. As for new feature requests...probably won't get to those unless this website blows up.

If anything I would like to add the ability to find VODs to add to your current watch list. Maybe a suggestions pane that checks the Twitch API to find other popular streamers playing the same game at the same time.

If you decide you want to actually contribute to this repo go right ahead. You'll need an API token though, so follow the Twitch instructions for generating one [here](https://dev.twitch.tv/docs/authentication). You want an app access token. Then put it (along with your client ID) in a file called `.env.development` as environment variables. That is, the file will be:
```
REACT_APP_TWITCH_CLIENT_ID=your_id
REACT_APP_TWITCH_SECRET=your_secret
```

Thanks for checking out the site!

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
