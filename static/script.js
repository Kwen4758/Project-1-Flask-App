var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var ORIGIN = window.location.origin;
var getDataThen = function (onSuccess) {
    $.ajax({
        type: "GET",
        url: "".concat(ORIGIN, "/static/movies.json"),
        dataType: "json",
        success: onSuccess,
    });
};
var getUniqueActors = function (movies) {
    var allActorsWithDuplicates = [];
    movies.forEach(function (movie) {
        allActorsWithDuplicates.push.apply(allActorsWithDuplicates, __spreadArray([], __read(movie.cast), false));
    });
    var uniqueActors = __spreadArray([], __read(new Set(allActorsWithDuplicates)), false);
    uniqueActors.sort(function (a, b) { return a.localeCompare(b); });
    return uniqueActors;
};
var getMovieGenres = function (movies) {
    var allGenres = {};
    movies.forEach(function (movie) {
        var myGenres = __spreadArray([], __read(new Set(movie.genres)), false);
        myGenres.forEach(function (genre) {
            if (allGenres[genre])
                allGenres[genre]++;
            else
                allGenres[genre] = 1;
        });
    });
    return allGenres;
};
var homePageHandler = function () {
    var $displayArea = $("#moviesInfo");
    getDataThen(function (movies) {
        var genres = getMovieGenres(movies);
        var actors = getUniqueActors(movies);
        $displayArea.append("<li>Number of Actors: ".concat(actors.length, "</li>"));
        $displayArea.append("<li>Number of Movies: ".concat(movies.length, "</li>"));
        $displayArea.append("<li>Number of Movies in Each Genre:</li>");
        Object.entries(genres).forEach(function (_a) {
            var _b = __read(_a, 2), genre = _b[0], count = _b[1];
            $displayArea.append("<li>Number of ".concat(genre, " Movies: ").concat(count, "</li>"));
        });
    });
};
var actorsPageHandler = function () {
    var $displayArea = $("#actorsList");
    var $nameInput = $("#nameInput");
    var fillUi = function (actors) {
        $displayArea.empty();
        actors.forEach(function (actor) {
            $displayArea.append("<li><a href=\"".concat(ORIGIN, "/actor/").concat(actor, "\">").concat(actor, "</a></li>"));
        });
    };
    var onInputChange = function (actors) {
        var nameFilter = $nameInput.val().toString().toLowerCase();
        var resolvedActors = actors.filter(function (name) {
            return name.toLowerCase().includes(nameFilter);
        });
        fillUi(resolvedActors);
    };
    getDataThen(function (movies) {
        var uniqueActors = getUniqueActors(movies);
        $nameInput.on("input", function () { return onInputChange(uniqueActors); });
        fillUi(uniqueActors);
    });
};
var moviesPageHandler = function () {
    var $displayArea = $("#moviesList");
    var $yearInput = $("#yearInput");
    var $titleInput = $("#titleInput");
    var $sortInput = $("#sortInput");
    var sortMovies = function (rawMovies, sortType) {
        var sortedMovies = __spreadArray([], __read(rawMovies), false);
        if (sortType === "title_d") {
            sortedMovies.sort(function (a, b) { return a.title.localeCompare(b.title); });
        }
        else if (sortType === "title_a") {
            sortedMovies.sort(function (a, b) { return b.title.localeCompare(a.title); });
        }
        else if (sortType === "year_d") {
            sortedMovies.sort(function (a, b) { return a.year - b.year; });
        }
        else if (sortType === "year_a") {
            sortedMovies.sort(function (a, b) { return b.year - a.year; });
        }
        return sortedMovies;
    };
    var fillUi = function (movies) {
        $displayArea.empty();
        var sortedMovies = sortMovies(movies, $sortInput.val());
        var movieTitles = sortedMovies.map(function (movie) { return movie.title; });
        movieTitles.forEach(function (title) {
            $displayArea.append("<li><a href=\"".concat(ORIGIN, "/movie/").concat(title, "\">").concat(title, "</a></li>"));
        });
    };
    var onInputChange = function (movies) {
        var titleFilter = $titleInput.val().toString().toLowerCase();
        var yearFilter = +$yearInput.val();
        var resolvedMovies = movies.filter(function (movie) {
            if (yearFilter > 1000 && yearFilter < 3000) {
                if (movie.year !== yearFilter)
                    return false;
            }
            if (movie.title.toLowerCase().includes(titleFilter))
                return true;
            else
                return false;
        });
        fillUi(resolvedMovies);
    };
    getDataThen(function (movies) {
        $yearInput.on("input", function () { return onInputChange(movies); });
        $titleInput.on("input", function () { return onInputChange(movies); });
        $sortInput.on("change", function () { return fillUi(movies); });
        fillUi(movies);
    });
};
var actorPageHandler = function (actor) {
    var $displayArea = $("#actorInfo");
    getDataThen(function (movies) {
        var myMovies = movies.filter(function (movie) { return movie.cast.includes(actor); });
        __spreadArray([], __read(new Set(myMovies)), false).forEach(function (movie) {
            var title = movie.title;
            $displayArea.append("<li><a href=\"".concat(ORIGIN, "/movie/").concat(title, "\">").concat(title, "</a></li>"));
        });
    });
};
var moviePageHandler = function (movieTitle) {
    var $displayArea = $("#movieInfo");
    getDataThen(function (movies) {
        var movie = movies.find(function (movie) { return movie.title === movieTitle; });
        var actors = __spreadArray([], __read(new Set(movie.cast)), false);
        var genres = __spreadArray([], __read(new Set(movie.genres)), false);
        $displayArea.append("<li>Year Released: ".concat(movie.year, "</li>"));
        if (genres.length > 0) {
            $displayArea.append("<li>Movie Genres:</li>");
            genres.forEach(function (genre) {
                $displayArea.append("<li>".concat(genre, "</li>"));
            });
        }
        if (actors.length > 0) {
            $displayArea.append("<li>Movie Cast (".concat(actors.length, " actors):</li>"));
            actors.forEach(function (actor) {
                $displayArea.append("<li><a href=\"".concat(ORIGIN, "/actor/").concat(actor, "\">").concat(actor, "</a></li>"));
            });
        }
    });
};
