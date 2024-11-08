const DataBase = require("./database");
const dbUser = new DataBase();

//this graph datasructure is used to get recommend follower for the user
class SuggestionGraph{
    constructor(){
        this.adjacencyList={};
    }
    addVertex(vertex){
        if(this.adjacencyList[vertex]==undefined){
            this.adjacencyList[vertex]=[]
        }
    }

    addEdge(v1,v2){
        this.adjacencyList[v1].push(v2);
    }
    getList(){
        console.log(this.adjacencyList);
    }
    getSuggestionFollower(email){
        let suggestionArray = [];
        let userFollowEmail = this.adjacencyList[email]
        for(let i=0;i<userFollowEmail.length;i++){
            let followedEmail = userFollowEmail[i];
            let suggetionEmails = this.adjacencyList[followedEmail].filter((e)=> e!=email && !userFollowEmail.includes(e));
            suggestionArray.push(...suggetionEmails);
            if(suggestionArray.length >6){
                break;
            }
        }
        return suggestionArray
    }
}


const graphInstance = new SuggestionGraph();
let userEmail, followData;
async function getDataFromDb(){
    userEmail =await dbUser.getEmail();
    followData = await dbUser.getAllFollowData()
}

setInterval(()=>{
    getDataFromDb().then(()=>{
        userEmail.forEach((e)=>{
            graphInstance.addVertex(e.email);
        })
    
        followData.forEach((e)=>{
            graphInstance.addEdge(e.email,e.followeremail)
        })
    }).catch((err)=>{
        console.log(err);
    });
},1500);


module.exports = graphInstance;