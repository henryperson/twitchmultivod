import React from 'react';
import logo from './logo.svg';
import './App.css';
import ReactPlayer from 'react-player/twitch'

const headerHeight = 40
const footerHeight = 20
const minHeight = 300
const defaultVolume = .5
const progressInterval = 1000

const style= {
  bar: {
    background: "#333333",
  },
  button: {
    background: "#bdbdbd"
  },
  link: {
    color: "#bdbdbd",
    textDecoration: "none",
  },
}

// Ratio is width:height.
function findBoxSize(windowSize, boxes, ratio) {
  const adjustedWindowSize = {
    width: windowSize.width,
    height: windowSize.height-headerHeight-footerHeight,
  }
  let bestBox = {width: minHeight*ratio, height: minHeight}
  // let bestBox = {width: 0, height: 0}
  for (let rows = 1; rows <= boxes; rows++) {
    let cols = Math.ceil(boxes/rows)
    if (adjustedWindowSize.height*ratio/rows > adjustedWindowSize.width/cols) {
      // Width bottlenecked
      let w = adjustedWindowSize.width/cols
      if (w > bestBox.width) {
        bestBox = {width: w, height: w/ratio}
      }
    } else {
      // Height bottlenecked
      let h = adjustedWindowSize.height/rows
      if (h > bestBox.height) {
        bestBox = {width: h*ratio, height: h}
      }
    }
  }
  return bestBox
}

function getUnmutedIndex(vods) {
  for (let i = 0; i < vods.length; i++) {
    if (!vods[i].muted) {
      return i
    }
  }
  return -1
}

function isProbablyInitialJump(diff) {
  const threshhold = 2 // seconds.
  return Math.abs(diff*1000 - progressInterval) < threshhold*1000
}

// Adapted from https://usehooks.com/useWindowSize/
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = React.useState({
    width: undefined,
    height: undefined,
  });

  React.useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

const durationRE = new RegExp(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/)

function getMilliseconds(durationString) {
  let match = durationString.match(durationRE)
  const msFromSecs = parseInt(match[3]) * 1000
  const msFromMins = parseInt(match[2]) * 60 * 1000
  const msFromHours = parseInt(match[1]) * 60 * 60 * 1000
  return msFromSecs + msFromMins + msFromHours
}

function toTwitchTime(seconds) {
  let secondsLeft = seconds
  const hours = Math.floor(secondsLeft/(60*60))
  secondsLeft = secondsLeft - hours*60*60
  const minutes = Math.floor(secondsLeft/60)
  secondsLeft = secondsLeft - minutes*60
  return `${hours}h${minutes}m${secondsLeft}s`
}


// let vods = ["775614397", "775477240", "775309607"]
// let vods = ["775614397"]


function App() {
  const [authToken, setAuthToken] = React.useState("")
  React.useEffect(() => {
    if (authToken === "") {
      fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.REACT_APP_TWITCH_CLIENT_ID}&client_secret=${process.env.REACT_APP_TWITCH_SECRET}&grant_type=client_credentials`, {
        method: 'POST',
      })
        .then(resp => resp.json())
        .then(data => setAuthToken(data.access_token))
    }
  })

  // const [vods, setVods] = React.useState([])
  const [vodState, setVodState] = React.useState({
    active: -1,
    vods: [],
  })
  const [newVodText, setNewVodText] = React.useState("")

  const windowSize = useWindowSize()
  const boxSize = findBoxSize(windowSize, vodState.vods.length, 16/9)

  // const [vodRefs, setVodRefs] = React.useState([])
  // React.useEffect(() => {
  //   setVodRefs(vodRefs => (
  //     Array(vods.length).fill().map((_, i) => vodRefs[i] || React.createRef())
  //   ));
  // }, [vods.length])

  const [playing, setPlaying] = React.useState(false)

  // const handleProgress = (state, index) => {
  //   const diff = state.playedSeconds - vodState.vods[index].prevPlayedSeconds
  //   // console.log(`${index}: ${vodState.vods[index].prevPlayedSeconds} -> ${state.playedSeconds} (${diff})`)
  //   if (diff*1000 > 2*progressInterval) {
  //     console.log(`detected jump in ${index}, size ${diff} seconds`)
  //   }
  //   vodState.vods[index].prevPlayedSeconds = state.playedSeconds
  //   setVodState({
  //     active: vodState.active,
  //     vods: vodState.vods,
  //   })
  // }

  // In charge of making sure vods maintain a single mute.
  React.useEffect(() => {
    // Set interval to watch for change in mutes.
    const interval = setInterval(() => {
      let anyActive = false
      let newActive = -1
      for (let i = 0; i < vodState.vods.length; i++) {
        let muted = vodState.vods[i].ref.current.getInternalPlayer().getMuted()
        if (!muted) {
          anyActive = true
          // If this is a new active vod, remember it.
          if (i !== vodState.active) {
            newActive = i
          }
        }
      }

      if (newActive !== -1) {
        let newVods = [...vodState.vods]
        newVods[newActive].muted = false
        if (vodState.active !== -1) {
          newVods[vodState.active].muted = true
        }
        setVodState({
          active: newActive,
          vods: newVods,
        })
      } else {
        setVodState({
          active: anyActive ? vodState.active : -1,
          vods: vodState.vods,
        })
      }
    }, 200)
    return () => clearTimeout(interval)
  })

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
        background: "black",
      }}
    >
      {/* Header */}
      <div
        style={{
          ...style.bar,
          height: `${headerHeight}px`,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Left of input */}
        <div style={{flexGrow: 1, flexBasis: 0}}></div>
        <div
          style={{
            display: "flex",
            padding: "7px",
          }}>
          <input
            type="text"
            value={newVodText}
            onChange={e => setNewVodText(e.target.value)}
            size="50"
            placeholder="http://twitch.tv/videos/123456789 or 123456789"
            style={{
              background: "#cfcfcf",
              border: "none",
              outline: "none",
              borderRadius: "2px",
              paddingLeft: "5px",
            }}
          />
          <div
            style={{
              ...style.button,
              marginLeft: "5px",
              padding: "4px",
              fontSize: "13px",
              borderRadius: "2px",
              cursor: "pointer",
            }}
            onClick={() => {
              fetch(`https://api.twitch.tv/helix/videos?id=${newVodText}`, {
                headers: {
                  "Authorization": `Bearer ${authToken}`,
                  "Client-Id": process.env.REACT_APP_TWITCH_CLIENT_ID,
                }
              })
                .then(resp => resp.json())
                .then(data => {
                  // Find starting and ending times for this video.
                  const vodData = data.data["0"]
                  const start = new Date(vodData.created_at)

                  // If this is the first vod, it should be unmuted. Otherwise, add it as by default
                  // muted.
                  const isFirstVod = (vodState.vods.length === 0)

                  setVodState({
                    active: isFirstVod ? 0 : vodState.active,
                    vods: vodState.vods.concat({
                      id: newVodText,
                      start: start,
                      ref: React.createRef(),
                      volume: defaultVolume,
                      muted: !isFirstVod,
                      prevPlayedSeconds: 0,
                    })
                  })
                  setNewVodText("")
                })
            }}
          >
            Add Video
          </div>
        </div>
        {/* {vodState.vods.map((vod, index) => {
          return (
            <button type="button"
              onClick={() => {
                let currentSeconds = vod.ref.current.getCurrentTime()
                for (let i = 0; i < vodState.vods.length; i++) {
                  if (i !== index) {
                    let offsetMs = vod.start - vodState.vods[i].start
                    vodState.vods[i].ref.current.seekTo(currentSeconds+offsetMs/1000, "seconds")
                  }
                }
              }}
            >
              sync to {index}
            </button>
          )
        })} */}
        {/* Right of input */}
        <div
          style={{
            flexGrow: 1,
            flexBasis: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}>
          <a href="https://github.com/henryperson/twitchsync" style={{...style.link, marginRight: "20px", fontSize: "14px"}}>Source</a>
          <a href="https://www.buymeacoffee.com/henryperson" style={{...style.link, marginRight: "20px", fontSize: "14px"}}>Buy Me Coffee</a>
        </div>
      </div>
      {/* Main body */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          flexBasis: 0,
          flexWrap: "wrap",
          minWidth: "0%",
        }}>
        {vodState.vods.map((vod, index) => {
          return (
            <div
              key={index}
              style={{
                width: boxSize.width,
                height: boxSize.height,
                boxSizing: "border-box",
                padding: "2px",
              }}
            >
              <ReactPlayer
                ref={vodState.vods[index].ref}
                url={"https://www.twitch.tv/videos/" + vod.id}
                width="100%"
                height="100%"
                controls={true}
                config={{
                  twitch: {
                    options: {
                      time: "0h0m0s",
                      autoplay: false,
                    },
                  },
                }}
                // style={{
                //   border: vod.muted ? "" : "1px solid red",
                // }}
                volume={vod.volume}
                muted={vod.muted}
                playing={playing}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                progressInterval={progressInterval}
              />
            </div>
          )
        })}
      </div>
      {/* Footer */}
      <div
        style={{
          ...style.bar,
          height: `${footerHeight}px`,
          display: "flex",
        }}
      >
      </div>
    </div>
  );
}

export default App;
