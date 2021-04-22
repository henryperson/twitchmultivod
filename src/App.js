import React from 'react';
import './App.css';
import ReactPlayer from 'react-player/twitch'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faRedo, faUndo, faAngleUp, faAngleDown, faTimes, faCopy} from '@fortawesome/free-solid-svg-icons'
import {isMobile} from 'react-device-detect'
import ReactGA from 'react-ga';

ReactGA.initialize('UA-161745919-3')
ReactGA.pageview("/" + window.location.hash)

const minHeight = 225
const defaultVolume = .5
const progressInterval = 1000
const twitchPurple = "#9147ff"

const style= {
  bar: showBar => ({
    background: "#333333",
    minHeight: showBar ? 52 : 0,
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
    cursor: "pointer",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    MsUserSelect: "none",
    height: "26px",
    boxShadow: isActive ? `inset 1px 1px 3px ${twitchPurple}, inset -1px -1px 3px ${twitchPurple}` : "",
    whiteSpace: "nowrap",
  }),
  link: {
    color: "#bdbdbd",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  control: {
    margin: "9px",
    color: "#bdbdbd",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    MsUserSelect: "none",
    cursor: "pointer",
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
    zIndex: 2,
    cursor: "pointer",
  }),
  textbox: {
    background: "#cfcfcf",
    border: "none",
    outline: "none",
    borderRadius: "2px",
  },
  instructions: {
    fontSize: "15px",
    marginTop: "8px",
  },
  popup: {
    position: "absolute",
    flexDirection: "column",
    background: "#757575",
    borderRadius: "3px",
    padding: "3px 3px 3px 10px",
    zIndex: 2,
  }
}

const duration = String.raw`(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)`
const durationRE = new RegExp(`${duration}`)
const vId = String.raw`\d\d\d\d\d\d\d\d\d`
const videoIdRE = new RegExp(`^(${vId})$|.*twitch\\.tv\\/videos\\/(${vId})$`)
const videoWithTimestampRE = new RegExp(`(${vId})(?:\\?t=(${duration}))?`)
const validUsernameRE = new RegExp(`^[\\w\\d_]{1,50}$`)

// Ratio is width:height.
function findBoxSize(windowSize, boxes, ratio, showTopBar, showBottomBar) {
  const adjustedWindowSize = {
    width: windowSize.width,
    height: windowSize.height-(style.bar(showTopBar).minHeight+style.bar(showBottomBar).minHeight),
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

function daysSince(since) {
  const now = new Date()
  var hours = Math.abs(now - since) / 36e5
  console.log(since, hours)
  if (hours < 24) {
    return "today"
  } else if (Math.floor(hours / 24) === 1) {
    return "1 day ago"
  } else {
    return `${Math.floor(hours/24)} days ago`
  }
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

// Copied from https://usehooks.com/useOnClickOutside/
function useOnClickOutside(ref, handler) {
  React.useEffect(
    () => {
      const listener = event => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }

        handler(event);
      };

      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);

      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
}

function getMilliseconds(durationString) {
  let match = durationString.match(durationRE)
  const msFromSecs = match[3] === undefined ? 0 : parseInt(match[3]) * 1000
  const msFromMins = match[2] === undefined ? 0 : parseInt(match[2]) * 60 * 1000
  const msFromHours = match[1] === undefined ? 0 : parseInt(match[1]) * 60 * 60 * 1000
  return msFromSecs + msFromMins + msFromHours
}

function toTwitchTime(seconds) {
  let secondsLeft = seconds
  const hours = Math.floor(secondsLeft/(60*60))
  secondsLeft = secondsLeft - hours*60*60
  const minutes = Math.floor(secondsLeft/60)
  secondsLeft = Math.round(secondsLeft - minutes*60)
  return `${hours}h${minutes}m${secondsLeft}s`
}

const urlPath = window.location.hash.substr(2)
// Track the initial timestamped VOD and its initial timestamp so we don't remove it from the URL
// when updating it.
let initialTimestampedVOD = {
  id: "",
  timestamp: "",
}

function App() {

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

  const [newVodText, setNewVodText] = React.useState("")

  const [smartMute, setSmartMute] = React.useState(true)
  const [smartPlay, setSmartPlay] = React.useState(true)
  const [showTopBar, setShowTopBar] = React.useState(true)
  const [showBottomBar, setShowBottomBar] = React.useState(true)
  const [shareState, setShareState] = React.useState({
    show: false,
    useTimestamp: true,
    url: "",
    timestamp: "",
  })
  const [chooseVodState, setChooseVodState] = React.useState({
    show: false,
    vods: [],
  })
  const [error, setError] = React.useState("")
  const [initialSync, setInitialSync] = React.useState(null)

  const shareWindow = React.useRef()
  useOnClickOutside(shareWindow, () => setShareState({...shareState, show: false}))
  const shareText = React.useRef()
  const chooseVodWindow = React.useRef()
  useOnClickOutside(chooseVodWindow, () => setChooseVodState({show: false, vods: []}))

  const windowSize = useWindowSize()
  const boxSize = findBoxSize(windowSize, vodState.vods.length, 16/9, showTopBar, showBottomBar)

  const getVod = (vodId) => {
    return fetch(`https://gql.twitch.tv/gql`, {
      method: `POST`, // eslint-disable-next-line
      body: `{\"query\":\"query {\\n  video(id:\\\"${vodId}\\\") {\\n    id\\n    recordedAt\\n    duration\\n  }\\n}\\n\",\"variables\":null}`,
      headers: {
        "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      }
    })
    .then(resp => resp.json())
    .then(data => {
      if (data.data.video) {
        // Find starting and ending times for this video.
        const vodData = data.data.video
        return formatNewVod(vodData)
      } else {
        throw new Error(`Video ${vodId} unavailable`)
      }
    })
  }

  const formatNewVod = (vodData) => {
    const start = new Date(vodData.recordedAt)
    const end = new Date(start.getTime() + getMilliseconds(vodData.duration))
    return {
      id: vodData.id,
      start: start,
      end: end,
      duration: vodData.duration,
      ref: React.createRef(),
      playing: false,
      volume: defaultVolume,
      muted: true,
      showButtons: false,
      buttonTimeoutRef: React.createRef(),
      vodData: vodData,
    }
  }

  const getVodsForUser = (username, start, end, cursor="", vods=[]) => {
    const zeroDate = new Date(0)
    return fetch(`https://gql.twitch.tv/gql`, {
      method: `POST`, // eslint-disable-next-line
      body: `{\"query\":\"query {\\n  user(login:\\\"${username}\\\") {\\n    videos(first: 20, after: \\\"${cursor}\\\") {\\n      edges {\\n        cursor\\n        node {\\n          id\\n          recordedAt\\n          duration\\n        }\\n      }\\n    }\\n  }\\n}\\n\",\"variables\":null}`,
      headers: {
        "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      }
    })
    .then(resp => resp.json())
    .then(data => {
      if (data.data.user) {
        let objs = data.data.user.videos.edges
        if (objs.length === 0) {
          throw new Error(`user "${username}" has no VODs`)
        }
        for (let obj of objs) {
          let v = obj.node
          let vodStart = new Date(v.recordedAt)
          let vodEnd = new Date(vodStart.getTime() + getMilliseconds(v.duration))
          if ((vodStart <= start && start <= vodEnd) || (vodStart <= end && end <= vodEnd) || (start <= vodStart && vodEnd <= end)) {
            vods.push(formatNewVod(v))
          } else if (vodEnd < start) {
            return vods
          }
          // This is when no VODs existed (thus no bounds). Return last 5 VODs.
          if (start.getTime() === zeroDate.getTime() && vods.length === 5) {
            return vods
          }
        }
        return getVodsForUser(username, start, end, objs[objs.length-1].cursor, vods)
      } else {
        throw new Error(`user "${username}" does not exist`)
      }
    })
  }

  const syncVods = (time, mustSyncAll) => {
    let syncVods = []
    for (let v of vodState.vods) {
      if (v.end < time || v.start > time) {
        setError(`Cannot sync ${v.vodData.user_name} (id ${v.id})`)
        if (mustSyncAll) {
          return
        }
      } else {
        syncVods.push(v)
      }
    }
    // Sync them.
    for (let v of syncVods) {
      let offset = (time - v.start)/1000
      v.ref.current.seekTo(offset, "seconds")
    }
  }

  const getTimestamp = (timestampIndex) => {
    if (timestampIndex === -1) {
      return toTwitchTime(vodState.vods[0].ref.current.getCurrentTime())
    } else {
      return toTwitchTime(vodState.vods[timestampIndex].ref.current.getCurrentTime())
    }
  }

  const getLink = (useTimestamp) => {
    const base = window.location.origin+"/#"
    let timestampIndex = vodState.active === -1 ? 0 : vodState.active
    timestampIndex = useTimestamp ? timestampIndex : -1
    let timestamp = getTimestamp(timestampIndex)
    let vods = getLinkRoute(timestampIndex, timestamp)
    return `${base}${vods}`
  }

  // This returns everything after the "#" in a link. For no timestamp, pass -1 for timestampIndex.
  const getLinkRoute = (timestampIndex, timestamp) => {
    let vods = ""
    for (let i = 0; i < vodState.vods.length; i++) {
      const vod = vodState.vods[i]
      vods = i === timestampIndex ? `${vods}/${vod.id}?t=${timestamp}` : `${vods}/${vod.id}`
    }
    return vods
  }

  // In charge of making sure vods maintain a single mute.
  React.useEffect(() => {
    // Set interval to watch for change in mutes.
    const interval = setInterval(() => {
      try {
        if (smartMute) {
          let newActive = -1
          for (let i = 0; i < vodState.vods.length; i++) {
            let player = vodState.vods[i].ref.current.getInternalPlayer()
            if (player !== undefined) {
              let muted = player.getMuted()
              if (!muted) {
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

  React.useEffect(() => {
    if (urlPath) {
      // Parse videos out of the urlPath and check that they are valid ID strings. Also, if there
      // is a timestamp, store it.
      const vodIds = urlPath.split("/")
      let syncVod = null
      const vodPromises = []
      for (let vodIdStr of vodIds) {
        // Most likely this is just a trailing slash.
        if (vodIdStr === "") {
          continue
        }
        let match = vodIdStr.match(videoWithTimestampRE)
        // Make sure this is a valid ID.
        if (match === null) {
          setError(`Incorrect ID in url: ${vodIdStr}`)
          return
        }
        let vodId = match[1]
        // If it has a timestamp, throw an error if it's an inaccurate timestamp or if we already
        // had a timestamp.
        if (vodIdStr.includes("?t=")) {
          if (match[2] === null) {
            setError(`Invalid timestamp here: ${vodIdStr}`)
            return
          } else if (syncVod !== null) {
            setError(`URL has multiple timestamps: ${vodIdStr}`)
            return
          } else {
            initialTimestampedVOD = {id: vodId, timestamp: match[2]}
            syncVod = {milliseconds: getMilliseconds(match[2]), id: vodId}
          }
        }
        vodPromises.push(getVod(vodId))
      }
      // Wait for all vods to finish loading, then set their state.
      Promise.all(vodPromises)
      .then((vods) => {
        // If we don't need to sync to a time, then just set state.
        if (!syncVod) {
          setVodState({
            active: -1,
            vods: vods
          })
        } else {
          // Set vods to playing before running a seek. Also, get the vod that we'll sync to.
          let timeToSync = new Date(0)
          for (let vod of vods) {
            vod.playing = true
            if (vod.id === syncVod.id) {
              timeToSync = new Date(vod.start.getTime() + syncVod.milliseconds)
            }
          }
          setInitialSync(timeToSync)
          setVodState({
            active: 0,
            vods: vods
          })
        }
      })
      .catch(error => {
        setError(`Error loading link: ${error.message}`)
      })
    }
  }, [])

  React.useEffect(() => {
    if (initialSync) {
      // Make sure refs exist for each vod.
      for (let vod of vodState.vods) {
        if (vod.ref.current === null) {
          return
        }
      }
      syncVods(initialSync, false)
      setInitialSync(null)
    } // eslint-disable-next-line
  }, [vodState])

  // In charge of updating the URL with vods added.
  const firstRender = React.useRef(true)
  React.useEffect(() => {
    // Skip first render.
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    // If this isn't the first render act normally.
    if (vodState.vods.length > 0) {
      // Get index of initial timestamped VOD if it's there.
      let initialIndex = -1
      for (let i = 0; i < vodState.vods.length; i++) {
        const vod = vodState.vods[i]
        if (vod.id === initialTimestampedVOD.id) {
          initialIndex = i
        }
      }
      // If initialIndex is -1, this won't return a timestamp.
      let route = getLinkRoute(initialIndex, initialTimestampedVOD.timestamp)
      window.location.hash = route
    } else {
      window.location.hash = ""
    }
  }, [vodState])

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
      <div style={{
        ...style.bar(showTopBar),
        padding: "0px 5px",
        justifyContent: isMobile ? "flex-start" : style.bar(showTopBar).justifyContent,
      }}>
        {/* Left of input */}
        {!isMobile &&
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
            maxHeight: `${style.bar(true).minHeight-8}px`,
            overflow: "auto",
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
                cursor: "pointer",
              }}
              onClick={() => {setError("")}}
            />
          </div>
        </div>
        }
        {/* Inputs */}
        <div style={{
          ...style.buttonContainer,
          flexGrow: 1,
          justifyContent: "center",
          maxWidth: isMobile ? "350px" : "450px",
        }}>
          <input
            type="text"
            value={newVodText}
            onChange={e => setNewVodText(e.target.value)}
            placeholder="http://twitch.tv/videos/123456789 or xqcow"
            style={{
              ...style.textbox,
              paddingLeft: "5px",
              height: style.button(false).height,
              width: "100%",
            }}
          />
          {/* Add video button */}
          <div ref={chooseVodWindow} style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div
              style={{
                ...style.button(false),
                marginLeft: "5px",
              }}
              onClick={() => {
                const vodMatch = newVodText.match(videoIdRE)
                const usernameMatch = validUsernameRE.test(newVodText)
                if (vodMatch !== null) {
                  const vodId = vodMatch[2] === undefined ? vodMatch[1] : vodMatch[2]
                  getVod(vodId)
                  .then((vod) => {
                    const isFirstVod = (vodState.vods.length === 0)
                    vod.muted = !isFirstVod
                    setVodState({
                      active: isFirstVod ? 0 : vodState.active,
                      vods: vodState.vods.concat(vod)
                    })
                  })
                  .catch(error => {
                    setError(`Could not add video: ${error.message}`)
                  })
                  ReactGA.event({
                    category: 'Video',
                    action: 'Add',
                    label: vodId,
                  });
                } else if (usernameMatch) {
                  // It's a valid username.

                  // Get video data from username.
                  let latestStart = new Date(0)
                  let earliestEnd = new Date()
                  for (let v of vodState.vods) {
                    if (v.start > latestStart) {
                      latestStart = v.start
                    }
                    if (v.end < earliestEnd) {
                      earliestEnd = v.end
                    }
                  }
                  if (latestStart > earliestEnd) {
                    setError(`Videos are not syncable, so I won't find VODs.`)
                    return
                  }
                  ReactGA.event({
                    category: 'Video',
                    action: 'Add',
                    label: newVodText,
                  });
                  getVodsForUser(newVodText, latestStart, earliestEnd)
                  .then(vods => {
                    if (vods.length > 1) {
                      setChooseVodState({show: true, vods: vods})
                    } else if (vods.length === 1) {
                      let vod = vods[0]
                      const isFirstVod = (vodState.vods.length === 0)
                      vod.muted = !isFirstVod
                      setVodState({
                        active: isFirstVod ? 0 : vodState.active,
                        vods: vodState.vods.concat(vod)
                      })
                    } else if (vods.length === 0) {
                      setError(`No vods from ${newVodText} occur during these videos.`)
                    }
                  })
                  .catch(error => {
                    setError(`Can't get video: ${error.message}`)
                  })
                } else {
                  setError(`Could not parse video ID or username from "${newVodText}"`)
                }
                setNewVodText("")
              }}
            >
              Add Video
            </div>
            <div
              style={{
                display: chooseVodState.show ? "flex" : "none",
                top: style.bar(true).minHeight+1,
                ...style.popup,
              }}
            >
              {/* Header of add video element */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "3px",
                }}>
                <div style={{fontSize: "14px"}}>Choose video</div>
                <FontAwesomeIcon icon={faTimes} className="shareButton"
                  style={{
                    width: "18px",
                    height: "18px",
                    padding: "2px",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                  onClick={() => {setChooseVodState({show: false, vods: []})}}
                />
              </div>
              {/* Render each VOD as an addable VOD */}
              {chooseVodState.vods.map((vod, index) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      paddingBottom: "5px",
                      fontSize: "14px",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    key={index}
                  >
                    <div>
                      <a href={`https://twitch.tv/videos/${vod.id}`}>{vod.id}</a> ({daysSince(vod.start)}, {vod.duration})
                    </div>
                    <div
                      style={{
                        ...style.button(false),
                        height: "20px",
                        margin: "1px 7px 1px 15px",

                      }}
                      onClick={() => {
                        const isFirstVod = (vodState.vods.length === 0)
                        vod.muted = !isFirstVod
                        setVodState({
                          active: isFirstVod ? 0 : vodState.active,
                          vods: vodState.vods.concat(vod)
                        })
                        setChooseVodState({show: false, vods: []})
                      }}
                    >
                      Add
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {/* Share button */}
          <div ref={shareWindow} style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div style={{...style.button(false), marginLeft: "5px", position: "relative"}}
              onClick={() => {
                if (vodState.vods.length === 0) {
                  setError("You can't share before adding videos!")
                  return
                }
                let timestampIndex = vodState.active === -1 ? 0 : vodState.active
                setShareState({...shareState, url: getLink(shareState.useTimestamp), show: !shareState.show, timestamp: getTimestamp(timestampIndex)})
              }}
            >
              Share
            </div>
            {/* Share window */}
            <div
              style={{
                display: shareState.show ? "flex" : "none",
                top: style.bar(true).minHeight+1,
                ...style.popup,
              }}
            >
              <div style={{display: "flex", justifyContent: "space-between"}}>
                <div style={{fontSize: "14px"}}>Share</div>
                <FontAwesomeIcon icon={faTimes} className="shareButton"
                  style={{
                    width: "18px",
                    height: "18px",
                    padding: "2px",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                  onClick={() => {setShareState({...shareState, show: false})}}
                />
              </div>
              <div style={{display: "flex", alignSelf: "center", alignItems: "center", margin: "10px 0px"}}>
                <input
                  ref={shareText}
                  type="text"
                  size={shareState.url.length > 50 ? shareState.url.length : 50}
                  style={{
                    ...style.textbox,
                    padding: "5px 2px",
                  }}
                  value={shareState.url}
                  readOnly={true}
                />
                {/* </div> */}
                <FontAwesomeIcon icon={faCopy} className="shareButton"
                  style={{
                    width: "18px",
                    height: "18px",
                    marginLeft: "6px",
                    marginRight: "-2px",
                    padding: "6px",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    shareText.current.select()
                    document.execCommand('copy')
                  }}
                />
              </div>
              <div style={{display: "flex", alignSelf: "center"}}>
                <input
                  type="checkbox"
                  checked={shareState.useTimestamp}
                  onChange={(e) => {
                    let timestampIndex = vodState.active === -1 ? 0 : vodState.active
                    setShareState({
                      ...shareState,
                      useTimestamp: e.target.checked,
                      url: getLink(e.target.checked),
                      timestamp: getTimestamp(timestampIndex),
                    })
                  }}
                />
                <div
                  style={{
                    fontSize: "14px"
                  }}
                >
                  Start at {shareState.timestamp}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right of input */}
        {!isMobile &&
        <div
          style={{
            flexGrow: 1,
            flexBasis: 0,
            marginLeft: "10px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <a href="https://github.com/henryperson/twitchmultivod"
            style={{...style.link, marginRight: "20px", fontSize: "14px"}}
            onClick={() => {
              ReactGA.event({
                category: 'Link',
                action: 'Github',
              });
            }}
          >
            Source
          </a>
          <a href="https://www.buymeacoffee.com/henryperson"
            style={{...style.link, marginRight: "60px", fontSize: "14px"}}
            onClick={() => {
              ReactGA.event({
                category: 'Link',
                action: 'Donate',
              });
            }}
            >
              Donate
            </a>
        </div>}
      </div>
      {/* Hide/show top/bottom bar icons */}
      <FontAwesomeIcon
        className="showhide"
        style={{...style.angle(showTopBar), top: 0}}
        icon={showTopBar ? faAngleUp : faAngleDown}
        onClick={() => setShowTopBar(!showTopBar)}
      />
      {/* Only show bottom bar if we're on desktop */}
      {!isMobile &&
      <FontAwesomeIcon
        className="showhide"
        style={{...style.angle(showBottomBar), bottom: 0}}
        icon={showBottomBar ? faAngleDown: faAngleUp}
        onClick={() => setShowBottomBar(!showBottomBar)}
      />
      }
      {/* Main body */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          flexBasis: 0,
          flexWrap: "wrap",
          minWidth: "0%",
          overflow: "auto",
        }}
      >
        {vodState.vods.length === 0 &&
          <div>
            <div
              style={{
                color: style.link.color,
                boxShadow: `0 0 0 1px yellow`,
                borderRadius: "2px",
                padding: "15px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "580px",
                margin: "20px",
              }}
            >
              <div style={{
                alignSelf: "center",
                marginBottom: "10px",
                fontSize: style.instructions.fontSize+2
              }}>Announcement</div>
              <div style={{fontSize: style.instructions.fontSize}}>
                New feature!
                You can now add VODs using a streamer's name. If you have VODs open, it will automatically add a syncable VOD.
                If you don't have anything open, it will let you choose from the streamer's last five VODs.
                Hope you enjoy!</div>
            </div>
            <div
              style={{
                color: style.link.color,
                boxShadow: `0 0 0 1px ${style.link.color}`,
                borderRadius: "2px",
                padding: "15px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "580px",
                margin: "20px",
              }}
            >
              <div style={{
                alignSelf: "center",
                marginBottom: "15px",
                fontSize: style.instructions.fontSize+2
              }}>Instructions</div>
              <div style={style.instructions}>1. Copy the links or ids of the VODs you want to watch
              (one at a time) into the text box at the top and click "Add Video".</div>
              <div style={style.instructions}>2. Find a point in a video where you want to watch, and
              use that video's "Sync To This" button to watch all videos at that real time. You can
              also use "Earliest Sync" to sync all videos to the earliest time where they were all live.</div>
              <div style={style.instructions}>3. Click "Share" to get a link to the set of videos you
              are watching and (optionally) a timestamp to sync them all to. The timestamp is whichever
              video is unmuted at the time, and if they're all muted it defaults to the first video.</div>

              <div style={style.instructions}>Other controls:</div>
              <div style={style.instructions}>
                <ul style={{paddingLeft: "20px", margin: "6px 0px"}}>
                  <li>Smart mute forces at most one video to be unmuted</li>
                  <li>Smart play forces all videos to pause/play together. You can use it to
                  get a bit more fine grained control over video sync, as it's not perfect.</li>
                  <li>Controls at the bottom apply to all videos. The skips go forward/back by 10 seconds.</li>
                  <li>The arrows on the top/bottom bars will show/hide those bars, if you want the extra space.</li>
                </ul>
              </div>
              <div style={style.instructions}>Sorry if it's not perfect, I am limited in annoying
              ways by the Twitch API. If you notice a bug, feel free to report it <a href="https://github.com/henryperson/twitchmultivod/issues">here</a>.</div>
              <div style={style.instructions}>Hope you enjoy!</div>
            </div>
          </div>
        }
        {vodState.vods.map((vod, index) => {
          return (
            <div
              key={index}
              style={{
                display: "flex",
                width: boxSize.width,
                height: boxSize.height,
                boxSizing: "border-box",
                padding: "2px",
                position: "relative",
                marginTop: "auto",
                marginBottom: "auto",
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
                    const currentTime = new Date(vod.start.getTime() + currentSeconds*1000)
                    syncVods(currentTime, false)
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
        <div style={{
          ...style.buttonContainer,
          flex: "1 0 0",
          justifyContent: "flex-start",
          marginRight: isMobile ? "10px" : "20px",
        }}>
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
                  syncVods(latestVod.start, true)
                }
              }
            }
          >
            Earliest Sync
          </div>
          {!isMobile &&
          <div style={{...style.button(smartMute), margin: "10px", width: "95px"}}
            onClick={() => setSmartMute(!smartMute)}
          >
            Smart Mute {smartMute ? "On" : "Off"}
          </div>
          }
          {!isMobile &&
          <div style={{...style.button(smartPlay), margin: "10px", width: "95px"}}
            onClick={() => setSmartPlay(!smartPlay)}
          >
            Smart Play {smartPlay ? "On" : "Off"}
          </div>
          }
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
