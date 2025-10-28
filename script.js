// API Endpoints
const SEARCH_API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const RANDOM_API_URL = "https://www.themealdb.com/api/json/v1/1/random.php";
const LOOKUP_API_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

// DOM Elements
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsGrid = document.getElementById("results-grid");
const messageArea = document.getElementById("message-area");
const randomButton = document.getElementById("random-button");
const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseBtn = document.getElementById("modal-close-btn");

// Event: Search Form Submission
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    searchRecipes(searchTerm);
  } else {
    showMessage("Please enter a search term", true);
  }
});

// Event: Random Recipe Button
randomButton.addEventListener("click", getRandomRecipe);

// Event: Close Modal
modalCloseBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});

// Event: Recipe Card Click
resultsGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".recipe-item");
  if (card) getRecipeDetails(card.dataset.id);
});

// Search Recipes
async function searchRecipes(query) {
  showMessage(`Searching for "${query}"...`, false, true);
  resultsGrid.innerHTML = "";

  try {
    const response = await fetch(`${SEARCH_API_URL}${query}`);
    if (!response.ok) throw new Error("Network error");

    const data = await response.json();
    clearMessage();

    if (data.meals) {
      displayRecipes(data.meals);
    } else {
      showMessage(`No recipes found for "${query}".`, true);
    }
  } catch (error) {
    showMessage("Something went wrong. Please try again.", true);
  }
}

// Get Random Recipe
async function getRandomRecipe() {
  showMessage("Fetching a random recipe...", false, true);
  resultsGrid.innerHTML = "";

  try {
    const response = await fetch(RANDOM_API_URL);
    if (!response.ok) throw new Error("Fetch error");

    const data = await response.json();
    clearMessage();

    if (data.meals) {
      displayRecipes(data.meals);
    } else {
      showMessage("Could not fetch a random recipe.", true);
    }
  } catch (error) {
    showMessage("Failed to fetch. Check your connection and try again.", true);
  }
}

// Display Recipe Cards
function displayRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    showMessage("No recipes to display", true);
    return;
  }

  recipes.forEach((recipe) => {
    const recipeDiv = document.createElement("div");
    recipeDiv.classList.add("recipe-item");
    recipeDiv.dataset.id = recipe.idMeal;
    recipeDiv.innerHTML = `
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy">
      <h3>${recipe.strMeal}</h3>
    `;
    resultsGrid.appendChild(recipeDiv);
  });
}

// Get Recipe Details
async function getRecipeDetails(id) {
  modalContent.innerHTML = '<p class="message loading">Loading details...</p>';
  showModal();

  try {
    const response = await fetch(`${LOOKUP_API_URL}${id}`);
    if (!response.ok) throw new Error("Details fetch error");

    const data = await response.json();
    if (data.meals && data.meals.length > 0) {
      displayRecipeDetails(data.meals[0]);
    } else {
      modalContent.innerHTML = '<p class="message error">Recipe details not found.</p>';
    }
  } catch (error) {
    modalContent.innerHTML = '<p class="message error">Failed to load recipe details.</p>';
  }
}

// Display Recipe Details in Modal
function displayRecipeDetails(recipe) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`]?.trim();
    const measure = recipe[`strMeasure${i}`]?.trim();
    if (ingredient) {
      ingredients.push(`<li>${measure ? `${measure} ` : ""}${ingredient}</li>`);
    }
  }

  const categoryHTML = recipe.strCategory ? `<h3>Category: ${recipe.strCategory}</h3>` : "";
  const areaHTML = recipe.strArea ? `<h3>Area: ${recipe.strArea}</h3>` : "";
  const ingredientsHTML = ingredients.length
    ? `<h3>Ingredients</h3><ul>${ingredients.join("")}</ul>`
    : "";
  const instructionsHTML = `<h3>Instructions</h3><p>${
    recipe.strInstructions?.replace(/\r?\n/g, "<br>") || "Instructions not available."
  }</p>`;
  const youtubeHTML = recipe.strYoutube
    ? `<h3>Video Recipe</h3><div class="video-wrapper"><a href="${recipe.strYoutube}" target="_blank">Watch on YouTube</a></div>`
    : "";
  
  modalContent.innerHTML = `
    <h2>${recipe.strMeal}</h2>
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
    ${categoryHTML}
    ${areaHTML}
    ${ingredientsHTML}
    ${instructionsHTML}
    ${youtubeHTML}
    
  `;
}

// Show Modal
function showModal() {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// Close Modal
function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Show Message
function showMessage(message, isError = false, isLoading = false) {
  messageArea.className = "message"; // Reset classes
  messageArea.textContent = message;
  if (isError) messageArea.classList.add("error");
  if (isLoading) messageArea.classList.add("loading");
}

// Clear Message
function clearMessage() {
  messageArea.textContent = "";
  messageArea.className = "message";
}
