CREATE TABLE followers(
    email TEXT,
    followeremail TEXT
)

CREATE TABLE messages(
    message_id TEXT,
    sender TEXT,
    receiver TEXT,
    message TEXT
)

CREATE TABLE post(
    email TEXT,
    fileUrl TEXT,
    post_id TEXT,
    posttext TEXT,
    fileType TEXT
)

CREATE TABLE usercomment(
    commentid TEXT,
    postid TEXT,
    usercomment TEXT,
    username TEXT,
    savedate TIMESTAMP
)

CREATE TABLE userreplay(
    commentid TEXT,
    postid TEXT,
    usercomment TEXT,
    username TEXT,
    savedate TIMESTAMP
)

CREATE TABLE users(
    email TEXT,
    fullname TEXT,
    username TEXT,
    password TEXT,
    profile_image TEXT,
)