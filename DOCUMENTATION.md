# Lilly Technical Challenge Documentation

Author: **Tanvir Akhter Shakib**

## Approach

I started by getting the backend running locally using the provided `start` script, then checked the existing API endpoints with the browser and some simple `fetch` calls. Once I could see data coming back from `/medicines`, I focused on making the frontend actually use the API instead of hardcoded values.

I worked roughly in this order:

1. **Backend data access & safety** – wrapped the JSON file access in helper functions (`read_db` and `write_db`) so that the rest of the code doesn’t have to worry about missing files or bad JSON.
2. **Core endpoints** – made sure the existing endpoints behaved as expected and then added the optional objective: `/medicines/average-price`.
3. **Create flow** – built the “create medicine” behaviour on the frontend and wired it up to the `/create` endpoint, with both frontend and backend validation.
4. **List & UI** – improved how the medicines are displayed by using cards with collapsible actions so that update/delete are easy to access but not cluttering the page.
5. **Edit/Delete UX** – instead of separate forms, I used a single modal on the page that can show either an edit form or a delete confirmation.
6. **Search and error handling** – added a simple search bar, and made sure error states on the frontend don’t crash anything and show sensible messages.

I did look up small things like `FormData` usage and some CSS ideas, but the overall structure and logic was my own. I also kept the work contained in the files that were “in scope” as mentioned in the README.


## Objectives - Innovative Solutions

A few things I did that I think are worth highlighting:

- **Handling messy data safely**  
  The backend doesn’t assume the JSON is perfect. `read_db` checks that the file exists and that the `medicines` key is a list. If the JSON is corrupt, it returns a clear 500 error instead of silently failing. When computing the average price, I only include prices that are genuinely numbers.

- **Duplicate name protection on both sides**  
  When creating or updating medicines, the backend normalises names (trimming and using case-insensitive comparison) to prevent duplicates. The frontend also checks `allMedicines` before sending the request, so most duplicates are caught instantly in the UI.

- **Single modal for update + delete**  
  Instead of separate update and delete forms on the page, I used a shared modal:
  - In **edit mode**, it shows inputs for name and price, plus validation.
  - In **delete mode**, it hides the form and shows a short confirmation message.
  Reusing the same modal keeps the layout cleaner and reduces repetition in the code.

- **Card-based list with one item expanded at a time**  
  The “All medicines” section uses cards. Clicking a card reveals the “Update” and “Delete” buttons. If another card is already open, it automatically closes, so the list never becomes too noisy. This also works with the keyboard by treating the cards like buttons (`Enter` and `Space`).

- **Quarterly report support (average price endpoint)**  
  For the optional objective, I added `/medicines/average-price`. It returns the average price and the count of medicines used in the calculation. The frontend shows this at the top, and if the data isn’t usable it displays “N/A” instead of crashing.

- **Smooth collapsible section**  
  The “Show list / Hide list” button controls a collapsible container. I update `maxHeight` dynamically using `scrollHeight`, and also recompute it on window resize and after re-rendering the list so the open/close animation stays smooth.


## Problems Faced

- **Dealing with incomplete / invalid data**  
  The  database can contain missing names or non-numeric prices. Initially, this could have broken the UI when calling `toFixed` or when doing calculations. I fixed this by:
  - Guarding against non-numbers in the average price function.
  - Showing `"Unknown medicine"` when the name is empty.
  - Showing `"N/A"` when the price isn’t a valid number.

- **Ensuring only one card stays open**  
  My first version of the medicine list allowed multiple cards to be expanded, which made the layout look messy. To fix this, I introduced a global `openCard` variable. Whenever a card is toggled open, the code checks if there is another card open and closes it before opening the new one.

- **Keeping the collapsible height in sync**  
  When I refreshed the list or changed the layout, the collapsible container’s height didn’t always match the content, which caused janky animations. I added a helper (`updateAllMedsMaxHeightIfOpen`) and call it after rendering and on window resize to keep the `maxHeight` aligned with the content.

- **Form feedback that doesn’t get stuck**  
  The success message after creating a medicine originally stayed visible until the page reloaded. To make the UX less confusing, I added a small timeout that clears the message after a few seconds, but only if it’s still showing success.

- **Coordinating frontend and backend validation**  
  I wanted consistent rules for name/price across both sides. For example, prices must be > 0 and names must not be empty or duplicates. I made sure the same rules are enforced in both `main.py` and `script.js`, so even if someone bypasses the UI, the API still protects the data.


## Evaluation

Overall, I found the challenge a good balance between backend and frontend tasks. Once I had the server running, most of the time went into polishing the user experience on the frontend and making the interactions feel predictable.

The parts that went especially well:
- Wiring up the endpoints and getting the JSON file access under control with helper functions.
- Designing the card-based list and the shared modal, which made the page feel less cluttered.

Areas where I could have done more with extra time:
- I could add more validation and accessibility improvements (for example, better focus management when the modal opens and closes).
- Adding more filters or sorting options in the list (e.g. sort by price, or group by price range).
- Writing more unit tests for the backend functions to cover edge cases around malformed data.

If I were to redo this with more time, I’d probably:
- Introduce a small component structure on the frontend to avoid repeating DOM selection logic.
- Add automated tests for the average price function and for create/update/delete flows.
- Spend a bit more time on visual polish and responsive behaviour, especially for smaller screens.
