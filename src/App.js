import React from 'react';
import logo from './logo.svg';
import './App.css';
import ReactPlayer from 'react-player/twitch'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faRedo, faUndo, faAngleUp, faAngleDown, faTimes } from '@fortawesome/free-solid-svg-icons'

const minHeight = 300
const defaultVolume = .5
const progressInterval = 1000
const twitchPurple = "#9147ff"

const style= {
  bar: showBar => ({
    background: "#333333",
    height: showBar ? 52 : 0,
    display: showBar ? "flex" : "none",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  }),
  buttonContainer: {
    display: "flex",
    alignItems: "center",
  },
  button: isActive => ({
    background: "#bdbdbd",
    color: "#2b2b2b",
    padding: "1px 5px",
    fontSize: "13px",
    borderRadius: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointer: "cursor",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    MsUserSelect: "none",
    height: "26px",
    boxShadow: isActive ? `inset 1px 1px 3px ${twitchPurple}, inset -1px -1px 3px ${twitchPurple}` : "",
  }),
  link: {
    color: "#bdbdbd",
    textDecoration: "none",
  },
  control: {
    margin: "9px",
    color: "#bdbdbd",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    MsUserSelect: "none",
  },
  playPause: {
    width: "28px",
    height: "28px",
  },
  seek: {
    width: "18px",
    height: "18px",
  },
  angle: barShown => ({
    width: "20px",
    height: "20px",
    margin: "9px 9px",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    MsUserSelect: "none",
    borderRadius: "4px",
    padding: "7px",
    color: barShown ? "black" : "white",
    position: "absolute",
    right: 0,
  }),
}

const durationRE = new RegExp(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/)
const videoIdRE = new RegExp(/^(\d\d\d\d\d\d\d\d\d)$|.*twitch\.tv\/videos\/(\d\d\d\d\d\d\d\d\d)$/)

// Ratio is width:height.
function findBoxSize(windowSize, boxes, ratio, showTopBar, showBottomBar) {
  const adjustedWindowSize = {
    width: windowSize.width,
    height: windowSize.height-(style.bar(showTopBar).height+style.bar(showBottomBar).height),
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

function anyPlaying(vods) {
  for (let v of vods) {
    if (v.playing) {
      return true
    }
  }
  return false
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

  // These are used when we need to asynchronously remove buttons, which accidentally delete vods
  // sometimes due to not knowing new vods were added.
  const vodsRef = React.useRef(vodState.vods)
  vodsRef.current = vodState.vods
  const activeVod = React.useRef(vodState.active)
  activeVod.current = vodState.active

  const [newVodText, setNewVodText] = React.useState("775309607")

  const [smartMute, setSmartMute] = React.useState(true)
  const [smartPlay, setSmartPlay] = React.useState(true)
  const [showTopBar, setShowTopBar] = React.useState(true)
  const [showBottomBar, setShowBottomBar] = React.useState(true)
  const [play, setPlay] = React.useState(true)
  const [error, setError] = React.useState("")

  const windowSize = useWindowSize()
  const boxSize = findBoxSize(windowSize, vodState.vods.length, 16/9, showTopBar, showBottomBar)

  // In charge of making sure vods maintain a single mute.
  React.useEffect(() => {
    // Set interval to watch for change in mutes.
    const interval = setInterval(() => {
      try {
        if (smartMute) {
          let anyActive = false
          let newActive = -1
          for (let i = 0; i < vodState.vods.length; i++) {
            let player = vodState.vods[i].ref.current.getInternalPlayer()
            if (player !== undefined) {
              let muted = player.getMuted()
              if (!muted) {
                anyActive = true
                // If this is a new active vod, remember it.
                if (i !== vodState.active) {
                  newActive = i
                }
              }
            }
          }
          if (newActive !== -1) {
            vodState.vods[newActive].muted = false
            if (vodState.active !== -1) {
              vodState.vods[vodState.active].muted = true
            }
            setVodState({
              active: newActive,
              vods: vodState.vods,
            })
          } else {
            setVodState({
              active: anyActive ? vodState.active : -1,
              vods: vodState.vods,
            })
          }
        }
      } catch (error) {
        setVodState({
          active: -1,
          vods: vodsRef.current,
        })
        console.log(error)
      }
    }, 50)
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
      <div style={{...style.bar(showTopBar)}}>
        {/* Left of input */}
        <div style={{display: "flex", flexGrow: 1, flexBasis: 0, alignItems: "center"}}>
          {/* Error message */}
          <div style={{
            display: error === "" ? "none" : "flex",
            alignItems: "center",
            marginLeft: "10px",
            marginRight: "10px",
            padding: "4px",
            fontSize: "13px",
            background: "#757575",
            boxShadow: "0 0 0 1px #b50000",
            borderRadius: "2px",
            maxHeight: `${style.bar(true).height-8}px`,
            overflow: "scroll",
            boxSizing: "border-box",
          }}>
            <div>{error}</div>
            <FontAwesomeIcon icon={faTimes} className="closeError"
              style={{
                width: "13px",
                height: "13px",
                padding: "3px",
                marginLeft: "7px",
                borderRadius: "2px",
              }}
              onClick={() => {setError("")}}
            />
          </div>
        </div>
        {/* Inputs */}
        <div style={style.buttonContainer}>
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
              height: style.button(false).height,
            }}
          />
          <div
            style={{
              ...style.button(false),
              marginLeft: "5px",
            }}
            onClick={() => {
              const match = newVodText.match(videoIdRE)
              if (match !== null) {
                const vodId = match[2] === undefined ? match[1] : match[2]
                fetch(`https://api.twitch.tv/helix/videos?id=${vodId}`, {
                  headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Client-Id": process.env.REACT_APP_TWITCH_CLIENT_ID,
                  }
                })
                  .then(resp => resp.json())
                  .then(data => {
                    if (data.error === undefined) {
                      // Find starting and ending times for this video.
                      const vodData = data.data["0"]
                      const start = new Date(vodData.created_at)
                      const end = new Date(start.getTime() + getMilliseconds(vodData.duration))

                      // If this is the first vod, it should be unmuted. Otherwise, add it as by default
                      // muted.
                      const isFirstVod = (vodState.vods.length === 0)

                      setVodState({
                        active: isFirstVod ? 0 : vodState.active,
                        vods: vodState.vods.concat({
                          id: vodId,
                          start: start,
                          end: end,
                          ref: React.createRef(),
                          playing: false,
                          volume: defaultVolume,
                          muted: !isFirstVod,
                          showButtons: false,
                          buttonTimeoutRef: React.createRef(),
                          vodData: vodData,
                        })
                      })
                    } else {
                      setError(`API Error: ${data.error}, message: ${data.message} (status: ${data.status})`)
                    }
                  }).catch(error => setError(`Error adding video: ${error}`))
              } else {
                // No match, show error.
                setError(`Could not parse video from text "${newVodText}"`)
              }
              setNewVodText("")
            }}
          >
            Add Video
          </div>
        </div>
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
          <a href="https://www.buymeacoffee.com/henryperson" style={{...style.link, marginRight: "60px", fontSize: "14px"}}>Buy Me Coffee</a>
        </div>
      </div>
      {/* Hide/show top/bottom bar icons */}
      <FontAwesomeIcon
        className="showhide"
        style={{...style.angle(showTopBar), top: 0}}
        icon={showTopBar ? faAngleUp : faAngleDown}
        onClick={() => setShowTopBar(!showTopBar)}
      />
      <FontAwesomeIcon
        className="showhide"
        style={{...style.angle(showBottomBar), bottom: 0}}
        icon={showBottomBar ? faAngleDown: faAngleUp}
        onClick={() => setShowBottomBar(!showBottomBar)}
      />
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
                position: "relative",
              }}
              onMouseEnter={() => {
                vod.showButtons = true
                setVodState({
                  active: vodState.active,
                  vods: vodState.vods,
                })
                if (vod.buttonTimeoutRef !== null) {
                  clearTimeout(vod.buttonTimeoutRef.current)
                }
                vod.buttonTimeoutRef.current = setTimeout(() => {
                  vod.showButtons = false
                  setVodState({
                    active: activeVod.current,
                    vods: vodsRef.current,
                  })
                }, 2000)
              }}
            >
              {/* Buttons for closing */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  display: "flex",
                  margin: "12px",
                }}
                // TODO: maybe don't repeat this code if it can be made a function without the
                // rendering no longer working?
                onMouseMove={() => {
                  vod.showButtons = true
                  setVodState({
                    active: vodState.active,
                    vods: vodState.vods,
                  })
                  if (vod.buttonTimeoutRef !== null) {
                    clearTimeout(vod.buttonTimeoutRef.current)
                  }
                  vod.buttonTimeoutRef.current = setTimeout(() => {
                    vod.showButtons = false
                    setVodState({
                      active: activeVod.current,
                      vods: vodsRef.current,
                    })
                  }, 2000)
                }}
              >
                {/* Sync button */}
                <div
                  style={{
                    ...style.button(false),
                    marginRight: "10px",
                    visibility: vod.showButtons ? "visible" : "hidden",
                  }}
                  onClick={() => {
                    // Check if the videos are syncable.
                    const currentSeconds = vod.ref.current.getCurrentTime()
                    console.log("currentSeconds", currentSeconds)
                    const currentTime = new Date(vod.start.getTime() + currentSeconds*1000)
                    console.log("start", vod.start)
                    console.log("current time", currentTime)
                    let syncVods = []
                    for (let i = 0; i < vodState.vods.length; i++) {
                      const v = vodState.vods[i]
                      if (v.end < currentTime || v.start > currentTime) {
                        setError(`Cannot sync ${v.vodData.user_name} (id ${v.id})`)
                      } else if (i !== index) {
                        syncVods.push(v)
                      }
                    }
                    // Sync them.
                    for (let v of syncVods) {
                      let offset = (vod.start - v.start)/1000
                      v.ref.current.seekTo(currentSeconds+offset, "seconds")
                    }
                  }}
                >
                  Sync To This
                </div>
                {/* Close button */}
                <FontAwesomeIcon icon={faTimes}
                  style={{
                    ...style.button(false),
                    width: "16px",
                    height: "16px",
                    padding: "6px",
                    visibility: vod.showButtons ? "visible" : "hidden",
                  }}
                  onClick={() => {
                    if (vod.buttonTimeoutRef !== null) {
                      clearTimeout(vod.buttonTimeoutRef.current)
                    }
                    vodState.vods.splice(index, 1)
                    setVodState({
                      active: vodState.active === index ? -1 : vodState.active,
                      vods: vodState.vods,
                    })
                  }}
                />
              </div>
              {/* Player itself */}
              <ReactPlayer
                ref={vod.ref}
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
                volume={vod.volume}
                muted={vod.muted}
                playing={vod.playing}
                onPlay={() => {
                  if (smartPlay) {
                    for (let v of vodState.vods) {
                      v.playing = true
                    }
                  }
                  vod.playing = true
                  setVodState({
                    active: vodState.active,
                    vods: vodState.vods,
                  })
                }}
                onPause={() => {
                  if (smartPlay) {
                    for (let v of vodState.vods) {
                      v.playing = false
                    }
                  }
                  vod.playing = false
                  setVodState({
                    active: vodState.active,
                    vods: vodState.vods,
                  })
                }}
                progressInterval={progressInterval}
              />
            </div>
          )
        })}
      </div>
      {/* Footer */}
      <div
        style={{
          ...style.bar(showBottomBar),
        }}
      >
        <div style={{...style.buttonContainer, flex: "1 0 0", justifyContent: "flex-start"}}>
        <div style={{...style.button(false), margin: "10px"}}
            onClick={() => {
              if (vodState.vods.length > 0) {
                // Find the latest vod.
                let latestVod = vodState.vods[0]
                for (let vod of vodState.vods) {
                  if (vod.start > latestVod.start) {
                    latestVod = vod
                  }
                }
                // Confirm that we can seek to this time in all vods.
                for (let vod of vodState.vods) {
                  if (vod.end < latestVod.start) {
                    setError(`Can't sync: ${vod.vodData.user_name} video (id ${vod.id}) ends before ${latestVod.vodData.user_name} video (id ${latestVod.id}) begins`)
                    return
                  }
                }
                // Sync the vods.
                for (let vod of vodState.vods) {
                  const seekTo = (latestVod.start - vod.start)/1000
                  vod.ref.current.seekTo(seekTo)
                }
              }
            }}
          >
            Earliest Sync
          </div>
          <div style={{...style.button(smartMute), margin: "10px", width: "95px"}}
            onClick={() => setSmartMute(!smartMute)}
          >
            Smart Mute {smartMute ? "On" : "Off"}
          </div>
          <div style={{...style.button(smartPlay), margin: "10px", width: "95px"}}
            onClick={() => setSmartPlay(!smartPlay)}
          >
            Smart Play {smartPlay ? "On" : "Off"}
          </div>
        </div>
        {/* Central controls */}
        <div style={style.buttonContainer}>
          {/* Back 10 seconds */}
          <FontAwesomeIcon style={{...style.control, ...style.seek}} icon={faUndo}
            onClick={() => {
              setSmartPlay(true)
              for (let v of vodState.vods) {
                v.playing = true
              }
              setVodState({
                active: vodState.active,
                vods: vodState.vods,
              })
              for (let v of vodState.vods) {
                let currentTime = v.ref.current.getCurrentTime()
                v.ref.current.seekTo(currentTime - 10)
              }
            }}
          />
          {/* Play/pause */}
          <FontAwesomeIcon style={{...style.control, ...style.playPause}}
            icon={anyPlaying(vodState.vods) ? faPause : faPlay}
            onClick={() => {
              setSmartPlay(true)
              let anyVodsPlaying = anyPlaying(vodState.vods)
              for (let v of vodState.vods) {
                v.playing = !anyVodsPlaying
              }
              setVodState({
                active: vodState.active === -1 ? 0 : vodState.active,
                vods: vodState.vods,
              })
            }}
          />
          {/* Forward 10 seconds */}
          <FontAwesomeIcon style={{...style.control, ...style.seek}} icon={faRedo}
            onClick={() => {
              setSmartPlay(true)
              for (let v of vodState.vods) {
                v.playing = true
              }
              setVodState({
                active: vodState.active,
                vods: vodState.vods,
              })
              for (let v of vodState.vods) {
                let currentTime = v.ref.current.getCurrentTime()
                v.ref.current.seekTo(currentTime + 10)
              }
            }}
          />
        </div>
        <div style={{...style.buttonContainer, flex: "1 0 0", justifyContent: "flex-end"}}>
        </div>
      </div>
    </div>
  );
}

export default App;
