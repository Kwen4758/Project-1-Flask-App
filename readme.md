First, make sure you have Python and npm installed. (npm installation can be found [here](https://nodejs.org/en/download/).)

In order to use Typescript and auto-compile into javascript, run the following commands from the root folder:

```
cd static
npm install
tsc -w
```

Run the following commands from the root folder to start the app: 

```
python3 -m pip install -r requirements.txt
export FLASK_APP=run
export FLASK_ENV=development
flask run
```
