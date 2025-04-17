const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const messages = document.getElementById("messages");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value;
  messages.innerHTML += `<div class="chat-bubble"><p class="user-message">You: ${message}</p></dev>`;
  try {
    const response = await window.api.generateText(message);
    messages.innerHTML += `<div class="chat-bubble"><p class="gpt4-message">GPT-4: ${response}</p></dev>`;
  } catch (error) {
    console.error("Error generating text:", error);
  }
  userInput.value = "";
  messages.scrollTop = messages.scrollHeight;
});
