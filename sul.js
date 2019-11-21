// import { create, Whatsapp } from 'sulla';
// const fs = require('fs');
const mime = require('mime-types');
const fse = require('fs-extra')
const sulla = require('sulla-hotfix');
const pupp = require('puppeteer');
var fs = require('fs');
var schedule = require('node-schedule');
const AWS = require('aws-sdk');
const request = require('request-promise');

// Variables

let contactData = [];
var urlReceived = ""
var groupMemberId = ""
var contactId = ""
var x = ""
var updatedAccessToken = ""
var imagePath = ""
var phoneNum = ""
var num = ""
var arrGroupMembersContacts = []
var arrContactsData = [""]
var arrWhatsappGroupMembersNames = []
var urlPost = "http://devserver.trustd.space/api/users/createPostFromWhatsApp"
var numb = ""
var capt = ""
var capt1 = ""
var q = ""

// Removing session to avoid removing session folder again and again.

fse.remove('./session').then(() => {
  sulla.create().then(client => start(client));

}).catch(err => {
  console.log(err)
})



// S3 access ID and secret key

const s3 = new AWS.S3({
  accessKeyId: 'AKIASRSORREN5N5LLM7P',
  secretAccessKey: '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'
});


// Node Scheduler to LOGOUT user after 5 days

schedule.scheduleJob('* * * 5 * *', async () => {

  // After 5 days user will get log out
  logout()
});


// sulla.create().then(client => start(client));

// QR Code generates after this

function start(client) {


  login()


  // Runs when any message is received
  client.onMessage(async (message) => {
    console.log(message)
    console.log(message.from)
    // removed everything after @ because phone number was coming like this XXXXXXXXXX@c.us
    var msg = message.from
    var r = msg.split('@');
    phoneNum = r[0]

    if (message.body === 'Hi') {
      client.sendText(message.from, '👋 Hello from TrustD');

      console.log(message.from);
      console.log(message.body);

    } else {

      x = message.body
      // -------------------Condition to check if message contains URL----------------------------

      if ((x.includes('www')) || (x.includes('com')) || (x.includes('http')) || (x.includes('https'))) {
        console.log('URL found')
        urlReceived = x
        console.log("URL received is ", urlReceived)

        // ---------------Condition to check if URL contains Event Brite or Meetup-------------------

        if ((x.includes('meetup')) || (x.includes('eventbrite'))) {
          console.log('Event URL found')

          postOnEventUrl()
          client.sendText(message.from, 'Event post created successfully 😉');
        } else {
          console.log('Non-event URL found')

          postOnNonEventUrl()
          // client.sendText(message.from, 'Post created successfully 😉');
          client.sendText(message.from, 'Information post created successfully')
        }
      } else {

        // ----------------------------Checking if message contains only image----------------------

        if (message.mimetype) {
          const filename = `${message.t}.${mime.extension(message.mimetype)}`;
          var mediaData = null;
          try {
            mediaData = await sulla.decryptMedia(message);
          } catch (error) {
            console.log(error)
          }

          try {
            console.log("AAAAAAAAAAAAAAA")

            try {

              fs.writeFileSync(filename, mediaData)
              var a = await uploadFile(filename)
        
              if (message["caption"]) {

                capt = message["caption"].split('#')
                q = capt.splice(0, 1);
                capt = capt.toString()
              } else {
                console.log("No caption")
                if (message["caption"] === "") {
                  console.log("No caption found")
                  q = ""
                  capt = ""
                } else {
                  console.log("Caption found")
                  q = message["caption"]
                  capt = null;
                }

              }
              
              

              // DATA to POST
              var data = JSON.stringify({
                "phoneNumber": phoneNum,
                "postData": {
                  "itemName": q,
                  "postDate": "2019-11-09T03:20:28Z",
                  "status": "Available",
                  "timeLimit": 0,
                  "hashId": "0ffdzgdfgsq234234wf",
                  "quantity": 100,
                  "startDate": "2020-01-09T17:00:00Z",
                  "endDate": "2020-01-09T19:00:00Z",
                  "startLocation": "Toronto",
                  "endLocation": "Brampton",
                  "tags": capt,
                  "userId": "2138",
                  "communityId": null,
                  "space_fk_id": "sjt",
                  "postTypeId": 19,
                  "lat": null,
                  "lng": null,
                  "img_url": imagePath,
                  "buySell": 1,
                },
                "type": "phoneNumber"
              });

              var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
              var xhr = new XMLHttpRequest();
              xhr.withCredentials = true;

              xhr.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                  console.log(this.responseText);
                }
              });

              xhr.open("POST", urlPost);
              xhr.setRequestHeader("Content-Type", "application/json");
              xhr.setRequestHeader("Authorization", updatedAccessToken);
              xhr.setRequestHeader("User-Agent", "PostmanRuntime/7.18.0");
              xhr.setRequestHeader("Accept", "*/*");
              xhr.setRequestHeader("Cache-Control", "no-cache");
              xhr.setRequestHeader("Postman-Token", "8a7972f2-0758-45d3-b85c-5097e607b4d9,b96cc119-1f68-497b-aea2-13850ba06e7a");
              xhr.setRequestHeader("Host", "devserver.trustd.space");
              xhr.setRequestHeader("Accept-Encoding", "gzip, deflate");
              xhr.setRequestHeader("Content-Length", "978");
              xhr.setRequestHeader("Cookie", "connect.sid=s%3A1jasl9AhbVeioP-UcjTFFyLgJToJKcQa.zNUh7EgidDxfGIM8zlqgk9utUaW6ClifBZeo4soWBDE");
              xhr.setRequestHeader("Connection", "keep-alive");
              xhr.setRequestHeader("cache-control", "no-cache");
              xhr.send(data);

              client.sendText(message.from, 'Image post created successfully 😉');

            } catch (error) {
              console.log(error)
              console.log("File upload unsuccessfull")
              client.sendText(message.from, "File upload unsuccessful")

            }




            console.log("File time")
            console.log(x)
          } catch (error) {
            console.log("Error in wirtefile")
            console.log(error)
          }
        }

        else {

          // --------------Here Invalid message means any message except URL and IMAGE---------------

          console.log('Just a message')
          client.sendText(message.from, 'Invalid message 🙄');

        }
      }

    }

    // --------------------------------------------- FETCHING WHATSAPP GROUPS, CONTACTS, GROUP MEMBERS-------------------------------------

    // Get all contacts

    client.getAllContacts()
      .then((data) => {
        // console.log(data)
        for (i = 0; i < data.length; i++) {

          // // getting message sender's name from contacts
          // if(message.from === data[i]["id"]["_serialized"]) {
          //   console.log("name found")
          //   console.log(i)
          //   console.log(data[i]["id"])
          //   console.log(data[i]["pushname"])
          //   console.log(data[i]['name'])

          //   console.log(data[0]["contact"])


          // } else {
          //   // console.log("name not found")
          // }
        }
        // console.log("data", data[0]["id"]["_serialized"]);


      })
      .catch((err) => {
        console.log(err);
      })


    // getting all chats

    // client.getAllChats(true)
    // .then((data)=> {
    //   console.log("__________________________________________________________________________________________________")
    //   console.log("Message sender details ::::: ",data[0]["contact"])
    // })
    // .catch((err)=> {
    //   console.log(err)
    // })

    //--------------------------------Get all groups------------------------------

    // client.getAllGroups(false)
    // .then((data)=> {

    //   console.log("GROUP NAME IS :",data[1]["contact"]["name"])
    //   // console.log(data[1]["groupMetadata"]["participants"][1]["id"]["user"])
    //   // console.log("DATA AFTER GETTING ALL GROUPS",data[1]["id"])
    //   console.log("GROUP PARTICIPANTS ARE :-",data[1]["groupMetadata"]["participants"] )

    //   // getting particular group members contact numbers
    //   for(i = 0; i < data[1]["groupMetadata"]["participants"].length; i++) {
    //     arrGroupMembersContacts = data[1]["groupMetadata"]["participants"][i]["id"]["user"]
    //     console.log("GRP CONTACTS ARE", arrGroupMembersContacts)
    //   }


    //   groupMemberId = data[1]["id"]["_serialized"]
    //   var x = ""

    //   // Getting group members ID
    // client.getGroupMembersId(groupMemberId).then((data) => {
    //   // console.log("DATA IS", data)
    //   // console.log("ALL GROUP MEMBER'S NAMES ARE AS FOLLOWS :-")

    //   for(j=0; j<data.length; j++) {
    //     x = data[j]["_serialized"]
    //       // get particular user contact from group
    //     client.getContact(x).then((data) => {
    //       console.log(data["name"])
    //       arrGroupNames = data["name"]
    //     }).catch((err)=> {
    //       console.log(err)
    //     })
    //   }

    //   // contactId = data[1]["_serialized"]
    // })
    // .catch((err)=> {
    //   console.log(err)
    // })
    // })
    // .catch((err)=> {
    //   console.log(err)
    // })






    client.getAllGroups(false)
      .then((data) => {
        // console.log("GROUP NAME IS :",data[1]["contact"]["name"])
        // console.log(data[1]["groupMetadata"]["participants"][1]["id"]["user"])
        // console.log("DATA AFTER GETTING ALL GROUPS",data[1]["id"])
        // console.log("GROUP PARTICIPANTS ARE :-",data[1]["groupMetadata"]["participants"] )10

        // getting particular group members contact numbers
        for (i = 0; i < data[1]["groupMetadata"]["participants"].length; i++) {
          arrGroupMembersContacts.push(data[1]["groupMetadata"]["participants"][i]["id"]["user"])
        }


        // Fetching all contacts and then comparing it with the whatsapp group members

        client.getAllContacts()
          .then(async (data) => {
            arrContactsData = data

            for (i = 0; i < arrGroupMembersContacts.length; i++) {
              numb = arrGroupMembersContacts[i]

              for (j = 0; j < arrContactsData.length; j++) {
                if (numb === arrContactsData[j]["id"]["user"]) {
                  // console.log("contact found")
                  // console.log("Group members contact numbers are : ",arrContactsData[j]["id"]["user"])
                  // console.log("Group members names are as follows:-",arrContactsData[j]["name"])
                  arrWhatsappGroupMembersNames.push(arrContactsData[j]["name"])

                } else {
                  // console.log("Not found")
                }
              }
            }


            // var m=await postGroupData()
            // console.log("MMMMMM=",m)


          })
          .catch((err) => {
            console.log(err);
          })



      }).catch((err) => {
        console.log(err)
      })





  });
}



async function postGroupData() {
  console.log("ARRAY IS", arrWhatsappGroupMembersNames)
  for (i = 0; i < arrWhatsappGroupMembersNames.length; i++) {
    var a = arrWhatsappGroupMembersNames[i]
    var options = {
      method: 'POST',
      uri: 'http://devserver.trustd.space/api/users',
      body: {
        "name": a,
        "email": i + "@gmail.com",
        "password": "123456"
      },
      json: true // Automatically stringifies the body to JSON
    };
    console.log("OPTIONSSSSSSSSSSSSSSSSSSS", options)
    var data = null;
    try {
      data = await request(options)
      console.log("DATA ISSSSSSSSSSSS", data)
    } catch (error) {
      console.log(error)
      throw error;
    }

  }
  return data

}





// ------------------Using login endpoint to update access token after every 5 days------------------------

function login() {

  var data = JSON.stringify({
    "username": "sjtuser",
    "password": "123456"
  });

  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
      console.log("USER LOGGED IN")
      var data = JSON.parse(this.responseText)
      console.log(data.id)
      updatedAccessToken = data.id

    }
  });

  xhr.open("POST", "http://devserver.trustd.space/api/users/login?username=sjtuser&password=123456");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("User-Agent", "PostmanRuntime/7.19.0");
  xhr.setRequestHeader("Accept", "*/*");
  xhr.setRequestHeader("Cache-Control", "no-cache");
  xhr.setRequestHeader("Postman-Token", "c8aa63bf-65ba-4252-acc3-ee5e7613733c,c2779e9f-31fe-4b13-a3d4-4865afbf7a1e");
  xhr.setRequestHeader("Host", "devserver.trustd.space");
  xhr.setRequestHeader("Accept-Encoding", "gzip, deflate");
  xhr.setRequestHeader("Content-Length", "42");
  xhr.setRequestHeader("Cookie", "connect.sid=s%3AUGrWStH3NRQqqXPiId5xjrfgxcBm74-F.kn5mHwLdtYsZ2rF9YnfU6wR5ri9kIHfhtjyXlntsKts");
  xhr.setRequestHeader("Connection", "keep-alive");
  xhr.setRequestHeader("cache-control", "no-cache");

  xhr.send(data);

}

//------------------Logging out user to get new access token, When user logins again----------------------- 

function logout() {

  var data = null;
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
      console.log("USER LOGGED OUT SUCCESSFULLY")
      login()
    }
  });

  xhr.open("POST", "http://devserver.trustd.space/api/users/logout");
  xhr.setRequestHeader("Authorization", updatedAccessToken);
  xhr.setRequestHeader("Content-Type", "text/plain");
  xhr.setRequestHeader("User-Agent", "PostmanRuntime/7.19.0");
  xhr.setRequestHeader("Accept", "*/*");
  xhr.setRequestHeader("Cache-Control", "no-cache");
  xhr.setRequestHeader("Postman-Token", "b93cb659-9ced-427a-8cd0-6cbce5c563d8,4a1aca5e-d55e-4c96-ba6e-2fd40232f4f5");
  xhr.setRequestHeader("Host", "devserver.trustd.space");
  xhr.setRequestHeader("Accept-Encoding", "gzip, deflate");
  xhr.setRequestHeader("Cookie", "connect.sid=s%3ALVLWCgEsizLrWPdPw3cFuErUT6A7so7t.IZ4%2FCRmIfZ0j4jnRAiy798tH43JeoFWdLdxsHef7%2BNQ");
  xhr.setRequestHeader("Content-Length", "0");
  xhr.setRequestHeader("Connection", "keep-alive");
  xhr.setRequestHeader("cache-control", "no-cache");

  xhr.send(data);
}

function postOnEventUrl() {
  // DATA to POST

  var data = JSON.stringify({
    "phoneNumber": phoneNum,
    "postData": {
      "postDate": "2019-11-09T03:20:28Z",
      "status": "Available",
      "timeLimit": 0,
      "hashId": "0ffdzgdfgsq234234wf",
      "quantity": 100,
      "startDate": "2020-01-09T17:00:00Z",
      "endDate": "2020-01-09T19:00:00Z",
      "startLocation": "Toronto",
      "endLocation": "Brampton",
      "tags": null,
      "userId": "2138",
      "categoriesId": 10,
      "communityId": null,
      "space_fk_id": "sjt",
      "postTypeId": 10,
      "lat": null,
      "lng": null,
      "url": urlReceived,
      "img_url": null,
      "buySell": 1,

    },
    "type": "phoneNumber"
  });

  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
    }
  });

  xhr.open("POST", urlPost);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", updatedAccessToken);
  xhr.setRequestHeader("User-Agent", "PostmanRuntime/7.18.0");
  xhr.setRequestHeader("Accept", "*/*");
  xhr.setRequestHeader("Cache-Control", "no-cache");
  xhr.setRequestHeader("Postman-Token", "8a7972f2-0758-45d3-b85c-5097e607b4d9,b96cc119-1f68-497b-aea2-13850ba06e7a");
  xhr.setRequestHeader("Host", "devserver.trustd.space");
  xhr.setRequestHeader("Accept-Encoding", "gzip, deflate");
  xhr.setRequestHeader("Content-Length", "978");
  xhr.setRequestHeader("Cookie", "connect.sid=s%3A1jasl9AhbVeioP-UcjTFFyLgJToJKcQa.zNUh7EgidDxfGIM8zlqgk9utUaW6ClifBZeo4soWBDE");
  xhr.setRequestHeader("Connection", "keep-alive");
  xhr.setRequestHeader("cache-control", "no-cache");
  console.log(data)
  xhr.send(data);
}

function postOnNonEventUrl() {
  // DATA to POST

  var data = JSON.stringify({
    "phoneNumber": phoneNum,
    "postData": {
      "postDate": "2019-11-09T03:20:28Z",
      "status": "Available",
      "timeLimit": 0,
      "hashId": "0ffdzgdfgsq234234wf",
      "quantity": 100,
      "tags": null,
      "userId": "2138",
      "communityId": null,
      "space_fk_id": "sjt",
      "postTypeId": 19,
      "url": urlReceived,
      "img_url": null,
      "buySell": 1,

    },
    "type": "phoneNumber"
  });

  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
    }
  });

  xhr.open("POST", urlPost);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", updatedAccessToken);
  xhr.setRequestHeader("User-Agent", "PostmanRuntime/7.18.0");
  xhr.setRequestHeader("Accept", "*/*");
  xhr.setRequestHeader("Cache-Control", "no-cache");
  xhr.setRequestHeader("Postman-Token", "8a7972f2-0758-45d3-b85c-5097e607b4d9,b96cc119-1f68-497b-aea2-13850ba06e7a");
  xhr.setRequestHeader("Host", "devserver.trustd.space");
  xhr.setRequestHeader("Accept-Encoding", "gzip, deflate");
  xhr.setRequestHeader("Content-Length", "978");
  xhr.setRequestHeader("Cookie", "connect.sid=s%3A1jasl9AhbVeioP-UcjTFFyLgJToJKcQa.zNUh7EgidDxfGIM8zlqgk9utUaW6ClifBZeo4soWBDE");
  xhr.setRequestHeader("Connection", "keep-alive");
  xhr.setRequestHeader("cache-control", "no-cache");
  console.log(data)
  xhr.send(data);
}


// Uploading file on S3

function uploadFile(fileName) {
  var FOLDER = "Whatsappimages/";
  // Read content from the file
  const fileContent = fs.readFileSync(fileName);
  // Setting up S3 upload parameters
  const params = {
    Bucket: 'devapp-trustd',
    Key: FOLDER + fileName, // File name you want to save as in S3
    Body: fileContent
  };

  // Uploading files to the bucket
  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        console.log(err)
        // throw err;
        reject("error")
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      imagePath = data.Location
      resolve(imagePath);
    });
  })
};

function randomNumGen(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function convertBase64ToImage(x) {
  console.log("X is ", x)
  //---------------Converting Base64 to Image file-----------------------------------
  var base64Data = x.replace(/^data:image\/png;base64,/, "");
  return new Promise((resolve, reject) => {
    require("fs").writeFile(num + ".png", base64Data, 'base64', function (err) {

      if (err) {
        reject("error")
      }
      console.log("Error=", err);
      resolve(num + ".png")
    });
  })

}


