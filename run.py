from flask import Flask, render_template
from flask_bootstrap import Bootstrap

app = Flask(__name__)
Bootstrap(app)


@app.route("/index")
@app.route("/")
def index():
    return render_template('index.html', index='true')


@app.route("/actors")
def actors():
    return render_template('actors.html', actors='true')


@app.route("/actor/<name>")
def actor(name):
    return render_template('actor.html', name=name, actors='true')


@app.route("/movies")
def movies():
    return render_template('movies.html', movies='true')


@app.route("/movie/<title>")
def movie(title):
    return render_template('movie.html', title=title, movies='true')


