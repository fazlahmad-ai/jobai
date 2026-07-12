// =====================================
// JobAI Professional Script.js
// Part A: Firebase + Global Setup + Authentication
// =====================================


// ===============================
// Firebase Configuration
// ===============================

const firebaseConfig = {

  apiKey: "AIzaSyCbj3YJiKDLwoCfg1jmljd4ui9NTWgrrYY",

  authDomain: "jobai-c8a18.firebaseapp.com",

  projectId: "jobai-c8a18",

  storageBucket: "jobai-c8a18.appspot.com",

  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

  appId: "YOUR_APP_ID"

};


// Initialize Firebase

if (!firebase.apps.length) {

  firebase.initializeApp(firebaseConfig);

}


const auth = firebase.auth();

const db = firebase.firestore();

const storage = firebase.storage();



// ===============================
// Global Variables
// ===============================


let currentUser = null;

let isProUser = false;

let selectedTemplate = "modern";

const FREE_RESUME_LIMIT = 3;



// ===============================
// Helper Functions
// ===============================


function showMessage(message){

  alert(message);

}



function getValue(id){

  const element =
  document.getElementById(id);


  return element
  ? element.value.trim()
  : "";

}



function setValue(id,value){

  const element =
  document.getElementById(id);


  if(element){

    element.value = value;

  }

}



// ===============================
// Authentication System
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


  .then((result)=>{


    const user =
    result.user;



    return db.collection("users")
    .doc(user.uid)
    .set({

      email:user.email,

      pro:false,

      createdAt:new Date()

    });


  })


  .then(()=>{


    showMessage(
      "Account created successfully!"
    );


  })


  .catch(error=>{


    showMessage(error.message);


  });


}




function login(){


  const email =
  getValue("email");


  const password =
  getValue("password");



  auth
  .signInWithEmailAndPassword(
    email,
    password
  )


  .then(()=>{


    showMessage(
      "Login successful!"
    );


  })


  .catch(error=>{


    showMessage(error.message);


  });


}




function logout(){


  auth.signOut()

  .then(()=>{


    currentUser = null;

    isProUser = false;


    showMessage(
      "Logged out successfully"
    );


    location.reload();


  });


}



// ===============================
// Single Global Auth Listener
// ===============================


auth.onAuthStateChanged((user)=>{


  currentUser = user;



 if(user){

    console.log(
      "Logged in:",
      user.email
    );

    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";

    loadUserStatus();
    initializeResumeSystem();
    initializePROSystem();
    initializeDashboard();
    initializeUserSystems();


 } 

  else{


    console.log(
      "No active user"
    );


  }


});



// ===============================
// User PRO Status
// ===============================


function loadUserStatus(){


  if(!currentUser){

    return;

  }



  db.collection("users")

  .doc(currentUser.uid)

  .get()


  .then((doc)=>{


    if(doc.exists){


      const data =
      doc.data();


      isProUser =
      data.pro === true;


      console.log(
        isProUser
        ? "PRO User"
        : "Free User"
      );


    }


  });


}



console.log(
"JobAI Professional Script Loaded"
);// =====================================
// JobAI Professional Script.js
// Part B: Resume Builder + Templates
// =====================================


// ===============================
// Resume Validation
// ===============================

function validateResume(){

  const name = getValue("name");
  const jobTitle = getValue("jobTitle");
  const skills = getValue("skills");


  if(!name){

    showMessage("Please enter your name");
    return false;

  }


  if(!jobTitle){

    showMessage("Please enter your job title");
    return false;

  }


  if(!skills){

    showMessage("Please add your skills");
    return false;

  }


  return true;

}



// ===============================
// Generate Resume
// ===============================

function generateResume(){


  if(!currentUser){

    showMessage("Please login first");
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


    skills:
    getValue("skills"),


    summary:
    getValue("summary"),


    template:
    selectedTemplate,


    createdAt:
    new Date()

  };




  db.collection("resumes")

  .add(resumeData)


  .then(()=>{


    showMessage(
      "Resume created successfully!"
    );


    previewResume();

    loadResumes();


  })


  .catch(error=>{


    showMessage(error.message);


  });


}




// ===============================
// Load User Resumes
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


    const list =
    document.getElementById(
      "resumeList"
    );


    if(!list){

      return;

    }



    list.innerHTML = "";



    snapshot.forEach(doc=>{


      const data =
      doc.data();



      list.innerHTML += `

      <div class="resume-card">

        <h3>
        ${data.name}
        </h3>


        <p>
        ${data.jobTitle}
        </p>


        <p>
        ${data.skills}
        </p>


        <button onclick="deleteResume('${doc.id}')">
        Delete
        </button>


      </div>

      `;


    });



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


  });


}




// ===============================
// Live Preview
// ===============================


function previewResume(){


  const box =
  document.getElementById("resume");



  if(!box){

    return;

  }



  const name =
  getValue("name");


  const job =
  getValue("jobTitle");


  const skills =
  getValue("skills");


  const summary =
  getValue("summary");



  box.innerHTML = `

  <div class="resume-preview">

    <h1>
    ${name}
    </h1>


    <h2>
    ${job}
    </h2>


    <hr>


    <h3>
    Skills
    </h3>


    <p>
    ${skills}
    </p>


    <h3>
    Summary
    </h3>


    <p>
    ${summary}
    </p>


    <small>
    Created with JobAI
    </small>


  </div>

  `;


}




// Auto Preview

document.addEventListener(
"input",
function(event){


  if(

    event.target.id === "name" ||

    event.target.id === "jobTitle" ||

    event.target.id === "skills" ||

    event.target.id === "summary"

  ){

    previewResume();

  }


});





// ===============================
// Resume Templates
// ===============================


const templates = {


  modern:"modern",

  classic:"classic",

  creative:"creative"


};





function selectTemplate(name){


  if(templates[name]){


    selectedTemplate = name;


    previewResume();


    showMessage(
      "Template changed to " + name
    );


  }


}




// Load Resumes After Login

function initializeResumeSystem(){


  if(currentUser){

    loadResumes();

  }


        }
// =====================================
// JobAI Professional Script.js
// Part C: AI Assistant + Resume Score + Cover Letter + PDF
// =====================================


// ===============================
// AI Resume Summary Generator
// ===============================

function generateAISummary(){

  const jobTitle =
  getValue("jobTitle");


  const skills =
  getValue("skills");


  const summaryBox =
  document.getElementById("summary");



  if(!summaryBox){

    return;

  }



  if(jobTitle && skills){


    summaryBox.value =
    `Professional ${jobTitle} with skills in ${skills}. 
Experienced in problem solving, teamwork and continuous professional growth.`;

  }

  else{


    summaryBox.value =
    "Motivated professional with strong skills and commitment to career development.";

  }


  previewResume();

}




// ===============================
// AI Skill Suggestions
// ===============================

function suggestSkills(){


  const jobTitle =
  getValue("jobTitle")
  .toLowerCase();



  let skills =
  "Communication, Teamwork, Problem Solving";



  if(jobTitle.includes("developer")){


    skills =
    "JavaScript, HTML, CSS, React, Git";


  }

  else if(jobTitle.includes("teacher")){


    skills =
    "Teaching, Research, Presentation, Communication";


  }

  else if(jobTitle.includes("manager")){


    skills =
    "Leadership, Planning, Management, Organization";


  }



  setValue(
    "skills",
    skills
  );


  previewResume();


}




// ===============================
// Resume Score System
// ===============================


function calculateResumeScore(){


  let score = 0;



  if(getValue("name")){

    score += 25;

  }



  if(getValue("jobTitle")){

    score += 25;

  }



  if(getValue("skills")){

    score += 30;

  }



  if(getValue("summary")){

    score += 20;

  }



  showResumeScore(score);


}





function showResumeScore(score){


  const box =
  document.getElementById(
    "resumeScore"
  );



  if(!box){

    return;

  }



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
    ? "Excellent Resume"
    : "Improve your resume"
  }
  </p>

  `;


}






// ===============================
// AI Resume Suggestions
// ===============================


function getResumeSuggestions(){


  const box =
  document.getElementById(
    "suggestions"
  );



  if(!box){

    return;

  }



  box.innerHTML = `

  <h3>
  AI Suggestions
  </h3>


  <ul>

  <li>Add measurable achievements</li>

  <li>Use professional keywords</li>

  <li>Highlight important skills</li>

  <li>Keep resume clear and simple</li>

  </ul>

  `;


}






// ===============================
// Cover Letter Generator
// ===============================


function generateCoverLetter(){


  const name =
  getValue("name");


  const job =
  getValue("jobTitle");


  const skills =
  getValue("skills");



  const box =
  document.getElementById(
    "coverLetter"
  );



  if(!box){

    return;

  }



  box.value = `

Dear Hiring Manager,


I am ${name}, applying for the position of ${job}.


I have strong skills in ${skills} and I believe my experience and dedication can bring value to your organization.


I am motivated to learn, grow and contribute professionally.


Thank you for considering my application.


Sincerely,

${name}

  `;


}






// ===============================
// Save Cover Letter
// ===============================


function saveCoverLetter(){


  if(!currentUser){

    showMessage(
      "Please login first"
    );

    return;

  }



  const content =
  getValue("coverLetter");



  db.collection("coverLetters")

  .add({

    userId:
    currentUser.uid,


    content:
    content,


    createdAt:
    new Date()

  })


  .then(()=>{


    showMessage(
      "Cover letter saved"
    );


  });


}







// ===============================
// PDF Download System
// ===============================


function downloadPDF(){


  const resume =
  document.getElementById(
    "resume"
  );



  if(!resume){

    showMessage(
      "Resume not found"
    );

    return;

  }



  html2pdf()

  .set({

    margin:10,

    filename:
    "JobAI-Resume.pdf",

    html2canvas:{
      scale:2
    },


    jsPDF:{
      format:"a4",
      orientation:"portrait"
    }


  })


  .from(resume)

  .save();


}





function downloadCoverLetterPDF(){


  const letter =
  document.getElementById(
    "coverLetter"
  );



  if(!letter){

    return;

  }



  html2pdf()

  .from(letter)

  .save(
    "JobAI-Cover-Letter.pdf"
  );


}
// =====================================
// JobAI Professional Script.js
// Part D: PRO System + Subscription + Payment
// =====================================


// ===============================
// PRO Plans
// ===============================

const proPlans = {

  monthly: {

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



  box.innerHTML =
  isProUser
  ? "⭐ JobAI PRO"
  : "Free Plan";


}






// ===============================
// Free Resume Limit
// ===============================


function checkResumeLimit(){


  if(!currentUser){

    return false;

  }



  if(isProUser){

    return true;

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
        "Free users can create only 3 resumes. Upgrade to PRO."
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

    selected.name +

    "\nPrice: $" +

    selected.price +

    "\nDuration: " +

    selected.days +

    " days"

  );


}






// ===============================
// Save Payment Request
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


    amount:
    5,


    status:
    "pending",


    createdAt:
    new Date()


  })


  .then(()=>{


    showMessage(
      "Payment request submitted"
    );


  });


}





// Payment Methods

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
    new Date(),


    expiryDate:
    new Date(
      Date.now()
      +
      30*24*60*60*1000
    )


  },{merge:true})


  .then(()=>{


    isProUser = true;


    updatePlanDisplay();


    showMessage(
      "JobAI PRO activated!"
    );


  });


}





// ===============================
// Check Subscription Expiry
// ===============================


function checkSubscription(){


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



      if(data.expiryDate){


        const expiry =
        data.expiryDate.toDate
        ? data.expiryDate.toDate()
        : new Date(data.expiryDate);



        if(new Date() > expiry){


          isProUser = false;



          db.collection("users")

          .doc(currentUser.uid)

          .update({

            pro:false

          });


          updatePlanDisplay();


        }


      }


    }


  });


}






// ===============================
// Load PRO System After Login
// ===============================


function initializePROSystem(){


  if(currentUser){


    checkPROStatus();


    checkSubscription();


  }


}
// =====================================
// JobAI Professional Script.js
// Part E: Dashboard + Profile Management
// =====================================


// ===============================
// User Dashboard
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

    emailBox.innerHTML =
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


    const countBox =
    document.getElementById(
      "dashboardResumeCount"
    );



    if(countBox){

      countBox.innerHTML =
      snapshot.size;

    }


  });



  const planBox =
  document.getElementById(
    "dashboardPlan"
  );



  if(planBox){

    planBox.innerHTML =
    isProUser
    ? "⭐ JobAI PRO"
    : "Free Plan";

  }


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
    new Date()


  };





  db.collection("users")

  .doc(currentUser.uid)

  .set(
    profile,
    {merge:true}
  )


  .then(()=>{


    showMessage(
      "Profile saved successfully"
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
        data.name || ""
      );


      setValue(
        "profilePhone",
        data.phone || ""
      );


      setValue(
        "profileLocation",
        data.location || ""
      );


      setValue(
        "profileBio",
        data.bio || ""
      );


    }


  });


}






// ===============================
// Profile Image Upload
// ===============================


function uploadProfileImage(){


  if(!currentUser){

    showMessage(
      "Please login first"
    );

    return;

  }



  const fileInput =
  document.getElementById(
    "profileImage"
  );



  if(!fileInput || !fileInput.files[0]){


    showMessage(
      "Select image first"
    );

    return;

  }



  const file =
  fileInput.files[0];



  const ref =
  storage.ref(
    "profileImages/"
    +
    currentUser.uid
  );



  ref.put(file)


  .then(()=>{


    return ref.getDownloadURL();


  })


  .then(url=>{


    return db.collection("users")

    .doc(currentUser.uid)

    .set({

      photoURL:url

    },{merge:true});


  })


  .then(()=>{


    showMessage(
      "Profile image uploaded"
    );


    loadProfileImage();


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



      if(img && data.photoURL){


        img.src =
        data.photoURL;


      }


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
    "Delete your account?"
  );



  if(confirmDelete){


    currentUser.delete()


    .then(()=>{


      showMessage(
        "Account deleted"
      );


      location.reload();


    });


  }


}







// ===============================
// User Activity Report
// ===============================


function generateUserReport(){


  if(!currentUser){

    return;

  }



  db.collection("analytics")

  .where(
    "userId",
    "==",
    currentUser.uid
  )

  .get()


  .then(snapshot=>{


    const box =
    document.getElementById(
      "userReport"
    );



    if(box){


      box.innerHTML = `

      <h3>
      JobAI Report
      </h3>

      <p>
      Activities:
      ${snapshot.size}
      </p>

      <p>
      Account:
      ${currentUser.email}
      </p>

      `;


    }


  });


}






// ===============================
// Initialize Dashboard
// ===============================


function initializeDashboard(){


  if(currentUser){


    loadDashboard();

    loadUserProfile();

    loadProfileImage();

    generateUserReport();


  }


}
// =====================================
// JobAI Professional Script.js
// Part F: Notifications + Support + Security + Analytics
// =====================================


// ===============================
// Notification System
// ===============================


function createNotification(message,type="info"){


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


    read:false,


    createdAt:
    new Date()


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

  .orderBy(
    "createdAt",
    "desc"
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
// Support Chat System
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
      "Write a message"
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
    new Date()


  })


  .then(()=>{


    box.value="";


    showMessage(
      "Message sent"
    );


    loadSupportMessages();


  });


}






function loadSupportMessages(){


  if(!currentUser){

    return;

  }



  db.collection("supportMessages")

  .where(
    "userId",
    "==",
    currentUser.uid
  )

  .orderBy(
    "createdAt",
    "asc"
  )

  .get()


  .then(snapshot=>{


    const chat =
    document.getElementById(
      "chatBox"
    );



    if(!chat){

      return;

    }



    chat.innerHTML="";



    snapshot.forEach(doc=>{


      const data =
      doc.data();



      chat.innerHTML += `

      <div class="chat-message">

      <b>
      ${data.sender}
      </b>

      <p>
      ${data.message}
      </p>

      </div>

      `;


    });


  });


}







// ===============================
// Security System
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
      "PRO feature only"
    );


    return false;


  }



  return true;


}





function secureDownloadPDF(){


  if(requirePRO()){


    downloadPDF();


  }


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
    new Date()


  });


}






function trackResumeCreated(){


  trackActivity(
    "Created Resume"
  );


}





function trackPDFDownload(){


  trackActivity(
    "Downloaded PDF"
  );


}






// ===============================
// Global Initializer
// ===============================


function initializeUserSystems(){


  if(currentUser){


    checkPROStatus();


    loadDashboard();


    loadNotifications();


    loadSupportMessages();


  }


}
// =====================================
// JobAI Professional Script.js
// Part G: Public Resume + Referral + SEO + Final SaaS
// =====================================


// ===============================
// Public Resume Sharing
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


    public:true,


    createdAt:
    new Date()


  };



  db.collection("publicResumes")

  .add(data)


  .then(doc=>{


    const link =
    window.location.origin +
    "/resume.html?id=" +
    doc.id;



    const box =
    document.getElementById(
      "publicLink"
    );



    if(box){

      box.value =
      link;

    }



    showMessage(
      "Public resume created"
    );


  });


}







function copyResumeLink(){


  const box =
  document.getElementById(
    "publicLink"
  );



  if(box){


    navigator.clipboard.writeText(
      box.value
    );


    showMessage(
      "Link copied"
    );


  }


}






// ===============================
// Professional Profile SEO
// ===============================


function createProfessionalProfile(){


  if(!currentUser){

    return;

  }



  const profile = {


    userId:
    currentUser.uid,


    name:
    getValue("profileName"),


    title:
    getValue("jobTitle"),


    skills:
    getValue("skills"),


    public:true,


    createdAt:
    new Date()


  };



  db.collection("professionalProfiles")

  .add(profile)


  .then(doc=>{


    const link =
    window.location.origin +
    "/profile.html?id=" +
    doc.id;



    const box =
    document.getElementById(
      "profileLink"
    );



    if(box){

      box.value =
      link;

    }



    showMessage(
      "Professional profile created"
    );


  });


}







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

  ". Professional skills: "

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

  },{merge:true})



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
    new Date()


  })



  .then(()=>{


    showMessage(
      "Referral applied"
    );


  });


}







// ===============================
// SaaS Dashboard Refresh
// ===============================


function refreshDashboard(){


  loadDashboard();

  generateUserReport();

  loadNotifications();


}







// ===============================
// Start Complete JobAI System
// ===============================


function startJobAI(){

  initializePROSystem();

  initializeDashboard();

  initializeUserSystems();

  createReferralCode();

  createNotification(
    "Welcome back to JobAI",
    "success"
  );

  console.log(
    "JobAI SaaS System Ready"
  );

}

