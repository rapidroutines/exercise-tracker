const timedExercises = [
  "Planks", "Tuck Planche" , "Straddle Planche", "Crow Pose", "Frog pose", "Front Lever" , "Back Lever" , "Dragon Flag" , "Human Flag" , "Side Plank" , "Wall Sit" , "Superman Hold" , "L-sit Hold" , "V-sit Hold" , "Handstand Holds" , ""
];

let exercisesData = [];

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
  const formattedDate = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
  document.getElementById('date').value = formattedDate;
  loadExercises();
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

  const newExercise = { exercise, sets, reps, time, weight, weightUnit, date };
  exercisesData.push(newExercise);
  saveExercises();
  displayExercise(newExercise);
}

function saveExercises() {
  localStorage.setItem('exercises', JSON.stringify(exercisesData));
}

function loadExercises() {
  const savedExercises = localStorage.getItem('exercises');
  exercisesData = savedExercises ? JSON.parse(savedExercises) : [];
  exercisesData.forEach(displayExercise);
}

function displayExercise(exerciseData) {
  const exerciseList = document.getElementById('exercise-list');
  const exerciseItem = document.createElement('div');
  exerciseItem.classList.add('exercise-item');
  exerciseItem.id = `exercise-${exerciseData.exercise}-${exerciseData.date}`;

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
  exercisesData = exercisesData.filter(item => item.date !== exerciseData.date || item.exercise !== exerciseData.exercise);
  saveExercises();
}
