const timedExercises = [
  "Planks", "Tuck Planche" , "Straddle Planche", "Crow Pose", "Frog pose", "Front Lever" , "Back Lever" , "Dragon Flag" , "Human Flag" , "Side Plank" , "Wall Sit" , "Superman Hold" , "L-sit Hold" , "V-sit Hold" , "Handstand Holds" , ""
];

let exercisesData = [];
let isAuthenticated = false;
let userId = null;

// Remove notification function as it will be handled by the parent

window.onload = function() {
  // Get the current date in US Eastern Time
  const estOptions = { 
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  // Format the date to YYYY-MM-DD for the input field
  const estDate = new Date().toLocaleDateString('en-US', estOptions);
  const [month, day, year] = estDate.split('/');
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
  document.getElementById('date').value = formattedDate;
  
  // Check for authentication - send message to parent
  window.parent.postMessage({ type: "checkAuth" }, "*");
  
  // Listen for messages from parent
  window.addEventListener("message", (event) => {
    if (event.data.type === "authStatus") {
      isAuthenticated = event.data.isAuthenticated;
      userId = event.data.userId || null;
      
      if (isAuthenticated) {
        // Request saved exercises from the parent
        window.parent.postMessage({ type: "getTrackerExercises" }, "*");
      } else {
        // Send message to parent to show notification
        window.parent.postMessage({ type: "exerciseNotAuthenticated" }, "*");
        // Clear any existing data
        exercisesData = [];
        displayAllExercises();
      }
    } else if (event.data.type === "trackerExercisesData") {
      // We received exercises from parent (authenticated)
      exercisesData = event.data.exercises || [];
      displayAllExercises();
    }
  });
  
  toggleInputFields();
};

function isTimedExercise(exercise) {
  return timedExercises.includes(exercise);
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

function addExercise() {
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

  const newExercise = { 
    id: Date.now().toString(),
    exercise, 
    sets, 
    reps, 
    time, 
    weight, 
    weightUnit, 
    date,
    timestamp: new Date().toISOString(),
    userId: userId
  };
  
  if (isAuthenticated) {
    // Add to the local array for display
    exercisesData.push(newExercise);
    
    // Save to parent (authenticated)
    window.parent.postMessage({ 
      type: "saveTrackerExercise", 
      exercise: newExercise 
    }, "*");
  } else {
    // Still add to UI temporarily but don't save anywhere
    exercisesData.push(newExercise);
    // Notify parent about authentication status
    window.parent.postMessage({ 
      type: "exerciseNotAuthenticated" 
    }, "*");
  }
  
  displayExercise(newExercise);
  
  // Clear all form fields
  document.getElementById('sets').value = '';
  document.getElementById('reps').value = '';
  document.getElementById('time').value = '';
  document.getElementById('weight').value = '';
  
  // Reset select to default value  
  document.getElementById('exercise-select').selectedIndex = 0;
  
  // Reset the date to today's date
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
  
  // Reset interface based on first exercise in list
  toggleInputFields();
}

function saveExercisesToSessionStorage() {
  sessionStorage.setItem('exercises', JSON.stringify(exercisesData));
}

function loadExercisesFromSessionStorage() {
  const savedExercises = sessionStorage.getItem('exercises');
  exercisesData = savedExercises ? JSON.parse(savedExercises) : [];
  displayAllExercises();
}

function displayAllExercises() {
  // Clear current display
  const exerciseList = document.getElementById('exercise-list');
  exerciseList.innerHTML = '';
  
  // Add all exercises to display
  exercisesData.forEach(displayExercise);
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
  dateElement.textContent = `Date: ${exerciseData.date}`;

  let deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-btn');
  deleteButton.textContent = 'Delete';
  deleteButton.onclick = function() {
    deleteExercise(exerciseData);
    exerciseItem.remove();  // Remove the exercise card from the DOM
  };

  exerciseItem.appendChild(titleElement);
  exerciseItem.appendChild(infoElement);
  exerciseItem.appendChild(weightElement);
  exerciseItem.appendChild(dateElement);
  exerciseItem.appendChild(deleteButton);

  exerciseList.appendChild(exerciseItem);
}

function deleteExercise(exerciseData) {
  // Remove from UI array
  exercisesData = exercisesData.filter(item => item.id !== exerciseData.id);
  
  if (isAuthenticated) {
    // Send delete request to parent
    window.parent.postMessage({
      type: "removeTrackerExercise",
      exerciseId: exerciseData.id
    }, "*");
  }
}
