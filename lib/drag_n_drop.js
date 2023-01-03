// Created as a module so as to be reuseable

// =============== Drag and drop Feature ========================

// Handle drag and drop
const container = document.getElementById("task__container");
const draggables = document.querySelectorAll("[draggable='true']");

draggables.forEach((draggable) => {

    draggable.addEventListener("dragstart", (e) => {
        draggable.classList.add('dragging');
    });

    draggable.addEventListener("dragend", (e) => {
        draggable.classList.remove('dragging');
    });

});

container.addEventListener("dragover", (e) => {
    e.preventDefault();

    const afterElement = getDragAfterElement(container, e.clientY);

    // print(afterElement);
    const dragedElement = document.querySelector('.dragging');

    if (!Boolean(afterElement)) container.appendChild(afterElement);
    else container.insertBefore(dragedElement, afterElement);

})

function getDragAfterElement(container, y) {

    const draggableElements = [...container.querySelectorAll('[draggable]:not(.dragging)')];


    return draggableElements.reduce((closest, child) => {

        const box = child.getBoundingClientRect();

        const offset = y - box.top - box.height / 2;


        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest
        }

    }, { offset: Number.NEGATIVE_INFINITY }).element;

}
// ==================================================================
