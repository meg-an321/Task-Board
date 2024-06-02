// Grab references to the important DOM elements.
const timeDisplayEl = $('#time-display');
const projectDisplayEl = $('#project-display');
const projectFormEl = $('#project-form');
const projectNameInputEl = $('#project-name-input');
const projectTypeInputEl = $('#project-type-input');
const projectDateInputEl = $('#taskDueDate');

// Helper function that displays the time, this is called every second in the setInterval function below.
function displayTime() {
  const rightNow = dayjs().format('MMM DD, YYYY [at] hh:mm:ss a');
  timeDisplayEl.text(rightNow);
}

function readProjectsFromStorage() {
  // Retrieve projects from localStorage and parse the JSON to an array. If there are no projects in localStorage, initialize an empty array and return it.
  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  return projects;
}

function saveProjectsToStorage(projects) {
  // Stringify the array of projects and save them in localStorage
  localStorage.setItem('projects', JSON.stringify(projects));
}

function createProjectCard(project) {
  // Create a new card element and add the classes `card`, `project-card`, `draggable`, and `my-3`. Also add a `data-project-id` attribute and set it to the project id.
  const taskCard = $('<div>');
  taskCard.addClass('card project-card draggable my-3');
  taskCard.attr('data-project-id', project.id);

  // Create a new card header element and add the classes `card-header` and `h4`. Also set the text of the card header to the project name.
  const cardHeader = $('<div>');
  cardHeader.addClass('card-header h4');
  cardHeader.text(project.name);

  // Create a new card body element and add the class `card-body`.
  const cardBody = $('<div>');
  cardBody.addClass('card-body');

  // Create a new paragraph element and add the class `card-text`. Also set the text of the paragraph to the project type.
  const typeParagraph = $('<p>');
  typeParagraph.addClass('card-text');
  typeParagraph.text(`Type: ${project.type}`);

  // Create a new paragraph element and add the class `card-text`. Also set the text of the paragraph to the project due date.
  const dueDateParagraph = $('<p>');
  dueDateParagraph.addClass('card-text');
  dueDateParagraph.text(`Due Date: ${project.dueDate}`);

  // Create a new button element and add the classes `btn`, `btn-danger`, and `delete`. Also set the text of the button to "Delete" and add a `data-project-id` attribute and set it to the project id.
  const cardDeleteBtn = $('<button>');
  cardDeleteBtn.addClass('btn btn-danger delete');
  cardDeleteBtn.text('Delete');
  cardDeleteBtn.attr('data-project-id', project.id);

  // Append elements to build the card structure
  taskCard.append(cardHeader, cardBody);
  cardBody.append(typeParagraph, dueDateParagraph, cardDeleteBtn);

  //Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (project.dueDate && project.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(project.dueDate, 'DD/MM/YYYY');

    //   // ? If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  // Append the card header and card body to the card.
  taskCard.append($('<div>').addClass('card-header').text(project.name));
  taskCard.append(cardBody);
  // Append the card header and card body to the card.


  // ? Return the card so it can be appended to the correct lane.
  return taskCard;
}

function printProjectData() {
  const projects = readProjectsFromStorage();
  
  // Empty existing project cards out of the lanes
  $('#todo-cards').empty();
  $('#in-progress-cards').empty();
  $('#done-cards').empty();
  
  // Loop through projects and create project cards for each status
  for (let project of projects) {
      const taskCard = createProjectCard(project);
      
      if (project.status === 'todo') {
          $('#todo-cards').append(taskCard);
      } else if (project.status === 'inProgress') {
          $('#in-progress-cards').append(taskCard);
      } else if (project.status === 'done') {
          $('#done-cards').append(taskCard);
      }
  }
}

// Use JQuery UI to make task cards draggable
$('#project-name-input li').draggable({
  opacity: 0.7,
  zIndex: 100,
  helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
          ? $(e.target)
          : $(e.target).closest('.ui-draggable');
      return original.clone().css({
          width: original.outerWidth(),
      });
  },
});

$('#in-progress').droppable({
  drop: function () {
    $('#in-progress-cards').append(ul.draggable);
  }
});

$('#done').droppable({
  drop: function () {
    $('#done-cards').append(ul.draggable);
  }
});

$('#to-do').droppable({
  drop: function () {
    $('#todo-cards').append(ul.draggable);
   
  }
});




function handleDeleteProject() {
  const projectId = $(this).attr('data-project-id');
  let projects = readProjectsFromStorage();

  // Loop through the projects array and remove the project with the matching id.
  projects = projects.filter((project) => project.id !== projectId);

  // Save the updated projects array to localStorage
  saveProjectsToStorage(projects);

  // Print project data back to the screen
  printProjectData();
}

function handleProjectFormSubmit(event) {
  event.preventDefault();

  // Get the project name, type, and due date from the form
  const projectName = projectNameInputEl.val();
  const projectType = projectTypeInputEl.val();
  const projectDate = projectDateInputEl.val();

  // Create a new project object with the data from the form
  const newProject = {
    id: crypto.randomUUID(),
    name: projectName,
    type: projectType,
    dueDate: projectDate,
    status: 'todo',
  };

  // Pull the projects from localStorage and push the new project to the array
  const projects = readProjectsFromStorage();
  projects.push(newProject);

  // Save the updated projects array to localStorage
  saveProjectsToStorage(projects);

  // Print project data back to the screen
  printProjectData();

  // Clear the form inputs
  projectNameInputEl.val('');
  projectTypeInputEl.val('');
  projectDateInputEl.val('');
}

function handleSort(event, ui) {
  const projects = readProjectsFromStorage();
  const taskId = ui.sortable[0].dataset.projectId;
  const newStatus = event.target.id;

  for (let project of projects) {
    if (project.id === taskId) {
      project.status = newStatus;
    }
  }

  localStorage.setItem('projects', JSON.stringify(projects));
  printProjectData();
}

// Add event listener to the form element, listen for a submit event, and call the `handleProjectFormSubmit` function.
projectFormEl.on('submit', handleProjectFormSubmit);

// Add an event listener to listen for the delete buttons. Use event delegation to call the `handleDeleteProject` function.
projectDisplayEl.on('click', '.delete', handleDeleteProject);

// Call the `displayTime` function once on page load and then every second after that.
displayTime();
setInterval(displayTime, 1000);

$(document).ready(function () {
  printProjectData();

  $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });

  // $('#project-name-input li').droppable({
  //   accept: '.draggable',
  //   drop: handleDrop,
  // });

  $('#todo-cards').sortable({
  });

});