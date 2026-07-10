// =====================================
// JobAI Script.js
// Part 1: Firebase Configuration
// =====================================

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCbj3YJiKDLwoCfg1jmljd4ui9NTWgrrYY",
  authDomain: "jobai-c8a18.firebaseapp.com",
  projectId: "jobai-c8a18",
  storageBucket: "jobai-c8a18.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

console.log("Firebase Connected - JobAI");
// =====================================
// Part 2: Authentication System
// =====================================

// Sign Up
function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert("Account created successfully!");
      console.log(userCredential.user);
    })
    .catch((error) => {
      alert(error.message);
    });
}


// Login
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert("Login successful!");
      console.log(userCredential.user);
    })
    .catch((error) => {
      alert(error.message);
    });
}


// Logout
function logout() {
  auth.signOut()
    .then(() => {
      alert("Logged out successfully!");
    })
    .catch((error) => {
      alert(error.message);
    });
}


// Check user status
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User logged in:", user.email);
  } else {
    console.log("No user logged in");
  }
});
// =====================================
// Part 3: Resume Generator & Firestore Save
// =====================================

// Generate Resume
function generateResume() {

  const name = document.getElementById("name").value;
  const jobTitle = document.getElementById("jobTitle").value;
  const skills = document.getElementById("skills").value;

  const resumeData = {
    name: name,
    jobTitle: jobTitle,
    skills: skills,
    userId: auth.currentUser ? auth.currentUser.uid : null,
    createdAt: new Date()
  };


  // Save Resume to Firestore
  if (auth.currentUser) {

    db.collection("resumes")
      .add(resumeData)
      .then(() => {
        alert("Resume created successfully!");
        loadResumes();
      })
      .catch((error) => {
        alert(error.message);
      });

  } else {

    alert("Please login first!");

  }
}


// Load User Resumes
function loadResumes() {

  if (!auth.currentUser) return;

  db.collection("resumes")
    .where("userId", "==", auth.currentUser.uid)
    .get()
    .then((snapshot) => {

      let resumeList = document.getElementById("resumeList");

      if (!resumeList) return;

      resumeList.innerHTML = "";

      snapshot.forEach((doc) => {

        const data = doc.data();

        resumeList.innerHTML += `
          <div class="resume-card">
            <h3>${data.name}</h3>
            <p>${data.jobTitle}</p>
            <p>${data.skills}</p>
          </div>
        `;

      });

    });

}


// Load resumes when user logs in
auth.onAuthStateChanged((user) => {

  if (user) {
    loadResumes();
  }

});
// =====================================
// Part 4: Edit, Delete & Download PDF
// =====================================


// Delete Resume
function deleteResume(id) {

  db.collection("resumes")
    .doc(id)
    .delete()
    .then(() => {

      alert("Resume deleted successfully!");
      loadResumes();

    })
    .catch((error) => {

      alert(error.message);

    });

}


// Edit Resume
function editResume(id) {

  const newName = prompt("Enter new name:");

  if (newName) {

    db.collection("resumes")
      .doc(id)
      .update({
        name: newName
      })
      .then(() => {

        alert("Resume updated successfully!");
        loadResumes();

      })
      .catch((error) => {

        alert(error.message);

      });

  }

}


// Download Resume PDF
function downloadPDF() {

  const resume = document.getElementById("resume");

  if (!resume) {

    alert("Resume area not found!");
    return;

  }


  const options = {
    margin: 10,
    filename: "JobAI-Resume.pdf",
    image: {
      type: "jpeg",
      quality: 0.98
    },
    html2canvas: {
      scale: 2
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    }
  };


  html2pdf()
    .set(options)
    .from(resume)
    .save();

}
// =====================================
// Part 5: Live Resume Preview & PRO System
// =====================================


// Live Resume Preview
function previewResume() {

  const name = document.getElementById("name").value;
  const jobTitle = document.getElementById("jobTitle").value;
  const skills = document.getElementById("skills").value;


  const preview = document.getElementById("resume");


  if (!preview) return;


  preview.innerHTML = `
    <div class="resume-preview">
      <h1>${name}</h1>
      <h2>${jobTitle}</h2>

      <hr>

      <h3>Skills</h3>
      <p>${skills}</p>

      <p class="brand">
        Created with JobAI
      </p>
    </div>
  `;

}


// Auto preview while typing
document.addEventListener("input", function(event){

  if(
    event.target.id === "name" ||
    event.target.id === "jobTitle" ||
    event.target.id === "skills"
  ){

    previewResume();

  }

});


// =====================================
// PRO Feature Check
// =====================================

let isProUser = false;


// Check PRO access
function checkProAccess(){

  if(isProUser){

    return true;

  }else{

    alert("This feature is available for JobAI PRO users.");
    return false;

  }

}


// PRO PDF Download
function downloadProPDF(){

  if(checkProAccess()){

    downloadPDF();

  }

}
// =====================================
// Part 6: PRO Membership & User Dashboard
// =====================================


// Upgrade User To PRO
function upgradeToPRO(){

  const user = auth.currentUser;

  if(!user){

    alert("Please login first!");
    return;

  }


  db.collection("users")
    .doc(user.uid)
    .set({

      email: user.email,
      pro: true,
      upgradedAt: new Date()

    }, {merge:true})

    .then(()=>{

      alert("Congratulations! You are now JobAI PRO.");

      isProUser = true;

    })

    .catch((error)=>{

      alert(error.message);

    });

}



// Check User PRO Status
function checkUserPRO(){

  const user = auth.currentUser;

  if(!user) return;


  db.collection("users")
    .doc(user.uid)
    .get()

    .then((doc)=>{

      if(doc.exists){

        const data = doc.data();

        if(data.pro === true){

          isProUser = true;

          console.log("PRO User Active");

        }else{

          isProUser = false;

          console.log("Free User");

        }

      }

    });

}



// Run PRO Check After Login
auth.onAuthStateChanged((user)=>{

  if(user){

    checkUserPRO();

  }

});
// =====================================
// Part 7: User Dashboard System
// =====================================


// Load User Dashboard
function loadDashboard(){

  const user = auth.currentUser;

  if(!user){

    return;

  }


  const userEmail = document.getElementById("userEmail");
  const resumeCount = document.getElementById("resumeCount");


  if(userEmail){

    userEmail.innerHTML = user.email;

  }


  db.collection("resumes")
    .where("userId","==",user.uid)
    .get()

    .then((snapshot)=>{

      if(resumeCount){

        resumeCount.innerHTML = snapshot.size;

      }

    });

}



// Show Dashboard After Login
auth.onAuthStateChanged((user)=>{

  if(user){

    loadDashboard();

  }

});



// Update Profile Name
function updateProfile(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return;

  }


  const displayName = document.getElementById("profileName").value;


  user.updateProfile({

    displayName: displayName

  })

  .then(()=>{

    alert("Profile updated successfully!");

  })

  .catch((error)=>{

    alert(error.message);

  });

}
// =====================================
// Part 8: Resume Templates System
// =====================================


// Default Template
let selectedTemplate = "modern";


// Select Resume Template
function selectTemplate(templateName){

  selectedTemplate = templateName;

  previewResume();

  alert("Template changed to " + templateName);

}



// Generate Template Design
function getTemplateStyle(){

  if(selectedTemplate === "classic"){

    return `
      <div class="classic-template">
        <h1>{{name}}</h1>
        <h2>{{jobTitle}}</h2>
        <hr>
        <h3>Skills</h3>
        <p>{{skills}}</p>
      </div>
    `;

  }


  if(selectedTemplate === "creative"){

    return `
      <div class="creative-template">
        <h1>✨ {{name}}</h1>
        <h2>{{jobTitle}}</h2>
        <h3>My Skills</h3>
        <p>{{skills}}</p>
      </div>
    `;

  }


  return `
    <div class="modern-template">
      <h1>{{name}}</h1>
      <h2>{{jobTitle}}</h2>
      <h3>Professional Skills</h3>
      <p>{{skills}}</p>
    </div>
  `;

}



// Generate Resume With Selected Template
function generateTemplateResume(){

  const name = document.getElementById("name").value;
  const jobTitle = document.getElementById("jobTitle").value;
  const skills = document.getElementById("skills").value;


  let template = getTemplateStyle();


  template = template
    .replace("{{name}}", name)
    .replace("{{jobTitle}}", jobTitle)
    .replace("{{skills}}", skills);


  const resume = document.getElementById("resume");


  if(resume){

    resume.innerHTML = template;

  }

}
// =====================================
// Part 9: AI Resume Assistant
// =====================================


// Generate Professional Summary
function generateAISummary(){

  const jobTitle = document.getElementById("jobTitle").value;
  const skills = document.getElementById("skills").value;

  const summaryBox = document.getElementById("summary");


  if(!summaryBox){

    return;

  }


  let summary = "";


  if(jobTitle && skills){

    summary =
    "Professional " + jobTitle +
    " with experience in " +
    skills +
    ". Skilled in problem solving, teamwork and professional development.";

  }else{

    summary =
    "Motivated professional with strong skills and a commitment to career growth.";

  }


  summaryBox.value = summary;

}



// AI Skill Suggestions
function suggestSkills(){

  const jobTitle = document.getElementById("jobTitle").value;

  const skillsBox = document.getElementById("skills");


  if(!skillsBox){

    return;

  }


  let suggestions = "";


  if(jobTitle.toLowerCase().includes("developer")){

    suggestions =
    "JavaScript, HTML, CSS, React, Problem Solving";

  }

  else if(jobTitle.toLowerCase().includes("manager")){

    suggestions =
    "Leadership, Communication, Planning, Team Management";

  }

  else if(jobTitle.toLowerCase().includes("teacher")){

    suggestions =
    "Teaching, Research, Communication, Presentation";

  }

  else{

    suggestions =
    "Communication, Teamwork, Time Management, Problem Solving";

  }


  skillsBox.value = suggestions;

}



// Improve Existing Resume Text
function improveResumeText(){

  const skills = document.getElementById("skills");


  if(!skills){

    return;

  }


  skills.value =
  skills.value +
  ", Professional Growth, Adaptability, Critical Thinking";


  alert("Resume skills improved with AI suggestions!");

}
// =====================================
// Part 10: Language & User Settings
// =====================================


// Default Language
let currentLanguage = "en";


// Change Language
function changeLanguage(language){

  currentLanguage = language;


  if(language === "fa"){

    document.documentElement.lang = "fa";
    document.body.dir = "rtl";

    translatePersian();

  }else{

    document.documentElement.lang = "en";
    document.body.dir = "ltr";

    translateEnglish();

  }

}



// Persian Translation
function translatePersian(){

  const title = document.querySelector("h1");

  if(title){

    title.innerHTML = "ساخت رزومه حرفه‌ای با JobAI";

  }


  const button = document.getElementById("generateBtn");

  if(button){

    button.innerHTML = "ساخت رزومه";

  }

}



// English Translation
function translateEnglish(){

  const title = document.querySelector("h1");

  if(title){

    title.innerHTML = "Create Professional Resume with JobAI";

  }


  const button = document.getElementById("generateBtn");

  if(button){

    button.innerHTML = "Generate Resume";

  }

}



// Save User Settings
function saveSettings(){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("users")
    .doc(user.uid)
    .set({

      language: currentLanguage,
      updatedAt: new Date()

    }, {merge:true})


    .then(()=>{

      console.log("Settings saved");

    });

}



// Load User Settings
function loadSettings(){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("users")
    .doc(user.uid)
    .get()

    .then((doc)=>{

      if(doc.exists){

        const data = doc.data();


        if(data.language){

          changeLanguage(data.language);

        }

      }

    });

}



// Load settings after login
auth.onAuthStateChanged((user)=>{

  if(user){

    loadSettings();

  }

});
// =====================================
// Part 11: Free Limit & PRO Security System
// =====================================


// Free User Resume Limit
const FREE_RESUME_LIMIT = 3;


// Check Resume Permission
function canCreateResume(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return false;

  }


  return db.collection("resumes")
    .where("userId","==",user.uid)
    .get()

    .then((snapshot)=>{


      if(isProUser){

        return true;

      }


      if(snapshot.size >= FREE_RESUME_LIMIT){

        alert(
          "Free users can create only 3 resumes. Upgrade to JobAI PRO."
        );

        return false;

      }


      return true;


    });

}



// Secure Resume Creation
function createSecureResume(){

  canCreateResume()

  .then((allowed)=>{


    if(allowed){

      generateResume();

    }


  });

}



// Show User Plan
function showUserPlan(){

  const planBox = document.getElementById("userPlan");


  if(!planBox){

    return;

  }


  if(isProUser){

    planBox.innerHTML = "⭐ JobAI PRO";

  }else{

    planBox.innerHTML = "Free Plan";

  }

}



// Update Plan After Login
auth.onAuthStateChanged((user)=>{


  if(user){

    checkUserPRO();

    setTimeout(()=>{

      showUserPlan();

    },1000);

  }


});
// =====================================
// Part 12: PRO Subscription Management
// =====================================


// Subscription Plans
const subscriptionPlans = {

  monthly: {
    name: "JobAI PRO Monthly",
    price: 5,
    duration: "30 days"
  },

  yearly: {
    name: "JobAI PRO Yearly",
    price: 50,
    duration: "365 days"
  }

};



// Select Plan
function selectPlan(planName){

  const plan = subscriptionPlans[planName];


  if(!plan){

    alert("Invalid plan selected");
    return;

  }


  alert(
    plan.name +
    "\nPrice: $" +
    plan.price +
    "\nDuration: " +
    plan.duration
  );


}



// Activate PRO Manually After Payment
function activatePRO(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return;

  }


  db.collection("users")
    .doc(user.uid)
    .set({

      pro: true,

      subscription: "PRO",

      activatedAt: new Date(),

      expiryDate:
      new Date(
        Date.now() + 30*24*60*60*1000
      )

    }, {merge:true})


    .then(()=>{


      isProUser = true;


      alert(
        "JobAI PRO activated successfully!"
      );


    })

    .catch((error)=>{


      alert(error.message);


    });


}



// Check Subscription Expiry
function checkSubscriptionExpiry(){

  const user = auth.currentUser;


  if(!user) return;



  db.collection("users")
  .doc(user.uid)
  .get()

  .then((doc)=>{


    if(doc.exists){


      const data = doc.data();


      if(data.expiryDate){


        const expiry =
        data.expiryDate.toDate
        ? data.expiryDate.toDate()
        : new Date(data.expiryDate);



        if(new Date() > expiry){


          isProUser = false;


          db.collection("users")
          .doc(user.uid)
          .update({

            pro:false

          });


        }


      }


    }


  });


}



// Run Subscription Check
auth.onAuthStateChanged((user)=>{


  if(user){

    checkSubscriptionExpiry();

  }


});
// =====================================
// Part 13: Payment & Transaction System
// =====================================


// Save Payment Transaction
function saveTransaction(paymentMethod, amount){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return;

  }


  const transactionData = {

    userId: user.uid,

    email: user.email,

    method: paymentMethod,

    amount: amount,

    status: "pending",

    createdAt: new Date()

  };



  db.collection("transactions")
    .add(transactionData)

    .then(()=>{

      alert(
        "Payment request submitted successfully!"
      );

    })

    .catch((error)=>{

      alert(error.message);

    });

}



// Payment Methods

function payWithUSDT(){

  saveTransaction(
    "USDT",
    5
  );

}



function payWithPayPal(){

  saveTransaction(
    "PayPal",
    5
  );

}



function payWithBank(){

  saveTransaction(
    "Bank Transfer",
    5
  );

}



// Admin Confirm Payment
function confirmPayment(transactionId){

  db.collection("transactions")
  .doc(transactionId)

  .update({

    status:"approved"

  })

  .then(()=>{


    alert(
      "Payment approved"
    );


  })

  .catch((error)=>{


    alert(error.message);


  });

}



// Activate PRO After Approval
function activateAfterPayment(){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("transactions")
  .where("userId","==",user.uid)
  .where("status","==","approved")
  .get()

  .then((snapshot)=>{


    if(!snapshot.empty){


      activatePRO();


    }else{


      alert(
        "No approved payment found"
      );


    }


  });


}
// =====================================
// Part 14: Admin Dashboard System
// =====================================


// Admin UID
const ADMIN_UID = "YOUR_ADMIN_UID";


// Check Admin Access
function checkAdmin(){

  const user = auth.currentUser;


  if(!user){

    return false;

  }


  if(user.uid === ADMIN_UID){

    return true;

  }


  return false;

}



// Load All Users (Admin Only)
function loadUsers(){

  if(!checkAdmin()){

    alert("Access denied!");
    return;

  }


  db.collection("users")
  .get()

  .then((snapshot)=>{


    const userList =
    document.getElementById("userList");


    if(!userList){

      return;

    }


    userList.innerHTML = "";


    snapshot.forEach((doc)=>{


      const user = doc.data();


      userList.innerHTML += `

        <div class="admin-card">

          <h3>${user.email || "User"}</h3>

          <p>
          Plan:
          ${user.pro ? "PRO" : "Free"}
          </p>

        </div>

      `;


    });


  });


}



// Load Transactions (Admin Only)
function loadTransactions(){

  if(!checkAdmin()){

    alert("Access denied!");
    return;

  }


  db.collection("transactions")
  .get()

  .then((snapshot)=>{


    const box =
    document.getElementById("transactionList");


    if(!box){

      return;

    }


    box.innerHTML = "";


    snapshot.forEach((doc)=>{


      const data = doc.data();


      box.innerHTML += `

      <div class="admin-card">

        <p>Email:
        ${data.email}</p>

        <p>Method:
        ${data.method}</p>

        <p>Amount:
        $${data.amount}</p>

        <p>Status:
        ${data.status}</p>


      </div>

      `;


    });


  });


}



// Open Admin Dashboard
function openAdminPanel(){

  if(checkAdmin()){

    loadUsers();

    loadTransactions();


  }else{

    alert(
      "You are not an administrator"
    );

  }

}
// =====================================
// Part 15: AI Resume Score System
// =====================================


// Calculate Resume Score
function calculateResumeScore(){

  const name = document.getElementById("name").value;
  const jobTitle = document.getElementById("jobTitle").value;
  const skills = document.getElementById("skills").value;
  const summary = document.getElementById("summary");


  let score = 0;


  if(name.trim() !== ""){

    score += 25;

  }


  if(jobTitle.trim() !== ""){

    score += 25;

  }


  if(skills.trim() !== ""){

    score += 30;

  }


  if(summary && summary.value.trim() !== ""){

    score += 20;

  }



  showResumeScore(score);

}



// Display Score
function showResumeScore(score){

  const scoreBox =
  document.getElementById("resumeScore");


  if(!scoreBox){

    return;

  }


  scoreBox.innerHTML = `

    <h3>AI Resume Score</h3>

    <h2>${score}%</h2>

    <p>
    ${getScoreMessage(score)}
    </p>

  `;

}



// Score Feedback
function getScoreMessage(score){


  if(score >= 90){

    return "Excellent! Your resume is ready for applications.";

  }


  if(score >= 70){

    return "Good resume. Add more achievements to improve it.";

  }


  if(score >= 50){

    return "Average. Complete more sections.";

  }


  return "Needs improvement. Add your skills and experience.";


}



// AI Improvement Suggestions
function getResumeSuggestions(){

  const suggestions =
  document.getElementById("suggestions");


  if(!suggestions){

    return;

  }


  suggestions.innerHTML = `

    <h3>AI Suggestions</h3>

    <ul>

      <li>Add measurable achievements.</li>

      <li>Use professional job keywords.</li>

      <li>Highlight your strongest skills.</li>

      <li>Keep your resume clear and simple.</li>

    </ul>

  `;

}
// =====================================
// Part 16: AI Cover Letter Generator
// =====================================


// Generate Cover Letter
function generateCoverLetter(){

  const name =
  document.getElementById("name").value;

  const jobTitle =
  document.getElementById("jobTitle").value;

  const skills =
  document.getElementById("skills").value;


  const coverLetterBox =
  document.getElementById("coverLetter");


  if(!coverLetterBox){

    return;

  }



  let letter = `

Dear Hiring Manager,


I am ${name}, applying for the position of ${jobTitle}.


I have strong skills in ${skills} and I am motivated to contribute my knowledge and experience to your organization.


I believe my abilities, dedication, and willingness to learn make me a strong candidate for this opportunity.


Thank you for considering my application. I look forward to the opportunity to discuss my qualifications.


Sincerely,

${name}

  `;


  coverLetterBox.value = letter;


}



// Save Cover Letter
function saveCoverLetter(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return;

  }


  const letter =
  document.getElementById("coverLetter").value;



  db.collection("coverLetters")
  .add({

    userId:user.uid,

    content:letter,

    createdAt:new Date()

  })


  .then(()=>{

    alert(
      "Cover Letter saved successfully!"
    );

  })


  .catch((error)=>{

    alert(error.message);

  });


}



// Download Cover Letter PDF
function downloadCoverLetterPDF(){


  const letter =
  document.getElementById("coverLetter");


  if(!letter){

    alert("Cover letter not found!");
    return;

  }


  html2pdf()

  .from(letter)

  .save("JobAI-Cover-Letter.pdf");


}
// =====================================
// Part 17: Resume Version History System
// =====================================


// Save Resume Version
function saveResumeVersion(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return;

  }


  const resumeData = {

    userId: user.uid,

    name: document.getElementById("name").value,

    jobTitle: document.getElementById("jobTitle").value,

    skills: document.getElementById("skills").value,

    summary: document.getElementById("summary")
    ? document.getElementById("summary").value
    : "",

    template: selectedTemplate,

    createdAt: new Date()

  };


  db.collection("resumeHistory")

  .add(resumeData)

  .then(()=>{

    alert(
      "Resume version saved!"
    );

  })

  .catch((error)=>{

    alert(error.message);

  });


}



// Load Resume History
function loadResumeHistory(){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("resumeHistory")

  .where("userId","==",user.uid)

  .orderBy("createdAt","desc")

  .get()


  .then((snapshot)=>{


    const historyBox =
    document.getElementById("resumeHistory");


    if(!historyBox){

      return;

    }


    historyBox.innerHTML = "";


    snapshot.forEach((doc)=>{


      const data = doc.data();


      historyBox.innerHTML += `

      <div class="history-card">

        <h3>${data.name}</h3>

        <p>${data.jobTitle}</p>

        <button onclick="restoreResume('${doc.id}')">
        Restore
        </button>

      </div>

      `;


    });


  });


}



// Restore Old Resume Version
function restoreResume(id){


  db.collection("resumeHistory")

  .doc(id)

  .get()


  .then((doc)=>{


    if(doc.exists){


      const data = doc.data();


      document.getElementById("name").value =
      data.name;


      document.getElementById("jobTitle").value =
      data.jobTitle;


      document.getElementById("skills").value =
      data.skills;


      if(document.getElementById("summary")){

        document.getElementById("summary").value =
        data.summary;

      }


      selectedTemplate =
      data.template;


      previewResume();


      alert(
        "Previous version restored!"
      );


    }


  });


}



// Load History After Login
auth.onAuthStateChanged((user)=>{


  if(user){

    loadResumeHistory();

  }


});
// =====================================
// Part 18: AI Job Matching System
// =====================================


// Job Database Example
const jobsDatabase = [

  {
    title: "Web Developer",
    skills: "JavaScript HTML CSS React"
  },

  {
    title: "Project Manager",
    skills: "Leadership Planning Communication"
  },

  {
    title: "Teacher",
    skills: "Teaching Research Communication"
  },

  {
    title: "Data Analyst",
    skills: "Excel Python Data Analysis"
  }

];



// Find Matching Jobs
function findMatchingJobs(){

  const userSkills =
  document.getElementById("skills").value
  .toLowerCase();


  const resultBox =
  document.getElementById("jobResults");


  if(!resultBox){

    return;

  }


  resultBox.innerHTML = "";



  jobsDatabase.forEach((job)=>{


    let matchScore = 0;


    const jobSkills =
    job.skills.toLowerCase();



    userSkills.split(",")
    .forEach((skill)=>{


      if(jobSkills.includes(skill.trim())){

        matchScore += 25;

      }


    });



    if(matchScore > 0){


      resultBox.innerHTML += `

      <div class="job-card">

        <h3>${job.title}</h3>

        <p>
        Match Score:
        ${matchScore}%
        </p>

        <p>
        Required Skills:
        ${job.skills}
        </p>

      </div>

      `;


    }


  });


}



// Improve Resume For Job
function optimizeResumeForJob(jobSkills){


  const skillsBox =
  document.getElementById("skills");


  if(!skillsBox){

    return;

  }


  skillsBox.value +=
  ", " + jobSkills;


  previewResume();


  alert(
    "Resume optimized for this job!"
  );


}
// =====================================
// Part 19: Notification System
// =====================================


// Create Notification
function createNotification(message, type="info"){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("notifications")
  .add({

    userId: user.uid,

    message: message,

    type: type,

    read: false,

    createdAt: new Date()

  })


  .then(()=>{

    console.log("Notification created");

  })

  .catch((error)=>{

    console.log(error.message);

  });

}



// Load User Notifications
function loadNotifications(){

  const user = auth.currentUser;


  if(!user){

    return;

  }



  db.collection("notifications")

  .where("userId","==",user.uid)

  .orderBy("createdAt","desc")

  .get()


  .then((snapshot)=>{


    const box =
    document.getElementById("notifications");


    if(!box){

      return;

    }


    box.innerHTML = "";



    snapshot.forEach((doc)=>{


      const data = doc.data();



      box.innerHTML += `

      <div class="notification-card">

        <p>${data.message}</p>

      </div>

      `;


    });


  });


}



// Mark Notification As Read
function markNotificationRead(id){


  db.collection("notifications")

  .doc(id)

  .update({

    read:true

  });


}



// Welcome Message After Login
auth.onAuthStateChanged((user)=>{


  if(user){

    createNotification(
      "Welcome back to JobAI!",
      "success"
    );


    loadNotifications();

  }


});
// =====================================
// Part 20: User Profile Management
// =====================================


// Save User Profile
function saveUserProfile(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return;

  }


  const profileData = {

    name:
    document.getElementById("profileName").value,

    phone:
    document.getElementById("profilePhone").value,

    location:
    document.getElementById("profileLocation").value,

    bio:
    document.getElementById("profileBio").value,

    updatedAt:
    new Date()

  };



  db.collection("users")

  .doc(user.uid)

  .set(profileData,{merge:true})


  .then(()=>{

    alert(
      "Profile saved successfully!"
    );

  })


  .catch((error)=>{

    alert(error.message);

  });


}



// Load User Profile
function loadUserProfile(){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("users")

  .doc(user.uid)

  .get()


  .then((doc)=>{


    if(doc.exists){


      const data = doc.data();



      if(document.getElementById("profileName")){

        document.getElementById("profileName").value =
        data.name || "";

      }


      if(document.getElementById("profilePhone")){

        document.getElementById("profilePhone").value =
        data.phone || "";

      }


      if(document.getElementById("profileLocation")){

        document.getElementById("profileLocation").value =
        data.location || "";

      }


      if(document.getElementById("profileBio")){

        document.getElementById("profileBio").value =
        data.bio || "";

      }


    }


  });


}



// Delete Account
function deleteAccount(){

  const user = auth.currentUser;


  if(!user){

    return;

  }



  const confirmDelete =
  confirm(
    "Are you sure you want to delete your account?"
  );



  if(confirmDelete){


    user.delete()

    .then(()=>{


      alert(
        "Account deleted"
      );


    })

    .catch((error)=>{


      alert(error.message);


    });


  }

}



// Load Profile After Login
auth.onAuthStateChanged((user)=>{


  if(user){

    loadUserProfile();

  }


});
// =====================================
// Part 21: Profile Image & File Upload
// =====================================


// Upload Profile Image
function uploadProfileImage(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return;

  }


  const file =
  document.getElementById("profileImage").files[0];


  if(!file){

    alert("Please select an image");
    return;

  }



  const storageRef =
  firebase.storage()
  .ref("profileImages/" + user.uid);



  storageRef.put(file)

  .then(()=>{


    return storageRef.getDownloadURL();


  })


  .then((url)=>{


    return db.collection("users")

    .doc(user.uid)

    .set({

      photoURL:url

    },{merge:true});


  })


  .then(()=>{


    alert(
      "Profile image uploaded successfully!"
    );


    loadProfileImage();


  })


  .catch((error)=>{


    alert(error.message);


  });


}



// Load Profile Image
function loadProfileImage(){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("users")

  .doc(user.uid)

  .get()


  .then((doc)=>{


    if(doc.exists){


      const data = doc.data();


      const image =
      document.getElementById("profilePreview");


      if(image && data.photoURL){


        image.src =
        data.photoURL;


      }


    }


  });


}



// Upload Resume File
function uploadResumeFile(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return;

  }


  const file =
  document.getElementById("resumeFile").files[0];


  if(!file){

    alert("Select a file first");
    return;

  }



  const fileRef =
  firebase.storage()

  .ref(
    "resumes/" +
    user.uid +
    "/" +
    file.name
  );



  fileRef.put(file)

  .then(()=>{


    alert(
      "Resume file uploaded successfully!"
    );


  })


  .catch((error)=>{


    alert(error.message);


  });


}



// Load Image After Login
auth.onAuthStateChanged((user)=>{


  if(user){

    loadProfileImage();

  }


});
// =====================================
// Part 22: JobAI Support Chat System
// =====================================


// Send Support Message
function sendSupportMessage(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return;

  }


  const messageBox =
  document.getElementById("supportMessage");


  if(!messageBox){

    return;

  }


  const message =
  messageBox.value.trim();



  if(message === ""){

    alert("Write a message first");
    return;

  }



  db.collection("supportMessages")

  .add({

    userId:user.uid,

    email:user.email,

    message:message,

    sender:"user",

    createdAt:new Date(),

    status:"open"

  })


  .then(()=>{


    messageBox.value = "";


    alert(
      "Message sent successfully!"
    );


    loadSupportMessages();


  })


  .catch((error)=>{


    alert(error.message);


  });


}



// Load User Messages
function loadSupportMessages(){

  const user = auth.currentUser;


  if(!user){

    return;

  }



  db.collection("supportMessages")

  .where("userId","==",user.uid)

  .orderBy("createdAt","asc")

  .get()


  .then((snapshot)=>{


    const chatBox =
    document.getElementById("chatBox");


    if(!chatBox){

      return;

    }


    chatBox.innerHTML = "";



    snapshot.forEach((doc)=>{


      const data = doc.data();



      chatBox.innerHTML += `

      <div class="chat-message">

        <strong>
        ${data.sender}
        </strong>

        <p>
        ${data.message}
        </p>

      </div>

      `;


    });


  });


}



// Admin Reply Message
function adminReply(messageId, replyText){


  db.collection("supportMessages")

  .doc(messageId)

  .update({

    reply:replyText,

    sender:"admin",

    status:"answered",

    repliedAt:new Date()

  })


  .then(()=>{


    alert(
      "Reply sent"
    );


  });


}



// Load Chat After Login
auth.onAuthStateChanged((user)=>{


  if(user){

    loadSupportMessages();

  }


});
// =====================================
// Part 23: Security & Access Control
// =====================================


// Check Login Status
function requireLogin(){

  const user = auth.currentUser;


  if(!user){

    alert(
      "Please login to continue"
    );

    return false;

  }


  return true;

}



// Protect PRO Features
function requirePRO(){


  if(!requireLogin()){

    return false;

  }


  if(!isProUser){


    alert(
      "This feature is available only for JobAI PRO users."
    );


    return false;


  }


  return true;

}



// Secure PRO Download
function secureDownloadPDF(){


  if(requirePRO()){


    downloadPDF();


  }


}



// Check User Data Before Save
function validateResumeData(){


  const name =
  document.getElementById("name").value.trim();


  const jobTitle =
  document.getElementById("jobTitle").value.trim();


  const skills =
  document.getElementById("skills").value.trim();



  if(name === ""){


    alert(
      "Please enter your name"
    );


    return false;


  }



  if(jobTitle === ""){


    alert(
      "Please enter your job title"
    );


    return false;


  }



  if(skills === ""){


    alert(
      "Please add your skills"
    );


    return false;


  }



  return true;

}



// Secure Resume Save
function secureSaveResume(){


  if(!validateResumeData()){


    return;


  }



  if(requireLogin()){


    generateResume();


  }


}



// Logout And Clear Session
function secureLogout(){


  auth.signOut()

  .then(()=>{


    isProUser = false;


    alert(
      "Logged out successfully"
    );


    location.reload();


  })


  .catch((error)=>{


    alert(error.message);


  });


}



// Security Check After Login
auth.onAuthStateChanged((user)=>{


  if(user){


    console.log(
      "Secure session active:",
      user.email
    );


  }else{


    console.log(
      "No active session"
    );


  }


});
// =====================================
// Part 24: JobAI Analytics System
// =====================================


// Track User Activity
function trackActivity(action){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("analytics")

  .add({

    userId:user.uid,

    email:user.email,

    action:action,

    createdAt:new Date()

  })

  .catch((error)=>{

    console.log(error.message);

  });


}



// Count User Resumes
function countUserResumes(){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("resumes")

  .where("userId","==",user.uid)

  .get()


  .then((snapshot)=>{


    const box =
    document.getElementById("totalResumes");


    if(box){


      box.innerHTML =
      snapshot.size;


    }


  });


}



// Admin Analytics
function loadAnalytics(){


  if(!checkAdmin()){


    alert("Access denied!");

    return;


  }



  db.collection("analytics")

  .get()


  .then((snapshot)=>{


    const box =
    document.getElementById("analyticsBox");



    if(!box){

      return;

    }



    box.innerHTML = `

      <h3>
      Total Activities:
      ${snapshot.size}
      </h3>

    `;



  });


}



// Track Resume Creation
function trackResumeCreation(){

  trackActivity(
    "Created Resume"
  );

}



// Track PDF Download
function trackPDFDownload(){

  trackActivity(
    "Downloaded PDF"
  );

}



// Load Analytics After Login
auth.onAuthStateChanged((user)=>{


  if(user){

    countUserResumes();

  }


});
// =====================================
// Part 25: Public Resume Sharing System
// =====================================


// Create Public Resume Link
function createPublicResume(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return;

  }


  const resumeData = {

    userId:user.uid,

    name:
    document.getElementById("name").value,

    jobTitle:
    document.getElementById("jobTitle").value,

    skills:
    document.getElementById("skills").value,

    summary:
    document.getElementById("summary")
    ? document.getElementById("summary").value
    : "",

    public:true,

    createdAt:new Date()

  };



  db.collection("publicResumes")

  .add(resumeData)


  .then((doc)=>{


    const link =
    window.location.origin +
    "/resume.html?id=" +
    doc.id;



    const linkBox =
    document.getElementById("publicLink");



    if(linkBox){

      linkBox.value = link;

    }



    alert(
      "Public resume link created!"
    );


  })


  .catch((error)=>{


    alert(error.message);


  });


}



// Copy Resume Link
function copyResumeLink(){

  const linkBox =
  document.getElementById("publicLink");


  if(!linkBox){

    return;

  }


  navigator.clipboard.writeText(
    linkBox.value
  )


  .then(()=>{


    alert(
      "Link copied!"
    );


  });


}



// Load Public Resume
function loadPublicResume(){

  const params =
  new URLSearchParams(
    window.location.search
  );


  const id =
  params.get("id");



  if(!id){

    return;

  }



  db.collection("publicResumes")

  .doc(id)

  .get()


  .then((doc)=>{


    if(doc.exists){


      const data =
      doc.data();



      const box =
      document.getElementById("publicResume");



      if(box){


        box.innerHTML = `

        <div class="resume-preview">

          <h1>
          ${data.name}
          </h1>


          <h2>
          ${data.jobTitle}
          </h2>


          <h3>
          Skills
          </h3>


          <p>
          ${data.skills}
          </p>


          <p>
          ${data.summary}
          </p>


          <small>
          Created with JobAI
          </small>


        </div>

        `;


      }


    }


  });


}



// Run Public Resume Loader
document.addEventListener(
"DOMContentLoaded",
function(){

  loadPublicResume();

});
// =====================================
// Part 26: Referral & User Growth System
// =====================================


// Create Referral Code
function createReferralCode(){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  const code =
  "JOBAI-" +
  user.uid.substring(0,6).toUpperCase();



  db.collection("users")

  .doc(user.uid)

  .set({

    referralCode: code

  }, {merge:true})


  .then(()=>{


    const box =
    document.getElementById("referralCode");


    if(box){

      box.value = code;

    }


  });


}



// Apply Referral Code
function applyReferralCode(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first");
    return;

  }


  const code =
  document.getElementById("enterReferral").value;



  if(code === ""){

    alert("Enter referral code");
    return;

  }



  db.collection("referrals")

  .add({

    userId:user.uid,

    referralCode:code,

    createdAt:new Date()

  })


  .then(()=>{


    alert(
      "Referral code applied successfully!"
    );


  });


}



// Count Referrals
function countReferrals(){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("referrals")

  .where("userId","==",user.uid)

  .get()


  .then((snapshot)=>{


    const box =
    document.getElementById("referralCount");


    if(box){

      box.innerHTML =
      snapshot.size;

    }


  });


}



// Reward Referral User
function rewardReferral(){


  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("users")

  .doc(user.uid)

  .set({

    referralReward:true

  },{merge:true})


  .then(()=>{


    alert(
      "Referral reward added!"
    );


  });


}



// Load Referral Data
auth.onAuthStateChanged((user)=>{


  if(user){

    createReferralCode();

    countReferrals();

  }


});
// =====================================
// Part 27: Automated User Messages System
// =====================================


// Send Automatic Message
function sendAutoMessage(message,type="info"){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("notifications")

  .add({

    userId:user.uid,

    message:message,

    type:type,

    read:false,

    createdAt:new Date()

  })

  .then(()=>{

    console.log(
      "Automatic message sent"
    );

  });


}



// Welcome Message
function sendWelcomeMessage(){

  sendAutoMessage(
    "Welcome to JobAI! Create your professional resume today.",
    "success"
  );

}



// PRO Expiry Reminder
function sendExpiryReminder(){

  const user = auth.currentUser;


  if(!user){

    return;

  }


  db.collection("users")

  .doc(user.uid)

  .get()


  .then((doc)=>{


    if(doc.exists){


      const data =
      doc.data();


      if(data.expiryDate){


        sendAutoMessage(
          "Your JobAI PRO subscription will expire soon.",
          "warning"
        );


      }


    }


  });


}



// Resume Completion Reminder
function resumeReminder(){

  const skills =
  document.getElementById("skills");


  if(skills && skills.value===""){


    sendAutoMessage(
      "Complete your skills section to improve your resume score.",
      "info"
    );


  }

}



// Run Messages After Login
auth.onAuthStateChanged((user)=>{


  if(user){

    sendWelcomeMessage();

    sendExpiryReminder();

    resumeReminder();

  }


});
// =====================================
// Part 28: Premium Resume Templates
// =====================================


// Premium Template List
const premiumTemplates = [

  {
    id:"professional",
    name:"Professional",
    pro:true
  },

  {
    id:"executive",
    name:"Executive",
    pro:true
  },

  {
    id:"creative",
    name:"Creative",
    pro:true
  },

  {
    id:"minimal",
    name:"Minimal",
    pro:false
  }

];



// Select Premium Template
function choosePremiumTemplate(templateId){

  const template =
  premiumTemplates.find(
    t => t.id === templateId
  );


  if(!template){

    alert("Template not found");
    return;

  }



  if(template.pro && !isProUser){

    alert(
      "This template is available for JobAI PRO users."
    );

    return;

  }



  selectedTemplate =
  template.id;



  generateTemplateResume();



  alert(
    template.name +
    " template selected"
  );


}



// Show Available Templates
function showTemplates(){

  const box =
  document.getElementById("templateList");


  if(!box){

    return;

  }



  box.innerHTML = "";



  premiumTemplates.forEach((template)=>{


    box.innerHTML += `

    <div class="template-card">

      <h3>
      ${template.name}
      </h3>


      <p>
      ${
        template.pro
        ? "⭐ PRO"
        : "Free"
      }
      </p>


      <button onclick="choosePremiumTemplate('${template.id}')">

      Use Template

      </button>


    </div>

    `;


  });


}



// Change Resume Style
function changeResumeStyle(style){


  const resume =
  document.getElementById("resume");


  if(!resume){

    return;

  }


  resume.className =
  "resume " + style;


}
// =====================================
// Part 29: Professional Profile & SEO System
// =====================================


// Generate Professional Profile Link
function createProfessionalProfile(){

  const user = auth.currentUser;


  if(!user){

    alert("Please login first!");
    return;

  }



  const profileData = {

    userId:user.uid,

    name:
    document.getElementById("profileName").value,

    title:
    document.getElementById("jobTitle").value,

    skills:
    document.getElementById("skills").value,

    public:true,

    createdAt:new Date()

  };



  db.collection("professionalProfiles")

  .add(profileData)


  .then((doc)=>{


    const link =
    window.location.origin +
    "/profile.html?id=" +
    doc.id;



    const box =
    document.getElementById("profileLink");



    if(box){

      box.value = link;

    }



    alert(
      "Professional profile created!"
    );


  })

  .catch((error)=>{

    alert(error.message);

  });


}



// Copy Profile Link
function copyProfileLink(){

  const link =
  document.getElementById("profileLink");


  if(!link){

    return;

  }



  navigator.clipboard.writeText(
    link.value
  )


  .then(()=>{


    alert(
      "Profile link copied!"
    );


  });


}



// Generate SEO Description
function generateSEODescription(){


  const name =
  document.getElementById("name").value;


  const jobTitle =
  document.getElementById("jobTitle").value;


  const skills =
  document.getElementById("skills").value;



  const seoBox =
  document.getElementById("seoDescription");



  if(!seoBox){

    return;

  }



  seoBox.value =

  name +
  " - " +
  jobTitle +
  ". Professional skills: " +
  skills +
  ". Created with JobAI.";

}



// Load Public Profile
function loadProfessionalProfile(){

  const params =
  new URLSearchParams(
    window.location.search
  );


  const id =
  params.get("id");



  if(!id){

    return;

  }



  db.collection("professionalProfiles")

  .doc(id)

  .get()


  .then((doc)=>{


    if(doc.exists){


      const data =
      doc.data();



      const box =
      document.getElementById("publicProfile");



      if(box){


        box.innerHTML = `

        <div class="profile-card">

          <h1>
          ${data.name}
          </h1>


          <h2>
          ${data.title}
          </h2>


          <p>
          Skills:
          ${data.skills}
          </p>


          <small>
          Powered by JobAI
          </small>

        </div>

        `;


      }


    }


  });


}



// Run Public Profile Loader
document.addEventListener(
"DOMContentLoaded",
function(){

  loadProfessionalProfile();

});
// =====================================
// Part 30: JobAI SaaS Dashboard System
// =====================================


// Load Complete User Dashboard
function loadSaaSDashboard(){

  const user = auth.currentUser;


  if(!user){

    return;

  }



  // User Email

  const emailBox =
  document.getElementById("dashboardEmail");


  if(emailBox){

    emailBox.innerHTML =
    user.email;

  }



  // Resume Count

  db.collection("resumes")

  .where("userId","==",user.uid)

  .get()


  .then((snapshot)=>{


    const countBox =
    document.getElementById("dashboardResumeCount");


    if(countBox){

      countBox.innerHTML =
      snapshot.size;

    }


  });



  // User Plan

  const planBox =
  document.getElementById("dashboardPlan");


  if(planBox){


    planBox.innerHTML =
    isProUser
    ? "⭐ JobAI PRO"
    : "Free Plan";


  }


}



// User Activity Report
function generateUserReport(){

  const user = auth.currentUser;


  if(!user){

    return;

  }



  db.collection("analytics")

  .where("userId","==",user.uid)

  .get()


  .then((snapshot)=>{


    const reportBox =
    document.getElementById("userReport");


    if(reportBox){


      reportBox.innerHTML = `

      <h3>
      JobAI Activity Report
      </h3>

      <p>
      Total Activities:
      ${snapshot.size}
      </p>

      <p>
      Account:
      ${user.email}
      </p>

      `;


    }


  });


}



// SaaS Welcome
function startJobAISession(){

  if(auth.currentUser){


    loadSaaSDashboard();

    generateUserReport();


  }

}



// Refresh Dashboard
function refreshDashboard(){

  loadSaaSDashboard();

  generateUserReport();

}



// Start Dashboard After Login
auth.onAuthStateChanged((user)=>{


  if(user){

    setTimeout(()=>{

      startJobAISession();

    },1000);


  }


});
