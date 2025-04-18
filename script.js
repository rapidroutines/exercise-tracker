const timedExercises = [
  "Planks", "Tuck Planche" , "Straddle Planche", "Crow Pose", "Frog pose", "Front Lever" , "Back Lever" , "Dragon Flag" , "Human Flag" , "Side Plank" , "Wall Sit" , "Superman Hold" , "L-sit Hold" , "V-sit Hold" , "Handstand Holds" , ""
];

let exercisesData = [];
let userToken = null;
const API_BASE_URL = window.location.origin;

window.onload = function() {
  const estOptions = { 
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  const estDate = new Date().toLocaleDateString('en-US', estOptions);
  const [month, day, year] = estDate.split('/');
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
  document.getElementById('date').value = formattedDate;
  checkUserAuthentication();
  toggleInputFields();
};

// Check if user is authenticated and load their data accordingly
async function checkUserAuthentication() {
  userToken = localStorage.getItem("token");
  
  if (userToken) {
    try {
      // Attempt to load user's exercise data from server
      await loadExercisesFromServer();
    } catch (error) {
      console.error("Error loading user exercises:", error);
      // Fallback to empty array if server fetch fails
      exercisesData = [];
      displayAllExercises();
    }
  } else {
    // User not authenticated, start with empty array
    exercisesData = [];
    displayAllExercises();
  }
}

async function loadExercisesFromServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user-data/get-data`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch exercise data');
    }
    
    const data = await response.json();
    exercisesData = data.exerciseLog || [];
    displayAllExercises();
    
  } catch (error) {
    console.error("Error fetching exercise data:", error);
    throw error;
  }
}

async function saveExercisesToServer() {
  if (!userToken) {
    console.log("User not authenticated, can't save to server");
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user-data/save-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dataType: 'exerciseLog',
        data: exercisesData
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save exercise data');
    }
    
    return true;
  } catch (error) {
    console.error("Error saving exercise data:", error);
    return false;
  }
}

function isTimedExercise(exercise) {
  return timedExercises.includes(exercise);
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${month}/${day}/${year}`;
}

function toggleInputFields() {
  const selectedExercise = document.getElementById('exercise-select').value;
  const setsInput = document.getElementById('sets');
  const repsInput = document.getElementById('reps');
  const timeGroup = document.getElementById('time-group');
  const repsLabel = document.querySelector('.reps-label');

  if (isTimedExercise(selectedExercise)) {
    setsInput.disabled = false;
    repsInput.classList.add('timed');
    repsLabel.classList.add('timed');
    timeGroup.style.display = 'flex';
  } else {
    setsInput.disabled = false;
    repsInput.classList.remove('timed');
    repsLabel.classList.remove('timed');
    timeGroup.style.display = 'none';
  }
}

async function addExercise() {
  const exercise = document.getElementById('exercise-select').value;
  const sets = document.getElementById('sets').value;
  const reps = document.getElementById('reps').value;
  const time = document.getElementById('time').value;
  const weight = document.getElementById('weight').value || 'Bodyweight';
  const weightUnit = document.getElementById('weight-unit').value;
  const date = document.getElementById('date').value;

  if (isTimedExercise(exercise) && (!time)) {
    alert('Please enter time for this exercise');
    return;
  }

  if (!isTimedExercise(exercise) && (!sets || !reps)) {
    alert('Please enter sets and reps');
    return;
  }

  // Create new exercise with unique ID
  const newExercise = { 
    id: Date.now().toString(), 
    exercise, 
    sets, 
    reps, 
    time, 
    weight, 
    weightUnit, 
    date,
    timestamp: new Date().toISOString()
  };
  
  exercisesData.push(newExercise);
  
  if (userToken) {
    // Save to server if user is authenticated
    const saved = await saveExercisesToServer();
    if (!saved) {
      alert('Failed to save exercise to your account. Please check your connection and try again.');
    }
  } else {
    // Show message that exercise is saved locally only
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `
      <div class="notification-content">
        <p>Exercise saved locally. Sign in to save to your account.</p>
        <button class="notification-close">×</button>
      </div>
    `;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
    
    // Also allow manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
  }
  
  displayExercise(newExercise);
  
  // Reset form fields
  document.getElementById('sets').value = '';
  document.getElementById('reps').value = '';
  document.getElementById('time').value = '';
  document.getElementById('weight').value = '';
}

function displayAllExercises() {
  const exerciseList = document.getElementById('exercise-list');
  exerciseList.innerHTML = ''; // Clear existing exercises
  
  exercisesData.forEach(exerciseData => {
    displayExercise(exerciseData);
  });
}

function displayExercise(exerciseData) {
  const exerciseList = document.getElementById('exercise-list');
  const exerciseItem = document.createElement('div');
  exerciseItem.classList.add('exercise-item');
  exerciseItem.id = `exercise-${exerciseData.id}`;

  let titleElement = document.createElement('div');
  titleElement.classList.add('title');
  titleElement.textContent = exerciseData.exercise;

  let infoElement = document.createElement('div');
  infoElement.classList.add('info');

  if (isTimedExercise(exerciseData.exercise)) {
    infoElement.textContent = `Time: ${exerciseData.time} seconds`;
  } else {
    infoElement.textContent = `Sets: ${exerciseData.sets}, Reps: ${exerciseData.reps}`;
  }

  let weightElement = document.createElement('div');
  weightElement.classList.add('info');
  weightElement.textContent = `Weight: ${exerciseData.weight === 'Bodyweight' ? 
    exerciseData.weight : `${exerciseData.weight} ${exerciseData.weightUnit}`}`;

  let dateElement = document.createElement('div');
  dateElement.classList.add('date');
  dateElement.textContent = `Date: ${formatDate(exerciseData.date)}`;

  let deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-btn');
  deleteButton.textContent = 'Delete';
  deleteButton.onclick = function() {
    deleteExercise(exerciseData.id);
  };

  exerciseItem.appendChild(titleElement);
  exerciseItem.appendChild(infoElement);
  exerciseItem.appendChild(weightElement);
  exerciseItem.appendChild(dateElement);
  exerciseItem.appendChild(deleteButton);

  exerciseList.appendChild(exerciseItem);
}

async function deleteExercise(exerciseId) {
  if (confirm('Are you sure you want to delete this exercise?')) {
    // Remove from UI first for better user experience
    const exerciseElement = document.getElementById(`exercise-${exerciseId}`);
    if (exerciseElement) {
      exerciseElement.remove();
    }
    
    // Filter out the deleted exercise
    exercisesData = exercisesData.filter(item => item.id !== exerciseId);
    
    // Save updated data if user is authenticated
    if (userToken) {
      const saved = await saveExercisesToServer();
      if (!saved) {
        alert('Failed to delete exercise from your account. Please check your connection and try again.');
        // Refresh the display to restore the exercise if save failed
        displayAllExercises();
      }
    }
  }
}

async function deleteAllExercises() {
  if (confirm('Are you sure you want to delete ALL exercises? This cannot be undone.')) {
    exercisesData = [];
    
    // Clear UI
    const exerciseList = document.getElementById('exercise-list');
    exerciseList.innerHTML = '';
    
    // Save empty array if user is authenticated
    if (userToken) {
      const saved = await saveExercisesToServer();
      if (!saved) {
        alert('Failed to delete all exercises from your account. Please check your connection and try again.');
      }
    }
  }
}

// Add a listener for the "Delete All" button
document.addEventListener('DOMContentLoaded', function() {
  // Create a "Delete All" button and add it to the UI
  const container = document.querySelector('.container');
  const exerciseList = document.getElementById('exercise-list');
  
  const deleteAllBtn = document.createElement('button');
  deleteAllBtn.classList.add('delete-all-btn');
  deleteAllBtn.textContent = 'Delete All Exercises';
  deleteAllBtn.onclick = deleteAllExercises;
  
  // Insert before the exercise list
  container.insertBefore(deleteAllBtn, exerciseList);
});

// Add styles for the new elements
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.textContent = `
    .delete-all-btn {
      margin-top: 10px;
      padding: 8px 12px;
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      width: 100%;
    }
    
    .delete-all-btn:hover {
      background-color: #d32f2f;
    }
    
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 300px;
    }
    
    .notification-content {
      background-color: #1e628c;
      color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .notification-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      margin-left: 10px;
    }
  `;
  document.head.appendChild(style);
});

// Listen for messages from the parent window
window.addEventListener('message', function(event) {
  // Check if the message is requesting to load user data
  if (event.data && event.data.type === 'loadUserData' && event.data.token) {
    userToken = event.data.token;
    loadExercisesFromServer();
  }
  
  // Check if the message is requesting to clear user data
  if (event.data && event.data.type === 'clearUserData') {
    userToken = null;
    exercisesData = [];
    displayAllExercises();
  }
});
