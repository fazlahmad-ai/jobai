// =====================================
// JobAI Script.js Professional Version
// Part 1/5
// Firebase + Authentication + User System
// =====================================


// ===============================
// Firebase Configuration
// ===============================

const firebaseConfig = {

    apiKey: "AIzaSyDC3687Efw3U-_W4lAOF4cQ3j1YyKSyXO0",

    authDomain: "jobai-pro.firebaseapp.com",

    projectId: "jobai-pro",

    storageBucket: "jobai-pro.appspot.com",

    messagingSenderId: "352101125474",

    appId: "1:352101125474:web:24e03ef92409d1fd9ff03b",

    measurementId: "G-1B6YZGL4TG"

};



// ===============================
// Initialize Firebase
// ===============================

if (!firebase.apps.length) {

    firebase.initializeApp(firebaseConfig);

}



const auth = firebase.auth();

const db = firebase.firestore();

const storage = firebase.storage();



console.log("🔥 Firebase initialized");





// ===============================
// Global Variables
// ===============================


let currentUser = null;

let isProUser = false;

let selectedTemplate = "modern";





// ===============================
// Helper Functions
// ===============================


function showMessage(message){

    alert(message);

}



function getValue(id){

    const element =
    document.getElementById(id);


    if(element){

        return element.value.trim();

    }


    return "";

}





function setValue(id,value){

    const element =
    document.getElementById(id);


    if(element){

        element.value = value || "";

    }

}





function setText(id,text){

    const element =
    document.getElementById(id);


    if(element){

        element.innerText = text || "";

    }

}







// ===============================
// SIGN UP
// ===============================


function signUp(){


    const email =
    getValue("email");


    const password =
    getValue("password");



    if(!email || !password){

        showMessage(
            "Enter email and password"
        );

        return;

    }




    auth
    .createUserWithEmailAndPassword(
        email,
        password
    )


    .then(result=>{


        return db
        .collection("users")
        .doc(result.user.uid)
        .set({

            email:
            result.user.email,


            pro:false,


            createdAt:
            firebase.firestore.FieldValue.serverTimestamp()


        });


    })


    .then(()=>{


        showMessage(
            "Account created successfully"
        );


    })


    .catch(error=>{


        showMessage(
            error.message
        );


    });


}







// ===============================
// LOGIN
// ===============================


function login(){


    const email =
    getValue("email");


    const password =
    getValue("password");



    if(!email || !password){


        showMessage(
            "Enter email and password"
        );


        return;

    }





    auth
    .signInWithEmailAndPassword(
        email,
        password
    )


    .then(result=>{


        console.log(
            "Login:",
            result.user.email
        );


        showMessage(
            "Login successful"
        );


    })


    .catch(error=>{


        console.error(error);


        showMessage(
            error.message
        );


    });



}








// ===============================
// LOGOUT
// ===============================


function logout(){


    auth
    .signOut()


    .then(()=>{


        currentUser = null;


        location.reload();


    })

    .catch(error=>{


        showMessage(
            error.message
        );


    });


}








// ===============================
// Authentication Listener
// ===============================


auth.onAuthStateChanged(user=>{


    currentUser = user;



    const authBox =
    document.getElementById("auth");



    const app =
    document.getElementById("app");





    if(user){


        console.log(
            "Logged user:",
            user.email
        );



        if(authBox){

            authBox.style.display="none";

        }



        if(app){

            app.style.display="block";

        }




        startJobAI();



    }


    else{


        console.log(
            "No user"
        );



        if(authBox){

            authBox.style.display="block";

        }



        if(app){

            app.style.display="none";

        }


    }



});









// ===============================
// Load User Status
// ===============================


function loadUserStatus(){


    if(!currentUser){

        return;

    }




    db.collection("users")

    .doc(currentUser.uid)

    .get()


    .then(doc=>{


        if(doc.exists){


            const data =
            doc.data();



            isProUser =
            data.pro === true;



            if(typeof updatePlanDisplay === "function"){

                updatePlanDisplay();

            }



        }



    })


    .catch(error=>{


        console.error(error);


    });



}









// ===============================
// Save User Profile
// ===============================


function saveUserProfile(){


    if(!currentUser){


        showMessage(
            "Please login first"
        );


        return;

    }





    const profile = {


        name:
        getValue("profileName"),



        phone:
        getValue("profilePhone"),



        location:
        getValue("profileLocation"),



        bio:
        getValue("profileBio"),



        updatedAt:
        firebase.firestore.FieldValue.serverTimestamp()


    };






    db.collection("users")

    .doc(currentUser.uid)

    .set(

        profile,

        {
            merge:true
        }

    )


    .then(()=>{


        showMessage(
            "Profile saved"
        );


    })


    .catch(error=>{


        showMessage(
            error.message
        );


    });



}








// ===============================
// Load User Profile
// ===============================


function loadUserProfile(){


    if(!currentUser){

        return;

    }




    db.collection("users")

    .doc(currentUser.uid)

    .get()


    .then(doc=>{


        if(doc.exists){


            const data =
            doc.data();



            setValue(
                "profileName",
                data.name
            );



            setValue(
                "profilePhone",
                data.phone
            );



            setValue(
                "profileLocation",
                data.location
            );



            setValue(
                "profileBio",
                data.bio
            );



        }



    });



}







console.log(
"✅ JobAI Part 1 Loaded Successfully"
);
// =====================================
// JobAI Script.js Professional Version
// Part 2/5
// Resume Builder + AI Features
// =====================================



// ===============================
// Resume Validation
// ===============================


function validateResume(){


    const name =
    getValue("name");


    const jobTitle =
    getValue("jobTitle");


    const skills =
    getValue("skills");



    if(!name){

        showMessage(
            "Please enter your name"
        );

        return false;

    }



    if(!jobTitle){

        showMessage(
            "Please enter Job Title"
        );

        return false;

    }



    if(!skills){

        showMessage(
            "Please enter Skills"
        );

        return false;

    }



    return true;


}







// ===============================
// Generate Resume
// ===============================


function generateResume(){


    if(!currentUser){


        showMessage(
            "Please login first"
        );


        return;

    }



    if(!validateResume()){

        return;

    }





    const resumeData = {


        userId:
        currentUser.uid,



        name:
        getValue("name"),



        jobTitle:
        getValue("jobTitle"),



        email:
        getValue("resumeEmail")
        ||
        getValue("email"),



        summary:
        getValue("summary"),



        skills:
        getValue("skills"),



        education:
        getValue("education"),



        experience:
        getValue("experience"),



        language:
        getValue("language"),



        template:
        selectedTemplate,



        createdAt:
        firebase.firestore.FieldValue.serverTimestamp()



    };







    db.collection("resumes")

    .add(resumeData)


    .then(()=>{


        previewResume();


        showMessage(
            "Resume created successfully"
        );


        loadResumes();



        if(typeof trackResumeCreated === "function"){

            trackResumeCreated();

        }



    })


    .catch(error=>{


        showMessage(
            error.message
        );


    });



}









// ===============================
// Resume Preview
// ===============================


function previewResume(){



    setText(
        "previewName",
        getValue("name") || "Your Name"
    );



    setText(
        "previewJob",
        getValue("jobTitle") || "Job Title"
    );



    setText(
        "previewEmail",
        getValue("resumeEmail")
        ||
        getValue("email")
    );



    setText(
        "previewSummary",
        getValue("summary")
    );



    setText(
        "previewSkills",
        getValue("skills")
    );



    setText(
        "previewEducation",
        getValue("education")
    );



    setText(
        "previewExperience",
        getValue("experience")
    );



    setText(
        "previewLanguage",
        getValue("language")
    );



    updatePreviewPhoto();


}









// ===============================
// Profile Photo Preview
// ===============================


function updatePreviewPhoto(){


    const input =
    document.getElementById(
        "profilePhoto"
    );


    const image =
    document.getElementById(
        "previewPhoto"
    );



    if(
        !input ||
        !image ||
        !input.files[0]
    ){

        return;

    }





    const reader =
    new FileReader();



    reader.onload=function(e){


        image.src =
        e.target.result;


    };



    reader.readAsDataURL(
        input.files[0]
    );


}








// ===============================
// Auto Preview System
// ===============================


document.addEventListener(
"input",
function(event){



    const fields=[


        "name",

        "jobTitle",

        "resumeEmail",

        "email",

        "summary",

        "skills",

        "education",

        "experience",

        "language"


    ];




    if(
        fields.includes(
            event.target.id
        )
    ){


        previewResume();


    }



});








// ===============================
// Load Resumes
// ===============================


function loadResumes(){


    if(!currentUser){

        return;

    }





    db.collection("resumes")

    .where(
        "userId",
        "==",
        currentUser.uid
    )


    .get()


    .then(snapshot=>{


        const box =
        document.getElementById(
            "resumeList"
        );



        if(!box){

            return;

        }



        box.innerHTML="";




        snapshot.forEach(doc=>{


            const data =
            doc.data();



            box.innerHTML += `

            <div class="resume-card">


            <h3>
            ${data.name || ""}
            </h3>


            <p>
            ${data.jobTitle || ""}
            </p>


            <p>
            ${data.skills || ""}
            </p>


            <button onclick="deleteResume('${doc.id}')">

            Delete

            </button>


            </div>

            `;



        });



    })



    .catch(error=>{


        console.error(error);


    });



}









// ===============================
// Delete Resume
// ===============================


function deleteResume(id){


    db.collection("resumes")

    .doc(id)

    .delete()



    .then(()=>{


        showMessage(
            "Resume deleted"
        );


        loadResumes();


    })



    .catch(error=>{


        showMessage(
            error.message
        );


    });



}








// ===============================
// AI Summary Generator
// ===============================


function generateAISummary(){



    const job =
    getValue("jobTitle");



    const skills =
    getValue("skills");



    const summaryBox =
    document.getElementById(
        "summary"
    );



    if(!summaryBox){

        return;

    }





    if(job && skills){



        summaryBox.value =

        `Professional ${job} with skills in ${skills}. Experienced, motivated and committed to professional growth.`;



    }


    else{


        summaryBox.value =

        "Motivated professional with strong skills and career goals.";


    }





    previewResume();


}









// ===============================
// AI Skill Suggestion
// ===============================


function suggestSkills(){


    const job =

    getValue("jobTitle")
    .toLowerCase();



    let skills =

    "Communication, Teamwork, Problem Solving";





    if(job.includes("developer")){


        skills =

        "HTML, CSS, JavaScript, React, Git";


    }



    else if(job.includes("teacher")){


        skills =

        "Teaching, Research, Presentation, Communication";


    }



    else if(job.includes("manager")){


        skills =

        "Leadership, Management, Planning, Organization";


    }




    setValue(
        "skills",
        skills
    );



    previewResume();



}









// ===============================
// Resume Score
// ===============================


function calculateResumeScore(){



    let score=0;




    if(getValue("name")){

        score +=25;

    }



    if(getValue("jobTitle")){

        score +=25;

    }



    if(getValue("skills")){

        score +=25;

    }



    if(getValue("summary")){

        score +=25;

    }





    const box =
    document.getElementById(
        "resumeScore"
    );



    if(box){



        box.innerHTML = `


        <h3>
        AI Resume Score
        </h3>


        <h2>
        ${score}%
        </h2>


        <p>

        ${
            score >= 80

            ?

            "Excellent Resume"

            :

            "Improve Resume"

        }

        </p>


        `;



    }



}









// ===============================
// Resume Templates
// ===============================


const templates = {


    modern:true,

    classic:true,

    creative:true


};







function selectTemplate(name){


    if(templates[name]){


        selectedTemplate =
        name;



        previewResume();



        showMessage(

        "Template changed: "
        +
        name

        );


    }



}







console.log(
"✅ JobAI Part 2 Loaded Successfully"
);
// =====================================
// JobAI Script.js Professional Version
// Part 3/5
// PDF + Profile Image + Dashboard
// =====================================



// ===============================
// Download Resume PDF
// ===============================


function downloadPDF(){


    const element =
    document.getElementById(
        "resume"
    );



    if(!element){


        showMessage(
            "Resume preview not found"
        );


        return;

    }




    const footer =
    element.querySelector(
        "footer"
    );



    if(footer){

        footer.style.display="none";

    }






    html2canvas(element,{


        scale:3,


        useCORS:true,


        allowTaint:true,


        backgroundColor:"#ffffff"


    })


    .then(canvas=>{


        const imgData =
        canvas.toDataURL(
            "image/png"
        );




        const pdf =
        new jspdf.jsPDF(

            "p",

            "mm",

            "a4"

        );





        const width =
        pdf.internal
        .pageSize
        .getWidth();




        const height =

        canvas.height *
        width /
        canvas.width;





        pdf.addImage(

            imgData,

            "PNG",

            0,

            0,

            width,

            height

        );





        pdf.save(
            "JobAI-Resume.pdf"
        );





        if(footer){

            footer.style.display="block";

        }





        if(typeof trackPDFDownload === "function"){

            trackPDFDownload();

        }



    })


    .catch(error=>{


        if(footer){

            footer.style.display="block";

        }


        showMessage(
            error.message
        );


    });



}









// ===============================
// Upload Profile Image
// ===============================


function uploadProfileImage(){



    if(!currentUser){


        showMessage(
            "Please login first"
        );


        return;

    }






    const input =
    document.getElementById(
        "profileImage"
    );



    if(
        !input ||
        !input.files[0]
    ){


        showMessage(
            "Select image first"
        );


        return;

    }





    const file =
    input.files[0];





    const storageRef =

    storage.ref(

        "profiles/"
        +
        currentUser.uid
        +
        "/photo.jpg"

    );





    storageRef
    .put(file)



    .then(()=>{


        return storageRef
        .getDownloadURL();


    })



    .then(url=>{



        return db.collection("users")

        .doc(currentUser.uid)

        .set({


            photoURL:url


        },{


            merge:true


        });



    })



    .then(()=>{


        showMessage(
            "Profile image uploaded"
        );


        loadProfileImage();



    })



    .catch(error=>{


        showMessage(
            error.message
        );


    });



}









// ===============================
// Load Profile Image
// ===============================


function loadProfileImage(){



    if(!currentUser){

        return;

    }




    db.collection("users")

    .doc(currentUser.uid)

    .get()



    .then(doc=>{


        if(doc.exists){



            const data =
            doc.data();




            const img =
            document.getElementById(
                "profilePreview"
            );




            if(
                img &&
                data.photoURL
            ){


                img.src =
                data.photoURL;


            }



        }



    })



    .catch(error=>{


        console.error(error);


    });



}









// ===============================
// Dashboard
// ===============================


function loadDashboard(){



    if(!currentUser){

        return;

    }





    const emailBox =
    document.getElementById(
        "dashboardEmail"
    );



    if(emailBox){


        emailBox.innerText =
        currentUser.email;


    }






    db.collection("resumes")

    .where(

        "userId",

        "==",

        currentUser.uid

    )



    .get()



    .then(snapshot=>{


        const count =
        document.getElementById(
            "dashboardResumeCount"
        );



        if(count){


            count.innerText =
            snapshot.size;


        }



    });



}









// ===============================
// Delete Account
// ===============================


function deleteAccount(){



    if(!currentUser){

        return;

    }





    const confirmDelete =

    confirm(
        "Are you sure you want to delete your account?"
    );




    if(!confirmDelete){

        return;

    }





    currentUser
    .delete()



    .then(()=>{


        showMessage(
            "Account deleted"
        );


        location.reload();


    })



    .catch(error=>{


        showMessage(
            error.message
        );


    });



}









// ===============================
// Initialize Dashboard
// ===============================


function initializeDashboard(){



    if(!currentUser){

        return;

    }



    loadDashboard();


    loadUserProfile();


    loadProfileImage();


    loadResumes();



}







console.log(
"✅ JobAI Part 3 Loaded Successfully"
);
// =====================================
// JobAI Script.js Professional Version
// Part 4/5
// PRO + Payment + Notifications + Support
// =====================================



// ===============================
// PRO Plans
// ===============================


const proPlans = {


    monthly:{

        name:"JobAI PRO Monthly",

        price:5,

        days:30

    },


    yearly:{

        name:"JobAI PRO Yearly",

        price:50,

        days:365

    }


};









// ===============================
// Check PRO Status
// ===============================


function checkPROStatus(){


    if(!currentUser){

        return;

    }




    db.collection("users")

    .doc(currentUser.uid)

    .get()



    .then(doc=>{


        if(doc.exists){


            const data =
            doc.data();



            isProUser =
            data.pro === true;



            updatePlanDisplay();


        }



    })



    .catch(error=>{


        console.error(error);


    });



}









// ===============================
// Update Plan Display
// ===============================


function updatePlanDisplay(){



    const box =
    document.getElementById(
        "userPlan"
    );



    if(!box){

        return;

    }




    if(isProUser){


        box.innerHTML =
        "⭐ JobAI PRO";


    }

    else{


        box.innerHTML =
        "Free Plan";


    }



}









// ===============================
// Resume Limit
// ===============================


function checkResumeLimit(){



    if(!currentUser){

        return Promise.resolve(false);

    }




    if(isProUser){

        return Promise.resolve(true);

    }





    return db.collection("resumes")

    .where(

        "userId",

        "==",

        currentUser.uid

    )

    .get()



    .then(snapshot=>{


        if(snapshot.size >= 3){


            showMessage(

            "Free plan allows only 3 resumes. Upgrade to PRO."

            );


            return false;


        }



        return true;



    });



}









// ===============================
// Select PRO Plan
// ===============================


function selectPROPlan(plan){



    const selected =
    proPlans[plan];



    if(!selected){


        showMessage(
            "Invalid plan"
        );


        return;

    }





    showMessage(

        selected.name
        +
        "\nPrice: $"
        +
        selected.price
        +
        "\nDuration: "
        +
        selected.days
        +
        " days"

    );



}









// ===============================
// Create Payment Request
// ===============================


function createPaymentRequest(method){



    if(!currentUser){


        showMessage(
            "Please login first"
        );


        return;

    }





    db.collection("transactions")

    .add({



        userId:
        currentUser.uid,



        email:
        currentUser.email,



        method:
        method,



        amount:5,



        status:
        "pending",



        createdAt:

        firebase.firestore.FieldValue.serverTimestamp()



    })



    .then(()=>{


        showMessage(

        "Payment request submitted"

        );


    })



    .catch(error=>{


        showMessage(
            error.message
        );


    });



}









// ===============================
// Payment Methods
// ===============================


function payWithUSDT(){


    createPaymentRequest(
        "USDT"
    );


}




function payWithPayPal(){


    createPaymentRequest(
        "PayPal"
    );


}





function payWithBank(){


    createPaymentRequest(
        "Bank Transfer"
    );


}









// ===============================
// Activate PRO
// ===============================


function activatePRO(){



    if(!currentUser){

        return;

    }





    db.collection("users")

    .doc(currentUser.uid)

    .set({



        pro:true,



        subscription:
        "PRO",



        activatedAt:

        firebase.firestore.FieldValue.serverTimestamp(),




        expiryDate:

        new Date(

            Date.now()
            +
            30 *
            24 *
            60 *
            60 *
            1000

        )



    },{


        merge:true


    })



    .then(()=>{


        isProUser=true;



        updatePlanDisplay();



        showMessage(

        "JobAI PRO Activated"

        );



    })



    .catch(error=>{


        showMessage(
            error.message
        );


    });



}









// ===============================
// Notifications
// ===============================


function createNotification(
message,
type="info"
){



    if(!currentUser){

        return;

    }





    db.collection("notifications")

    .add({



        userId:
        currentUser.uid,



        message:
        message,



        type:
        type,



        read:
        false,



        createdAt:

        firebase.firestore.FieldValue.serverTimestamp()



    });



}









function loadNotifications(){



    if(!currentUser){

        return;

    }





    db.collection("notifications")

    .where(

        "userId",

        "==",

        currentUser.uid

    )



    .get()



    .then(snapshot=>{



        const box =
        document.getElementById(
            "notifications"
        );



        if(!box){

            return;

        }





        box.innerHTML="";





        snapshot.forEach(doc=>{


            const data =
            doc.data();




            box.innerHTML += `

            <div class="notification-card">

            ${data.message}

            </div>

            `;



        });



    });



}









// ===============================
// Support System
// ===============================


function sendSupportMessage(){



    if(!currentUser){


        showMessage(
            "Please login first"
        );


        return;

    }





    const box =
    document.getElementById(
        "supportMessage"
    );



    if(!box){

        return;

    }





    const message =
    box.value.trim();





    if(!message){


        showMessage(
            "Write message"
        );


        return;

    }





    db.collection("supportMessages")

    .add({



        userId:
        currentUser.uid,



        email:
        currentUser.email,



        message:
        message,



        sender:
        "user",



        status:
        "open",



        createdAt:

        firebase.firestore.FieldValue.serverTimestamp()



    })



    .then(()=>{


        box.value="";



        showMessage(
            "Message sent"
        );


    })



    .catch(error=>{


        showMessage(
            error.message
        );


    });



}









// ===============================
// Security Helpers
// ===============================


function requireLogin(){



    if(!currentUser){



        showMessage(
            "Please login first"
        );


        return false;


    }



    return true;



}









function requirePRO(){



    if(!requireLogin()){


        return false;


    }





    if(!isProUser){



        showMessage(

        "This feature requires JobAI PRO"

        );



        return false;


    }




    return true;



}









console.log(
"✅ JobAI Part 4 Loaded Successfully"
);
// =====================================
// JobAI Script.js Professional Version
// Part 5/5
// Public Resume + SEO + Referral + Analytics
// Final System Start
// =====================================



// ===============================
// Create Public Resume
// ===============================


function createPublicResume(){


    if(!currentUser){


        showMessage(
            "Please login first"
        );


        return;

    }





    const data = {


        userId:
        currentUser.uid,



        name:
        getValue("name"),



        jobTitle:
        getValue("jobTitle"),



        skills:
        getValue("skills"),



        summary:
        getValue("summary"),



        public:
        true,



        createdAt:

        firebase.firestore.FieldValue.serverTimestamp()



    };







    db.collection("publicResumes")

    .add(data)



    .then(doc=>{



        const link =

        window.location.origin

        +

        "/resume.html?id="

        +

        doc.id;




        setValue(
            "publicLink",
            link
        );



        showMessage(
            "Public Resume Created"
        );



    })


    .catch(error=>{


        showMessage(
            error.message
        );


    });



}









// ===============================
// Copy Public Link
// ===============================


function copyResumeLink(){


    const box =
    document.getElementById(
        "publicLink"
    );



    if(box && box.value){



        navigator.clipboard
        .writeText(
            box.value
        );



        showMessage(
            "Link copied"
        );


    }



}









// ===============================
// Professional Profile
// ===============================


function createProfessionalProfile(){



    if(!currentUser){


        showMessage(
            "Please login first"
        );


        return;

    }







    const profile = {



        userId:
        currentUser.uid,



        name:
        getValue("profileName")
        ||
        getValue("name"),



        title:
        getValue("jobTitle"),



        skills:
        getValue("skills"),



        public:
        true,



        createdAt:

        firebase.firestore.FieldValue.serverTimestamp()



    };







    db.collection("professionalProfiles")

    .add(profile)



    .then(doc=>{



        const link =


        window.location.origin

        +

        "/profile.html?id="

        +

        doc.id;




        setValue(
            "profileLink",
            link
        );



        showMessage(
            "Professional profile created"
        );



    })



    .catch(error=>{


        showMessage(
            error.message
        );


    });



}









// ===============================
// SEO Description Generator
// ===============================


function generateSEODescription(){



    const box =
    document.getElementById(
        "seoDescription"
    );



    if(!box){

        return;

    }





    box.value =


    getValue("name")

    +

    " - "

    +

    getValue("jobTitle")

    +

    ". Skills: "

    +

    getValue("skills")

    +

    ". Created with JobAI.";





}









// ===============================
// Referral System
// ===============================


function createReferralCode(){



    if(!currentUser){

        return;

    }






    const code =


    "JOBAI-"

    +

    currentUser.uid

    .substring(0,6)

    .toUpperCase();







    db.collection("users")

    .doc(currentUser.uid)

    .set({


        referralCode:
        code


    },{


        merge:true


    })



    .then(()=>{


        setValue(
            "referralCode",
            code
        );


    });



}









function applyReferralCode(){



    if(!currentUser){

        return;

    }





    const code =
    getValue(
        "enterReferral"
    );





    if(!code){


        showMessage(
            "Enter referral code"
        );


        return;

    }






    db.collection("referrals")

    .add({



        userId:
        currentUser.uid,



        code:
        code,



        createdAt:

        firebase.firestore.FieldValue.serverTimestamp()



    })



    .then(()=>{


        showMessage(
            "Referral applied"
        );


    });



}









// ===============================
// Analytics System
// ===============================


function trackActivity(action){



    if(!currentUser){

        return;

    }






    db.collection("analytics")

    .add({



        userId:
        currentUser.uid,



        email:
        currentUser.email,



        action:
        action,



        createdAt:

        firebase.firestore.FieldValue.serverTimestamp()



    });



}









function trackResumeCreated(){



    trackActivity(
        "Resume Created"
    );


}









function trackPDFDownload(){



    trackActivity(
        "PDF Download"
    );


}









// ===============================
// Refresh Dashboard
// ===============================


function refreshDashboard(){



    loadDashboard();


    loadUserProfile();


    loadProfileImage();


    loadResumes();


    loadNotifications();


    checkPROStatus();



}









// ===============================
// Start JobAI System
// ===============================


function startJobAI(){



    if(!currentUser){

        return;

    }




    loadUserStatus();



    loadDashboard();



    loadUserProfile();



    loadProfileImage();



    loadResumes();



    loadNotifications();



    checkPROStatus();




    console.log(
        "🚀 JobAI System Ready"
    );



}









// ===============================
// Final Events
// ===============================



document.addEventListener(
"change",
function(event){



    if(
        event.target.id ===
        "profilePhoto"
    ){


        updatePreviewPhoto();


    }



});








console.log(
"🎉 JobAI All Parts Loaded Successfully"
);


console.log(
"🚀 SCRIPT JS READY"
);
