let state={
    socketId:null,
    localStream:null,
    remoteStream:null,
    screenSharingStream:null,
    allowConnectionsFromStrangers:false,
    screenSharingActive:false
}

export const setLocalStream = (stream)=>{
    state={
        ...state,
        localStream:stream,
    }
}

export const setSocketId = (socketId)=>{
    // state[socketId]=socketId
    //or
    state={
        ...state,
        socketId,
    };
    console.log(state);
};


export const setRemoteStream = (stream)=>{
    state = {
        ...state,
        remoteStream:stream,
    }
}

export const setScreenSharingStream = (stream)=>{
    state={
        ...state,
        screenSharingStream:stream,
    }
}

export const setScreenSharingAcitve=(screenSharingActive)=>{
    state={
        ...state,
        screenSharingActive,
    }
}

export const getState = ()=>{
    return state
}