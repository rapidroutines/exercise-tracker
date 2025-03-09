const timedExercises = [
  "Planks", "Wall Sit", "Superman Hold", "L-sit Hold", "V-sit Hold", 
  "Handstand Holds", "Side Plank", "Isometric Pull-up Hold"
];

let exercisesData = [];

window.onload = function() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
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
