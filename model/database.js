const { user } = require('pg/lib/defaults');
const db =require('../util/dbconnection');
db.connect();
module.exports = class DataBase{
    constructor(O){
     this.Obj=O
    }

    SaveUserInDataBase(){
        return db.query("INSERT INTO users (email,fullname,username,password,profile_image) VALUES($1,$2,$3,$4,$5) ",
            [this.Obj.email,this.Obj.fullname,this.Obj.username,this.Obj.password,this.Obj.profile_image]
        ) 
    }
    SavePostInDataBase(){
        return db.query("INSERT INTO post (email,fileUrl,post_id,posttext,fileType) VALUES($1,$2,$3,$4,$5) ",
            [this.Obj.email,this.Obj.fileUrl,this.Obj.post_id,this.Obj.posttext,this.Obj.type]
        ) 
    }

    SaveMessageInDataBase(){
        return db.query("INSERT INTO messages (message_id,sender,receiver,message) VALUES($1,$2,$3,$4)",
            [this.Obj.message_id,this.Obj.sender,this.Obj.receiver,this.Obj.message]
        )
    }

    addFollowes(email,followeEmail){
        return db.query("INSERT INTO followers (email,followeremail) VALUES($1,$2) ",
            [email,followeEmail]
        );
    }

    async getUserByEmail(email){
        const user = await db.query("SELECT * FROM users WHERE email = $1",[email]);
        // console.log(email)
        return user.rows
    }
    async getUserByUsername(username){
        const user = await db.query("SELECT * FROM users WHERE username = $1",[username]);
        // console.log(email)
        return user.rows
    }
    async getFollowers(email){
        const user = await db.query("SELECT * FROM followers WHERE email = $1",[email]);
        // console.log(email)
        return user.rows
    }
    async getFollowing (email){
        const user = await db.query("SELECT * FROM followers WHERE followeremail = $1",[email]);
        // console.log(email)
        return user.rows
    }
    async getAllPostExceptCurrentUser(email){
        const user = await db.query("SELECT p.*, u.profile_image, u.bio, u.fullname FROM post p JOIN users u ON p.email = u.email WHERE u.email != $1  ORDER BY RANDOM() LIMIT 10",[email]);
        return user.rows
    }
    async getUserPostesByEmail(email){
        const user = await db.query("SELECT * FROM post WHERE email = $1",[email]);
        // console.log(email)
        return user.rows
    }

    async getMostFollowedUser(email){
        const users = await db.query("SELECT f.email, u.username, u.fullname, u.profile_image, COUNT(f.followeremail) AS follower_count FROM followers f JOIN users u ON f.email = u.email WHERE f.email != $1 GROUP BY f.email, u.username, u.fullname,u.profile_image ORDER BY follower_count DESC LIMIT 10;",[email])
         return users.rows;
    }

    async getUserRandomly(email){
        const random = Math.ceil(Math.random()*10)+5
        const users = await db.query("SELECT * FROM users WHERE email !=$1 ORDER BY RANDOM() LIMIT $2",[email,random]);
        return users.rows;
    }

    async getUserPostesFromFollower(email){
        const users = await db.query("SELECT p.*, u.profile_image, u.bio, u.fullname FROM post p JOIN followers f ON p.email = f.followeremail JOIN users u ON p.email = u.email WHERE f.email = $1  ORDER BY RANDOM() LIMIT 10",[email])
        return users.rows;
    }

    async getEmail(){
        const users = await db.query('SELECT email FROM users');
        return users.rows
    }

    async getAllFollowData(){
        const users = await db.query('SELECT * FROM followers');
        return users.rows
    }

    async getUserDataByArray(array){
        const users = await db.query('SELECT email, username, profile_image FROM users WHERE email = ANY($1::text[])',[array]) 
        return users.rows;
    }

    async getSuggestions(userEmail) {
        try {
            const followedUsers = await db.query(
                "SELECT followeremail FROM followers WHERE email = $1",
                [userEmail]
            );
            const followedEmails = followedUsers.map(row => row.followeremail);

            const suggestions = new Set(); 

            for (const followedUser of followedEmails) {
                const friendsOfFriend = await db.query(
                    "SELECT Following_Email FROM followers WHERE Follower_Email = ?",
                    [followedUser]
                );

                for (const friend of friendsOfFriend) {
                    if (friend.Following_Email !== userEmail && !followedEmails.includes(friend.Following_Email)) {
                        suggestions.add(friend.Following_Email);
                    }
                }
            }

            return Array.from(suggestions); 
        } catch (error) {
            console.error("Error retrieving suggestions:", error);
            throw error; 
        }
    }

    async getCommentAndCrosspondingData(postId){
        const users = await db.query("SELECT uc.*,u.profile_image,u.fullname FROM usercomment uc JOIN users u on u.username = uc.username WHERE uc.postid = $1",[postId]);
        return users.rows
    }

    async getAllReplayByCommentId(commentid){
        const comments = await db.query("SELECT ur.*,u.profile_image,u.fullname FROM userreplay ur JOIN users u on u.username = ur.userreplay WHERE ur.commentid = $1",[commentid]);
        return comments.rows;
    }

    async getSerchResult(userquery){
        const users = await db.query("SELECT u.*, COUNT(f.email) AS follower_count FROM users u LEFT JOIN followers f ON f.email = u.email WHERE similarity(u.username, $1) > 0.001 OR similarity(u.fullname, $1) > 0.001 OR similarity(u.bio, $1) > 0.001 OR similarity(u.email, $1) > 0.001 GROUP BY u.username, u.fullname, u.bio, u.email,u.id  ORDER BY similarity(u.username, $1) DESC,follower_count DESC , similarity(u.fullname,$1),similarity(u.bio,$1),similarity(u.email,$1) LIMIT 7;",[userquery]);
        return users.rows;
    }

 
    async getIFollowSpecificPereson(email,followremail){
        const user = await db.query("SELECT * FROM followers WHERE email=$1 AND followeremail=$2",[email,followremail]);
        return user.rows;
    }

    async getContactes(useremail){
        const users = await db.query("SELECT DISTINCT u.email, u.username, u.profile_image, u.bio FROM messages ms JOIN users u ON ms.sender = u.email WHERE ms.sender = $1  OR ms.receiver=$1;",[useremail]);
        return users.rows;
    }

    async getTwoUserMessage(email1,email2){
        const users = await db.query("SELECT * FROM messages WHERE (sender = $1 AND receiver = $2) OR (receiver = $1 AND sender = $2) LIMIT 25",[email1,email2]);
        return users.rows;
    }


    saveComment(){
        return db.query("INSERT INTO usercomment (commentid,postid,usercomment,username) VALUES($1,$2,$3,$4) ",
            [this.Obj.commentId,this.Obj.postId,this.Obj.comment,this.Obj.username]
        ) 
    }
    saveReplay(){
        return db.query("INSERT INTO userreplay (replayid,commentid,userreplay,username,replay) VALUES($1,$2,$3,$4,$5) ",
            [this.Obj.replayid,this.Obj.commentid,this.Obj.userreplay,this.Obj.username,this.Obj.replay]
        ) 
    }

    updatePassword(email,password){
        return db.query("UPDATE users SET password = $1  WHERE email = $2",
            [password,email]
        )
    }
    updateProfile(email,imageUrl){
        return db.query("UPDATE users SET profile_image = $1  WHERE email = $2",
            [imageUrl,email]
        )
    }
}



