window.onload = function() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  loadExercises();
  toggleInputFields();
};

function toggleInputFields() {
  const selectedExercise = document.getElementById('exercise-select').value;
  const setsInput = document.getElementById('sets');
  const repsInput = document.getElementById('reps');
  const timeGroup = document.getElementById('time-group');

  if (selectedExercise === "Planks") {
    setsInput.disabled = true;
    repsInput.disabled = true;
    timeGroup.style.display = 'flex';
  } else {
    setsInput.disabled = false;
    repsInput.disabled = false;
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

  if (exercise === "Planks" && !time) {
    alert('Please enter time for Planks');
    return;
  }

  if (exercise !== "Planks" && (!sets || !reps)) {
    alert('Please enter sets and reps');
    return;
  }

  const exercises = getExercises();
  exercises.push({ exercise, sets, reps, time, weight, weightUnit, date });
  localStorage.setItem('exercises', JSON.stringify(exercises));
  displayExercise({ exercise, sets, reps, time, weight, weightUnit, date });
}

function getExercises() {
  const exercises = localStorage.getItem('exercises');
  return exercises ? JSON.parse(exercises) : [];
}

function displayExercise(exerciseData) {
  const exerciseList = document.getElementById('exercise-list');
  const exerciseItem = document.createElement('div');
  exerciseItem.classList.add('exercise-item');

  let exerciseText = `${exerciseData.exercise}`;
  let infoText = '';

  if (exerciseData.exercise === "Planks") {
    exerciseText += `<br>Time: ${exerciseData.time} seconds`;
  } else {
    infoText = `<br>Sets: ${exerciseData.sets}, Reps: ${exerciseData.reps}`;
  }

  const weightText = exerciseData.weight === 'Bodyweight' ? exerciseData.weight : `${exerciseData.weight} ${exerciseData.weightUnit}`;

  exerciseItem.innerHTML = `
    <div class="title">${exerciseText}</div>
    <div class="info">${infoText}</div>
    <div class="info">Weight: ${weightText}</div>
    <div class="date">Date: ${exerciseData.date}</div>
    <button class="delete-btn" onclick="deleteExercise('${exerciseData.date}', '${exerciseData.exercise}')">Delete</button>
  `;
  exerciseList.appendChild(exerciseItem);
}

function deleteExercise(date, exercise) {
  const exercises = getExercises();
  const updatedExercises = exercises.filter(item => !(item.date === date && item.exercise === exercise));
  localStorage.setItem('exercises', JSON.stringify(updatedExercises));
  loadExercises();
}

function loadExercises() {
  const exercises = getExercises();
  const exerciseList = document.getElementById('exercise-list');
  exerciseList.innerHTML = '';

  exercises.forEach(exercise => {
    displayExercise(exercise);
  });
}
