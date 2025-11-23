from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
"""
This module defines a FastAPI application for managing a list of medicines.
It provides endpoints to retrieve all medicines, retrieve a single medicine by name,
and create, update, or delete a medicine.

Endpoints:
- GET /medicines: Retrieve all medicines from the data.json file.
- GET /medicines/{name}: Retrieve a single medicine by name from the data.json file.
- GET /medicines/average-price: Calculate the average price of medicines with valid prices.
- POST /create: Create a new medicine with a specified name and price.
- POST /update: Update the name and/or price of a medicine with a specified name.
- DELETE /delete: Delete a medicine with a specified name.

Functions:
- get_all_meds: Reads the data.json file and returns all medicines.
- get_average_price: Calculates the average price of all medicines that have a valid numeric price from the data.json file.
- get_single_med: Reads the data.json file and returns a single medicine by name.
- create_med: Reads the data.json file, adds a new medicine, and writes the updated data back to the file.
- update_med: Reads the data.json file, updates the price of a medicine, and writes the updated data back to the file.
- delete_med: Reads the data.json file, deletes a medicine, and writes the updated data back to the file.
-Usage:
-Run this module directly to start the FastAPI application.

"""
import uvicorn
import json
from pathlib import Path
from typing import Any, Dict

app = FastAPI()

# Allow the browser frontend to talk to this API without CORS issues.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep a single reference to the JSON "database" file.
DATA_FILE = Path("data.json")


def read_db() -> Dict[str, Any]:
    """
    Helper function to safely read the JSON database.
    Ensures we always return a dict with a 'medicines' list.
    """
    # If the file doesn't exist yet, return an empty structure so the app can still run.
    if not DATA_FILE.exists():
        return {"medicines": []}

    try:
        with DATA_FILE.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        # If the JSON is broken, surface a clear server-side error to the client.
        raise HTTPException(status_code=500, detail="Data file is corrupted.")

    # Normalise the shape of the data so the rest of the code can assume a list.
    if "medicines" not in data or not isinstance(data["medicines"], list):
        data["medicines"] = []

    return data


def write_db(data: Dict[str, Any]) -> None:
    """
    Helper function to safely write the JSON database.
    """
    # Overwrite the file with pretty-printed JSON for easier debugging.
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


@app.get("/medicines")
def get_all_meds():
    """
    This function reads the data.json file and returns all medicines.
    Returns:
        dict: A dictionary of all medicines
    """
    data = read_db()
    return data


@app.get("/medicines/average-price")
def get_average_price():
    """
    Calculate the average price of all medicines that have a valid numeric price.
    Returns the average and the count of medicines used.
    """
    db = read_db()

    prices = []
    for med in db.get("medicines", []):
        price = med.get("price")
        # Only include prices that are already numeric to avoid crashes.
        if isinstance(price, (int, float)):
            prices.append(price)

    # If no valid prices are found, return a safe fallback.
    if not prices:
        return {"average_price": None, "count": 0}

    avg = sum(prices) / len(prices)
    return {"average_price": avg, "count": len(prices)}


@app.get("/medicines/{name}")
def get_single_med(name: str):
    """
    This function reads the data.json file and returns a single medicine by name.
    Args:
        name (str): The name of the medicine to retrieve.
    Returns:
        dict: A dictionary containing the medicine details
    """
    db = read_db()
    for med in db.get("medicines", []):
        if med.get("name") == name:
            return med

    # If no medicine matches the requested name, return a 404.
    raise HTTPException(status_code=404, detail="Medicine not found")


@app.post("/create")
def create_med(name: str = Form(...), price: float = Form(...)):
    """
    This function creates a new medicine with the specified name and price.
    It expects the name and price to be provided as form data.
    Args:
        name (str): The name of the medicine.
        price (float): The price of the medicine.
    Returns:
        dict: A message confirming the medicine was created successfully.
    """
    # Trim whitespace early so we consistently validate the "real" name.
    clean_name = name.strip() if name else ""

    if not clean_name:
        raise HTTPException(status_code=400, detail="Medicine name cannot be empty.")
    if price is None or price <= 0:
        # Avoid storing invalid or free medicines by mistake.
        raise HTTPException(
            status_code=400,
            detail="Price must be a positive number greater than 0.",
        )

    db = read_db()
    meds_list = db.setdefault("medicines", [])

    # Build a case-insensitive set of existing names to prevent duplicates.
    existing_names = {
        (m.get("name") or "").strip().lower()
        for m in meds_list
    }
    if clean_name.lower() in existing_names:
        raise HTTPException(
            status_code=400,
            detail="A medicine with this name already exists.",
        )

    new_med = {"name": clean_name, "price": price}
    meds_list.append(new_med)
    write_db(db)

    return {"message": f"Medicine created successfully with name: {clean_name}"}


@app.post("/update")
def update_med(
    name: str = Form(...),
    price: float = Form(...),
    new_name: str = Form(None),
):
    """
    This function updates the price of a medicine with the specified name.
    It expects the name and price to be provided as form data.
    Args:
        name (str): The name of the medicine.
        price (float): The new price of the medicine.
    Returns:
        dict: A message confirming the medicine was updated successfully.
    """
    original_name = name.strip() if name else ""
    new_name_clean = new_name.strip() if new_name is not None else None

    if not original_name:
        raise HTTPException(status_code=400, detail="Medicine name cannot be empty.")
    if price is None or price <= 0:
        # Keep the same validation rules as in the create endpoint.
        raise HTTPException(
            status_code=400,
            detail="Price must be a positive number greater than 0.",
        )
    if new_name is not None and not new_name_clean:
        # If the client passes a new_name field, it shouldn't be only spaces.
        raise HTTPException(
            status_code=400,
            detail="New medicine name cannot be empty.",
        )

    db = read_db()
    meds_list = db.get("medicines", [])

    original_key = original_name.lower()

    # If the name is changing, make sure we don't collide with another entry.
    if new_name_clean:
        new_key = new_name_clean.lower()
        for m in meds_list:
            existing_name = (m.get("name") or "").strip()
            if not existing_name:
                continue
            existing_key = existing_name.lower()
            if existing_key == new_key and existing_key != original_key:
                raise HTTPException(
                    status_code=400,
                    detail="A medicine with this name already exists.",
                )

    # Find the medicine and update in place.
    for med in meds_list:
        med_name = (med.get("name") or "").strip()
        if med_name.lower() == original_key:
            if new_name_clean:
                med["name"] = new_name_clean
            med["price"] = price
            write_db(db)
            return {
                "message": f"Medicine updated successfully with name: {med['name']}"
            }

    raise HTTPException(status_code=404, detail="Medicine not found")


@app.delete("/delete")
def delete_med(name: str = Form(...)):
    """
    This function deletes a medicine with the specified name.
    It expects the name to be provided as form data.
    Args:
        name (str): The name of the medicine to delete.
    Returns:
        dict: A message confirming the medicine was deleted successfully.
    """
    clean_name = name.strip() if name else ""
    if not clean_name:
        raise HTTPException(status_code=400, detail="Medicine name cannot be empty.")

    db = read_db()
    meds_list = db.get("medicines", [])
    target_key = clean_name.lower()

    # Build a new list without the target medicine instead of mutating in-place.
    remaining = [
        med
        for med in meds_list
        if (med.get("name") or "").strip().lower() != target_key
    ]

    # If the size didn't change, nothing was removed.
    if len(remaining) == len(meds_list):

        raise HTTPException(status_code=404, detail="Medicine not found")

    db["medicines"] = remaining
    write_db(db)

    return {"message": f"Medicine deleted successfully with name: {clean_name}"}


if __name__ == "__main__":
    # Run the FastAPI app with uvicorn when this file is executed directly.
    uvicorn.run(app, host="0.0.0.0", port=8000)
