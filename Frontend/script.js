const API_BASE = "YOUR_API_URL_HERE"; // Replace with your API endpoint

/******************************
 *        LOGIN FORM
 ******************************/
document.getElementById("loginForm")?.addEventListener("submit", async function(e){
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if(data.success){
            localStorage.setItem('user_id', data.user_id);
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } else {
            alert("Login failed: " + data.message);
        }
    } catch(err){
        console.error(err);
        alert("Login failed. Try again.");
    }
});

/******************************
 *       REGISTER FORM
 ******************************/
document.getElementById("registerForm")?.addEventListener("submit", async function(e){
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if(data.success){
            localStorage.setItem('user_id', data.user_id);
            alert("Registration successful!");
            window.location.href = "profile.html";
        } else {
            alert("Registration failed: " + data.message);
        }
    } catch(err){
        console.error(err);
        alert("Registration failed. Try again.");
    }
});

/******************************
 *       PROFILE FORM
 ******************************/
document.getElementById("profileForm")?.addEventListener("submit", async function(e){
    e.preventDefault();
    const formData = new FormData(e.target);
    const profileData = {
        user_id: localStorage.getItem('user_id'),
        title: formData.get('title'),
        subject: formData.get('subject'),
        grade: formData.get('grade'),
        date_range: formData.get('date_range')
    };

    try {
        const response = await fetch(`${API_BASE}/profile`, {
            method:'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        const data = await response.json();
        if(data.success){
            alert("Profile saved!");
            window.location.href="upload.html";
        } else alert("Profile save failed: "+data.message);
    } catch(err){
        console.error(err);
        alert("Profile save failed. Try again.");
    }
});

/******************************
 *       UPLOAD SYLLABUS
 ******************************/
document.getElementById("uploadForm")?.addEventListener("submit", async function(e){
    e.preventDefault();
    const fileInput = e.target.querySelector('input[type="file"]');
    const file = fileInput.files[0];
    if(!file){ alert("Select a file"); return; }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE}/upload`, { method:'POST', body: formData });
        const data = await response.json();
        if(data.success){
            alert("Syllabus uploaded!");
            localStorage.setItem("uploadedFileContent", data.content || "");
            window.location.href="dashboard.html";
        } else alert("Upload failed: "+data.message);
    } catch(err){ console.error(err); alert("Upload failed. Try again."); }
});

/******************************
 *       EXTRACT MODULES
 ******************************/
document.getElementById("extractForm")?.addEventListener("submit", async function(e){
    e.preventDefault();
    const textContent = document.getElementById("syllabusText").value;
    if(!textContent.trim()){ alert("Enter syllabus content"); return; }

    try {
        const response = await fetch(`${API_BASE}/extract-modules`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ text: textContent })
        });
        const data = await response.json();
        if(data.success){
            localStorage.setItem("extractedModules", JSON.stringify(data.modules));
            alert("Modules extracted!");
        } else alert("Module extraction failed: "+data.message);
    } catch(err){ console.error(err); alert("Module extraction failed"); }
});

/******************************
 *       CREATE 1-MONTH STUDY PLAN
 ******************************/
function createMonthlyStudyPlan(){
    const modules = JSON.parse(localStorage.getItem("extractedModules")||"[]");
    if(modules.length===0){ alert("No modules found"); return; }

    const weeks = 4;
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const weeklyPlan = [];
    let moduleIndex = 0;

    for(let w=1; w<=weeks; w++){
        const weekObj = { title: `Week ${w}`, total_study_hours:0, days:{} };
        for(let d of days){
            const module = modules[moduleIndex % modules.length];
            weekObj.days[d] = { 
                activities: [module.title], 
                study_hours: module.study_hours || 1,
                completed: [false]
            };
            weekObj.total_study_hours += module.study_hours || 1;
            moduleIndex++;
        }
        weeklyPlan.push(weekObj);
    }

    localStorage.setItem("weeklyStudyPlan", JSON.stringify(weeklyPlan));
    alert("1-Month Study Plan Created!");
    window.location.href="studyplan.html";
}

/******************************
 *       RENDER STUDY PLAN WITH CHECKBOXES
 ******************************/
function renderStudyPlanWithCheckboxes() {
    const plansContainer = document.getElementById("plansContainer");
    plansContainer.innerHTML = "";

    const weeklyPlan = JSON.parse(localStorage.getItem("weeklyStudyPlan")||"[]");
    if (weeklyPlan.length === 0) {
        plansContainer.innerHTML = `<p style="color:#fff;">No study plan found. Generate a study plan first.</p>`;
        return;
    }

    weeklyPlan.forEach((week, weekIndex) => {
        const weekCard = document.createElement("div");
        weekCard.className = "plan-card";
        weekCard.innerHTML = `
            <h3>${week.title}</h3>
            <div style="margin-top:10px;">
                ${Object.entries(week.days).map(([day, dayPlan]) => `
                    <div style="background:#f8f9fa; padding:8px; margin:5px 0; border-radius:5px; border-left:3px solid #28a745;">
                        <strong>${day}</strong>
                        <ul style="list-style:none; padding-left:0; margin-top:5px;">
                            ${dayPlan.activities.map((activity, actIndex) => `
                                <li>
                                    <input type="checkbox" data-week="${weekIndex}" data-day="${day}" data-activity="${actIndex}" 
                                    ${dayPlan.completed?.[actIndex] ? 'checked' : ''}> 
                                    ${activity}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
        plansContainer.appendChild(weekCard);
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function() {
            const weekIndex = parseInt(this.dataset.week);
            const day = this.dataset.day;
            const actIndex = parseInt(this.dataset.activity);

            const weeklyPlan = JSON.parse(localStorage.getItem("weeklyStudyPlan")||"[]");
            weeklyPlan[weekIndex].days[day].completed[actIndex] = this.checked;
            localStorage.setItem("weeklyStudyPlan", JSON.stringify(weeklyPlan));

            updateProgressDashboard();
        });
    });
}

/******************************
 *       LOAD QUIZZES
 ******************************/
async function loadQuizzes(){
    try{
        const response = await fetch(`${API_BASE}/quizzes?user_id=${localStorage.getItem('user_id')}`);
        const data = await response.json();
        if(data.success){
            localStorage.setItem('generatedQuizzes', JSON.stringify(data.quizzes));
            renderQuizzes();
        }
    } catch(err){ console.error(err); }
}

/******************************
 *       RENDER QUIZZES
 ******************************/
function renderQuizzes(){
    const quizzesContainer = document.getElementById("quizzesContainer");
    if(!quizzesContainer) return;

    const quizzes = JSON.parse(localStorage.getItem("generatedQuizzes")||"[]");
    quizzesContainer.innerHTML = '';

    if(quizzes.length === 0){
        quizzesContainer.innerHTML = `<p style="color:#fff;">No quizzes available. Upload syllabus to generate quizzes.</p>`;
        return;
    }

    quizzes.forEach(q=>{
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.innerHTML = `
            <h3>${q.title}</h3>
            <p>Questions: ${q.questions.length}</p>
            <button onclick="startQuiz('${q.id}')">Start Quiz</button>
        `;
        quizzesContainer.appendChild(card);
    });
}

/******************************
 *       START QUIZ FUNCTION
 ******************************/
function startQuiz(quizId){
    const quizzes = JSON.parse(localStorage.getItem("generatedQuizzes")||[]);
    const quiz = quizzes.find(q=>q.id===quizId);
    if(!quiz){ alert("Quiz not found"); return; }

    let currentQuestion = 0;
    let userAnswers = {};

    const modal = document.createElement('div');
    modal.id = 'quizModal';
    modal.style = `position:fixed;top:0;left:0;width:100%;height:100%;
                   background:rgba(0,0,0,0.8);display:flex;align-items:center;
                   justify-content:center;z-index:1000;`;
    document.body.appendChild(modal);

    function renderQuestion(){
        const q = quiz.questions[currentQuestion];
        return `
            <div style="background:white;padding:20px;border-radius:10px;width:90%;max-width:700px;">
                <h3>${quiz.title} (Q${currentQuestion+1} of ${quiz.questions.length})</h3>
                <p>${q.question}</p>
                ${q.options.map((opt,i)=>`
                    <label style="display:block;margin:8px 0;">
                        <input type="radio" name="answer" value="${i}" ${userAnswers[currentQuestion]===i?'checked':''}>
                        ${String.fromCharCode(65+i)}. ${opt}
                    </label>
                `).join('')}
                <div style="margin-top:20px;">
                    <button id="prevBtn" ${currentQuestion===0?'disabled':''}>Previous</button>
                    <button id="nextBtn">${currentQuestion===quiz.questions.length-1?'Finish':'Next'}</button>
                </div>
            </div>
        `;
    }

    function updateModal(){
        modal.innerHTML = renderQuestion();

        modal.querySelectorAll('input[name="answer"]').forEach(input=>{
            input.addEventListener('change', e=>{
                userAnswers[currentQuestion] = parseInt(e.target.value);
            });
        });

        modal.querySelector('#prevBtn').addEventListener('click', ()=>{
            if(currentQuestion>0){ currentQuestion--; updateModal(); }
        });

        modal.querySelector('#nextBtn').addEventListener('click', ()=>{
            if(currentQuestion < quiz.questions.length-1){
                currentQuestion++; 
                updateModal();
            } else finishQuiz();
        });
    }

    function finishQuiz(){
        let correct = 0;
        quiz.questions.forEach((q,i)=>{
            if(userAnswers[i] === q.correct) correct++;
        });

        const allQuizzes = JSON.parse(localStorage.getItem("generatedQuizzes")||"[]");
        const index = allQuizzes.findIndex(qz => qz.id === quiz.id);
        if(index >= 0){ 
            allQuizzes[index].status = 'completed'; 
            localStorage.setItem("generatedQuizzes", JSON.stringify(allQuizzes)); 
        }

        modal.innerHTML = `
            <div style="background:white;padding:30px;border-radius:10px;width:90%;max-width:700px;text-align:center;">
                <h2>Quiz Completed!</h2>
                <p>Total Questions: ${quiz.questions.length}</p>
                <p>Correct Answers: ${correct}</p>
                <p>Wrong Answers: ${quiz.questions.length - correct}</p>
                <button id="closeQuizBtn" style="margin-top:20px;padding:10px 20px;">Close</button>
            </div>
        `;
        document.getElementById('closeQuizBtn').addEventListener('click', ()=>{
            modal.remove();
            updateProgressDashboard();
        });
    }

    updateModal();
}

// make startQuiz accessible globally
window.startQuiz = startQuiz;

/******************************
 *       PROGRESS DASHBOARD
 ******************************/
function updateProgressDashboard(){
    const weeklyPlan = JSON.parse(localStorage.getItem("weeklyStudyPlan")||"[]");
    const quizzes = JSON.parse(localStorage.getItem("generatedQuizzes")||"[]");

    let totalStudyHours=0, completedModules=0, totalModules=0;

    weeklyPlan.forEach(week=>{
        for(const day in week.days){
            const dayPlan = week.days[day];
            totalStudyHours += dayPlan.study_hours || 0;
            totalModules += dayPlan.activities.length;
            completedModules += (dayPlan.completed || []).filter(c=>c).length;
        }
    });

    const quizzesTaken = quizzes.filter(q=>q.status==='completed').length;
    const overallProgress = totalModules>0 ? Math.round((completedModules/totalModules)*100) : 0;

    document.getElementById('overallProgress')?.style.setProperty('width', overallProgress+'%');
    document.getElementById('overallText')?.textContent = overallProgress + '% Complete';
    document.getElementById('completedModules')?.textContent = completedModules;
    document.getElementById('quizzesTaken')?.textContent = quizzesTaken;
    document.getElementById('studyHours')?.textContent = totalStudyHours;
    document.getElementById('streakDays')?.textContent = Math.min(30, Math.floor(totalStudyHours/2));
}

/******************************
 *       LOGOUT FUNCTION
 ******************************/
function logout(){
    localStorage.removeItem('user_id');
    window.location.href='index.html';
}

// call loadQuizzes on page load
document.addEventListener('DOMContentLoaded', ()=>{
    loadQuizzes();
});
