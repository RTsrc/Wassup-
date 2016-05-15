var local_server='http://localhost:8080/post';
var public_server='http://104.197.3.113/post';
var current_server=local_server;
var VERSION="1.2";
var my_userid=document.cookie.split('=')[1];
var my_sups=[];
var sup_num=0;
var selected_friend=my_userid;
var interval=3000;
var public_interval=60000; //increase time between request on public server
var server_busy=false; //set to prevent high frequency requests
window.addEventListener('load', function() {

    console.log("Wassup?");
    var load=document.getElementById("loading");
    var canvas=document.getElementById("sup_canvas");
    var toggleServer=document.getElementsByName("server");
    var clear_btn=document.getElementById("clear_sup");
    var check_btn=document.getElementById("check_sup");
    var sup_count=document.getElementById("sup-count");
    var add_btn=document.getElementById("add_friend");
    var pal_name=document.getElementById("make_friend");
    var make_btn=document.getElementById("make-user");
    var next_btn=document.getElementById("next_sup");
    var prev_btn=document.getElementById("prev_sup");
    var del_btn=document.getElementById("del_sup");
    var remove_btn=document.getElementById("remove_friend");
    var send_btn=document.getElementById("send_sup");
    var new_pal=document.getElementById("new-friend");
    var user=document.getElementById("user_name");
    var context=canvas.getContext('2d');
    var width=canvas.width;
    var height=canvas.height;
    load.style.display='none';
    sup_count.innerText="Sup Count: "+my_sups.length;
    context.strokeStyle="#0000";
    context.lineWidth=5;
    user.innerText="User: "+ my_userid;

    clear_btn.addEventListener('click', function(){
        clearSups(my_userid);
    });

    make_btn.addEventListener('click', function(){
        var user_name=pal_name.value;
        if(!server_busy) createUser(user_name.toUpperCase(),user_name);
    });

    check_btn.addEventListener('click', function(){
        checkSups();
    });

    send_btn.addEventListener('click', function() {
        var friend_menu = document.getElementsByName("friend_box");
        var select_friend=false;
        if(!server_busy) {
            _.each(friend_menu,
                function (pal) {
                    if (pal.checked) {
                        saySup(pal.value);
                        select_friend=true;
                    }
                });
        }else{
            alert("server is busy!");
        }
        if(!select_friend) {
            alert("Please select a friend!");
        }else {
            //send_btn.disabled=true;

        }
    });


    next_btn.addEventListener('click', function() {

        if(sup_num<my_sups.length-1) {
            sup_num += 1;
            drawSup(sup_num);
        }
    });

    del_btn.addEventListener('click', function() {

        if(sup_num>=0&&sup_num<my_sups.length) {
            deleteSup(my_sups[sup_num]);
            if(sup_num==my_sups.length) sup_num-=1;
            //sup_num=0;
            drawSup(sup_num);
        }
    });

    prev_btn.addEventListener('click', function() {

        if(sup_num>0) {
            sup_num -= 1;
            drawSup(sup_num);
        }
    });

   add_btn.addEventListener('click', function() {
        if(!server_busy){
            addFriendController(new_pal.value);
        } else{
            alert("Server is busy!");
        }
       //console.log(new_pal);
    });

    remove_btn.addEventListener('click', function() {
        var friend_menu = document.getElementsByName("friend_box");
        if(!server_busy) {
            _.each(friend_menu,
                function (pal) {
                    if (pal.checked) {
                        removeFriendController(pal.value);
                    }
                });
        }else{
            alert("Server is busy!");
        }
    });

    canvas.addEventListener('click', function() {
        randomSup("SUP?",my_sups[sup_num]);
    });
    toggleServer[1].checked = true;

    toggleServer[0].addEventListener('click', function(){
        my_sups=[];
        sup_num=0;
        current_server=public_server;
        createUser(my_userid.toUpperCase(),my_userid); //create current user in public db
        clearInterval(check);
        clearCanvas();
        checkSups();
        check2=setInterval(checkSups, public_interval);
        getFriends(my_userid);

        alert("Connected to Public Server: "+ current_server);
    });
    toggleServer[1].addEventListener('click', function(){
        my_sups=[];
        sup_num=0;
        current_server=local_server;
        clearInterval(check2);
        clearCanvas();
        check=setInterval(checkSups, interval);
        getFriends(my_userid);
        alert("Connected to Private Server: "+ current_server);
    });

    checkSups();
    getFriends(my_userid);

    //TESTING
    //var valid_user=userExists("new guy2","new2");
   // console.log(valid_user);
    //clearSups(my_userid);
    //createFriends("mybuddy",1);

    //saySup(my_userid);
    //addFriend("new");
    //addFriend("new2");


});

function toggleLoadBar(){
    var load=document.getElementById("loading");
    if(load.style.display!='block') {
        load.style.display = 'block';
    }else{
        load.style.display = 'none';
    }
}
function addFriendController(user_id){
    if(user_id.length>0) {
        userExists("user", user_id, add_if_exists);
    }else{
        alert("Please enter a valid user id!");
    }
}

function removeFriendController(user_id){
    if(user_id.length>0) {
       removeFriend(user_id);
    }else{
        alert("Please enter a valid user id!");
    }
}

function addSup(sup){
    var sup_count=document.getElementById("sup-count");
    my_sups.push(sup);
    sup_count.innerText="Sup Count: "+my_sups.length;
}

function deleteSup(sup){
    var sup_count=document.getElementById("sup-count");
    for(var i=0; i<my_sups.length;i++){
        if(my_sups[i]==sup) {
            my_sups.splice(i, 1);
            removeSup(sup.sup_id);
            sup_count.innerText = "Sup Count: " + my_sups.length;
        }
    }

}

function drawSup(index){
    if(index>=0&&my_sups.length>index){
        var sup=my_sups[index];
        //console.log(sup);
        randomSup("Sup?", sup);
        createStamp(sup);
    }
}

function saySup(receiver){
    var send_btn=document.getElementById("send_sup");
    var date=new Date();
    var day=date.getDate();
    var month=date.getMonth()+1;
    var year=date.getFullYear();
    var sup_id=my_userid+"to"+receiver+date.getTime();
    var date_string=day+"/"+month+"/"+year;
    sendSup(receiver,sup_id,date_string);
    send_btn.disabled=true;

}

//callback functions
function add_if_exists(rsp){

    var exists=rsp["reply_data"]["exists"];
    var user_id=rsp["reply_data"]["user_id"];
    if(exists) {
        addFriend(user_id);
    }else{
        alert(user_id+" does not exist!");
    }
}

function checkSups(){


    var sup_count=document.getElementById("sup-count");
    getSups(my_userid);
    sup_count.innerText="Sup Count: "+my_sups.length;
    drawSup(sup_num);

}

var check=setInterval(checkSups,interval);
var check2;

function List_Friends(friends) {
    var friend_list = document.getElementById("friends-menu");

    var friend_count = document.getElementById("friend-count");
    var friend_num=friends.length;
    friend_count.innerText="Friend Count: "+friend_num;
    friend_list.innerHTML="";
    _.each(
        _.values(friends),
        function (child) {
            var option=document.createElement("input");
            var label=document.createElement("label");
            var line_break=document.createElement("br");
            option.value=child.user_id;
            option.id=child.user_id;
            label.setAttribute("for",option.id);
            label.innerHTML=child.user_id;
            option.name="friend_box";
            option.type='checkbox';


            friend_list.appendChild(option);
            friend_list.appendChild(label);
            friend_list.appendChild(line_break);

        });

    //console.log(friend_menu);

}

function getRandomColor() {
    var letters = '01234567890123456'.split('');
    var colour = '#';
    for (var i = 0; i < 6; i++ ) {
        colour += letters[Math.floor(Math.random() * 16)];
    }
    //console.log(colour);
    return colour;
}

function getRandomSize() {
    var base_size=48;
    var size = base_size + Math.round(Math.random() * base_size);

    return size;
}

function getRandomFont(){
    var styles=["Times New Roman","Georgia","Arial","Lucida Sans Unicode","Verdana","Trebuchet MS","Tahoma"];
    var index=Math.floor(Math.random() * styles.length);
    //console.log(index);
    var font=styles[index];
    //console.log(font);
    return font;
}

function clearCanvas(){
    var canvas=document.getElementById("sup_canvas");
    var context=canvas.getContext('2d');
    var width=canvas.width;
    var height=canvas.height;
    context.clearRect(5,5,width-9,height-10);
}

var Sup=function(sender_id,sup_id,date){
    //metadata
    this.sender=sender_id;
    this.sup_id=sup_id;
    this.sent_date=date;

    //display data
    this.colour="#000";
    this.fsize="#000";
    this.fontstyle="Arial";
    this.posX=0;
    this.posY=0;
    this.rotation=0;
    this.drawn=false;

};

function createStamp(Sup){
    var date=Sup.sent_date;
    var sender=Sup.sender;
    var canvas=document.getElementById("sup_canvas");
    var context=canvas.getContext('2d');
    var width=canvas.width;
    var height=canvas.height;
    var fsize=15;
    var font=""+fsize+"px Arial";
    context.font=font;
    context.fillText(date,width-75,height-15);

    context.fillText("From: "+sender,width-15*sender.length,height-35);

}

function randomSup(msg, Sup){
    var canvas=document.getElementById("sup_canvas");
    var context=canvas.getContext('2d');
    var width=canvas.width;
    var height=canvas.height;
    var length=msg.length;
    var base=-1+Math.floor(Math.random())+Math.floor(Math.random());
    var fsize=getRandomSize();
    context.clearRect(5,5,width-9,height-10);
    var xoffset=Math.random()*10*base*length;
    var yoffset=Math.random()*length*15*base+fsize;
    var rotation=20*Math.random()*Math.PI/180;
    var rcolor=getRandomColor();
    var font=""+fsize+"px "+getRandomFont();
    context.save();
    if(!Sup.drawn) {
        context.rotate(rotation);
        context.fillStyle = rcolor;
        context.font = font;
        context.fillText(msg, width / 2.5 + xoffset, height / 2 - yoffset);
        //Add data to Sup
        Sup.fontstyle = font;
        Sup.colour = rcolor;
        Sup.rotation = rotation;
        Sup.posX = width / 2.5 + xoffset;
        Sup.posY = height / 2 - yoffset;
        Sup.drawn = true;
    }else{
        //Retrieve date from Sup
        context.rotate(Sup.rotation);
        context.fillStyle = Sup.colour;
        context.font = Sup.fontstyle;
        context.fillText(msg, Sup.posX, Sup.posY);
    }
    context.restore();
}

// Example derived from: https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started
function handleAjaxRequest(objectToSend, callback) {

    // Create the request object
    var httpRequest = new XMLHttpRequest();
    toggleLoadBar();
    // Set the function to call when the state changes
    httpRequest.addEventListener('readystatechange', function() {
        server_busy = true;
        // These readyState 4 means the call is complete, and status
        // 200 means we got an OK response from the server
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            // Parse the response text as a JSON object
            var responseObj = JSON.parse(httpRequest.responseText);
            toggleLoadBar();
            server_busy = false;
            callback(responseObj);
        }
        if(httpRequest.status >= 400){
            alert("Something is wrong with the current server, please try another!");
        }
    });

    httpRequest.timeout = 30000; //
    httpRequest.addEventListener('timeout', function () {
                                                alert("Something is wrong with the current server, please try another!");
                                                    });

    // This opens a POST connection with the server at the given URL
    httpRequest.open('POST', current_server);

    // Set the data type being sent as JSON
    httpRequest.setRequestHeader('Content-Type', 'application/json');

    // Send the JSON object, serialized as a string
    // TODO: You will need to actually send something and respond to it
    httpRequest.send(JSON.stringify(objectToSend));
}
function getMsgId(msg_type){
    var d= new Date();
    var n= d.getTime();
    return my_userid+msg_type+n;
}

function createUser(username, user_id){
    var id=getMsgId("create_user");
    var object = {"protocol_version":VERSION,
                  "message_id":id,
                  "command":"create_user",
                  "command_data":{"user_id":user_id,"full_name":username},"user_id":my_userid};
    handleAjaxRequest(object,function(rsp){
        alert("Created User: " + user_id);
        var pal_box=document.getElementById("make_friend");
        pal_box.value='';

    });
}

function userExists(username, user_id, callback){
    var id=getMsgId("user_exists");
    var object = {"protocol_version":VERSION,
        "message_id":id,
        "command":"user_exists",
        "command_data":{"user_id":user_id,"full_name":username},"user_id":my_userid};
    handleAjaxRequest(object,callback);
}

function addFriend (user_id){

    var id=getMsgId("add_friend");
    var object = {"protocol_version":VERSION,
        "message_id":id,
        "command":"add_friend",
        "command_data":{"user_id":user_id},"user_id":my_userid};
    handleAjaxRequest(object,function(rsp){
        //console.log("Error: "+rsp.error);
        alert(user_id+" was added to your friend list!");
        getFriends(my_userid);
    });
}

function removeFriend (user_id){
    var cmd="remove_friend";
    var id=getMsgId(cmd);
    var object = {"protocol_version":VERSION,
        "message_id":id,
        "command":cmd,
        "command_data":{"user_id":user_id},"user_id":my_userid};
    handleAjaxRequest(object,function(rsp){
        //console.log(JSON.stringify(rsp));
        getFriends(my_userid);
        alert(user_id+" was removed from your friend list!");
    });
}

function getFriends(user_id){
    var load=document.getElementById("loading");
    var cmd="get_friends";
    var id=getMsgId(cmd);
    var object = {"protocol_version":VERSION,
        "message_id":id,
        "command":cmd,
        "command_data":{"user_id":user_id},"user_id":my_userid};
    handleAjaxRequest(object,function(rsp){
        //console.log(JSON.stringify(rsp));
        List_Friends(rsp["reply_data"]);

    });
}

function sendSup(user_id,sup_id,date){
    var cmd="send_sup";
    var id=getMsgId(cmd);
    var object = {"protocol_version":VERSION,
        "message_id":id,
        "command":cmd,
        "command_data":{"user_id":user_id, "sup_id":sup_id,"date":date},"user_id":my_userid};
    handleAjaxRequest(object,function(rsp){
       //console.log(JSON.stringify(rsp));

        alert("You have sent a Sup to "+user_id);
        //checkSups();
        var send_btn=document.getElementById("send_sup");
        send_btn.disabled=false;
    });
}

function removeSup(sup_id){
    var cmd="remove_sup";
    var id=getMsgId(cmd);
    var object = {"protocol_version":VERSION,
        "message_id":id,
        "command":cmd,
        "command_data":{"sup_id":sup_id},"user_id":my_userid};
    handleAjaxRequest(object,function(rsp){
        alert("Sup has been deleted!");
        //console.log(JSON.stringify(rsp));
    });
}

function clearSups(user_id){
    var cmd="clear_sups";
    var sup_count=document.getElementById("sup-count");
    var id=getMsgId(cmd);
    var object = {"protocol_version":VERSION,
        "message_id":id,
        "command":cmd,
        "command_data":{"user_id":user_id},"user_id":my_userid};
    handleAjaxRequest(object,function(rsp){
        sup_num=0;
        my_sups=[];
        sup_count.innerText="Sup Count: "+my_sups.length;
        alert("Your Sups have been cleared!");
        clearCanvas();
        //console.log(JSON.stringify(rsp));
    });
}

function getSups(user_id){
    var cmd="get_sups";
    var id=getMsgId(cmd);
    var load=document.getElementById("loading");
    var object = {"protocol_version":VERSION,
        "message_id":id,
        "command":cmd,
        "command_data":{"user_id":user_id},"user_id":my_userid};
    handleAjaxRequest(object,function(rsp){
        //console.log(JSON.stringify(rsp));
        var sups_list=rsp.reply_data;

        if(sups_list.length>my_sups.length) {
           for(var index=my_sups.length;index<sups_list.length;index++) {
               var sup=sups_list[index];
               var date = sup.date;
               var id = sup.sup_id;
               var sender = sup.sender_id;
               var sender_name = sup.sender_full_name;

               var sup_obj = new Sup(sender, id, date);
               addSup(sup_obj);
           }
        }

        drawSup(sup_num);
    });
}
function createFriends(name,number){
    for(var i=0; i< number; i++){ // create some users for testing
        //console.log(name+i);
        createUser(name+i, name+i);
    }
}