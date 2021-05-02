export const gqlVideoQuery =
    `query($videoID: ID) {
      video(id: $videoID) {
        id
        creator {displayName}
        recordedAt
        duration
      }
    }`;

export const gqlVideosQuery =
    `query($login: String, $cursor: Cursor) {
      user(login: $login) {
        videos(first: 20, after: $cursor) {
          edges {
            cursor
            node {
              id
              creator {displayName}
              recordedAt
              duration
            }
          }
        }
      }
    }`;