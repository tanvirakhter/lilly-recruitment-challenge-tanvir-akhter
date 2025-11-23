# Lilly Technical Challenge - Software Engineer Placement Students
A repository containing the Eli Lilly student developer technical challenge.

**Disclaimer:** All medicines in the fake database (`backend/data.json`) are fictional and do not represent real medicines.

## Introduction
This takehome task was developed in order to test the basic skillset of a JavaScript/Python developer.
 
The task consists of backend and frontend functionalities.
 
You aren’t expected to spend more than 30-60 minutes on this task (we respect your time, you don’t have to complete the task).
 
You are free to use the internet but must solve this task yourself.
 
During your interview you will be asked to present (in any way you like) your thought process on how you went about completing this task.

## Getting Started
This challenge consists of a backend written in [Python](https://www.python.org/) and a frontend written using HTML, CSS and JavaScript.

1. You will need to install Python in order to run the backend server. See the link above or go [here](https://www.python.org/downloads/).
2. You will need to install Git to handle commits and source code management. You can download Git [here](https://git-scm.com/downloads). When prompted, ensure you add the Git executable to your system's `PATH`. If you get errors like `not found: Git`, follow [this guide](https://stackoverflow.com/questions/26620312/git-installing-git-in-path-with-github-client-for-windows) to add it to `PATH` manually.
3. You will likely want to use an Integrated Development Environment (IDE) or Code Editor. We recommend [Visual Studio Code](https://code.visualstudio.com/Download).
4. You will need a GitHub account in order to [clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) this repository and [commit](https://github.com/git-guides/git-commit) your changes.

### Verifying Installation
Run the following commands to confirm that your installations succeeded:
```bash
python --version
git -v
```
You should see version numbers in the terminal (or whatever command-executing environment you ran the above commands in) if they were installed correctly. If you get errors, ensure the installation was successful and that the Python and Git executables were added to your [system `PATH`](https://stackoverflow.com/questions/44272416/how-to-add-a-folder-to-path-environment-variable-in-windows-10-with-screensho).

### Git Beginner Guide

If you are struggling to get started with the GitHub side of things, you can follow the below basic instructions:

1. Make a new folder on your local machine that you would like to store this challenge's source code in.
2. Open a terminal (Linux, MacOS) or PowerShell (Windows), or alternatively use the built-in terminal of your IDE (i.e. VSCode terminal), and traverse to the folder you created in step one.
3. Clone the challenge repository into the folder:

```bash
git clone https://github.com/SamThompson95/lilly-recruitment-challenge.git
cd lilly-recruitment-challenge
```

4. Set up the remote repository URL to point to your own repository. You can do this by running the following commands:

```bash
git remote rename origin upstream
git remote add origin <your-repo-url>
```

5. When you make changes you would like to commit (save), you can follow the below steps:
```bash
git add <file-name-that-has-changes>
git commit -m "<meaningful-commit-message>"
git push
```
*Ensure you have a remote repository set up on GitHub. You will be committing and pushing changes from your local Git repository to the remote GitHub repository. You can go [here](https://github.com/new) to create a new repository, and [here](https://docs.github.com/en/get-started/using-git/about-git) to understand the basics of Git. If you have difficulty setting up the remote upstream repository via the Git CLI, see [this guide](https://devopscube.com/set-git-upstream-respository-branch/) on how to do that.*

### Environment Setup
Once you have installed Python and Git, have your IDE set up, and have cloned the repository, you can use one of the provided `start` scripts to activate the [Python virtual environment](https://docs.python.org/3/library/venv.html), install Python dependencies, and start the backend server.

Setup scripts are provided for Mac, Linux and Windows. You can run the appropriate script for your operating system to get started.

#### Mac/Linux
```bash
./start.sh
```

#### Windows
```bash
./start.ps1

# or

./start.bat
```

*If you experience errors when running one of the above scripts, try deleting the `venv` folder and running the script again. Alternatively, you can manually create a virtual environment and install the dependencies by following the steps in the script.*

## Tips and Tricks
- Upon running the backend server, you can use a tool like [Postman](https://www.postman.com/downloads/) to test the API endpoints. This will allow you to see the data that is being returned from the server.
    - For example, you can use Postman to send a `GET` request to the `http://localhost:8000/medicines` endpoint to see the data that is being returned from the server. 
- You should be able to see the frontend by opening the `index.html` file in your browser. You can also use the browser's developer tools to debug the frontend code.

## Objectives
- Fetch data from the backend server and send it to the the frontend, displaying it in a user-friendly way.
- A data engineer had some issues migrating data, leaving some gaps in our database. How can you ensure that the frontend handles missing/invalid data returned from the APIs without crashing?
- You can send data to the backend via the available API(s), however it is not particularly user-friendly. How will you create a user-friendly solution that allows users to input data on the site and send it to the backend?
- The frontend site's design leaves a lot to be desired. Can you make any improvements to the overall design and user experience? (this one is open-ended; feel free to be creative here!)
- You are provided a documentation template and are encouraged to fill this out as you work through this challenge. This will help when it comes time to present your work.

## Optional Objectives
*These objectives can be completed if you have time or would like to be challenged.*
  
- The boss has asked me for a quarterly report. Can you create a backend function for averaging prices of all our medicines?

## Scope

### In Scope (You may modify these)
- main.py
- the whole frontend folder:
    - script.js
    - style.css
    - index.html
- DOCUMENTATION.md (fill this out as you work through the challenge)
- DOCUMENTATION.docx (fill this out as you work through the challenge)

*Note: You only need to fill out one of the documentation files. Choose one of the documentation templates and feel free to delete the other. Alternatively, create your own documentation file in any format you wish.*

### Out of Scope (Do not modify these)
 - data.json
 - requirements.txt
 - start.sh
 - start.ps1
 - start.bat
