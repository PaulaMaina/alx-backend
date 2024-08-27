#!/usr/bin/env python3
"""Parameterize templates"""
from flask import Flask, render_template, request
from flask_babel import Babel


class Config:
    """Default class"""
    LANGUAGES = ["en", "fr"]
    BABEL_DEFAULT_LOCALE = "en"
    BABEL_DEFAULT_TIMEZONE = "UTC"


app = Flask(__name__)
app.config.from_object(Config)
app.url_map.strict_slashes = False

babel = Babel(app)


@babel.localselector
def get_locale() -> str:
    """get_locale function"""
    return request.accept_languages.best_match(app.config['LANGUAGES'])


@app.route('/')
def index():
    """Index page route"""
    render_template("3-index.html")


if __name__ == "__main__":
    app.run(debug=True)
