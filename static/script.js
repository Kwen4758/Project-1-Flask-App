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
    var partialActors = {};
    movies.forEach(function (movie) {
        movie.cast.forEach(function (name) {
            if (!partialActors[name])
                partialActors[name] = { name: name, movies: [movie] };
            else
                partialActors[name].movies.push(movie);
        });
    });
    var finalActors = Object.values(partialActors).map(function (_a) {
        var name = _a.name, movies = _a.movies;
        var dupeGenres = [];
        var dupeYears = [];
        movies.sort(function (a, b) { return a.title.localeCompare(b.title); });
        movies.forEach(function (movie) {
            dupeGenres.push.apply(dupeGenres, __spreadArray([], __read(movie.genres), false));
            dupeYears.push(movie.year);
        });
        return {
            name: name,
            movies: movies,
            yearsActive: __spreadArray([], __read(new Set(dupeYears)), false).sort(),
            genres: __spreadArray([], __read(new Set(dupeGenres)), false).sort(function (a, b) { return a.localeCompare(b); }),
        };
    });
    finalActors.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return finalActors;
};
var homePageHandler = function () {
    var $displayArea = $("#moviesInfo");
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
    var $actorsTable = $("#actorsTableBody");
    var $nameInput = $("#nameInput");
    var $genreInput = $("#genreInput");
    var $movieInput = $("#movieInput");
    var $searchButton = $("#searchButton");
    var timeouts = [];
    var fillUi = function (actors) {
        timeouts.forEach(function (timeout) { return clearTimeout(timeout); });
        $actorsTable.empty();
        actors.forEach(function (_a) {
            var name = _a.name, movies = _a.movies, genres = _a.genres;
            timeouts.push(setTimeout(function () {
                var movieLinks = movies
                    .sort(function (a, b) { return a.title.localeCompare(b.title); })
                    .map(function (_a) {
                    var title = _a.title;
                    return "<a href=\"".concat(ORIGIN, "/movie/").concat(title, "\">").concat(title, "</a>");
                });
                $actorsTable.append("<tr>\n              <td><a href=\"".concat(ORIGIN, "/actor/").concat(name, "\">").concat(name, "</a></td>\n              <td>").concat(movieLinks.join(", "), "</td>\n              <td>").concat(genres.join(", "), "</td>\n            </tr>"));
            }, 0));
        });
    };
    var onSearch = function (actors) {
        var nameFilter = $nameInput.val().toString().toLowerCase();
        var movieFilter = $movieInput.val().toString().toLowerCase();
        var genreFilter = $genreInput.val().toString().toLowerCase();
        var resolvedActors = actors.filter(function (_a) {
            var name = _a.name, movies = _a.movies, genres = _a.genres;
            if (!name.toLowerCase().includes(nameFilter))
                return false;
            if (!movies.reduce(function (pre, cur) { return pre || cur.title.toLowerCase().includes(movieFilter); }, false))
                return false;
            if (!genres.reduce(function (pre, cur) { return pre || cur.toLowerCase().includes(genreFilter); }, false))
                return false;
            return true;
        });
        fillUi(resolvedActors);
    };
    getDataThen(function (movies) {
        var uniqueActors = getUniqueActors(movies);
        $searchButton.on("click", function () { return onSearch(uniqueActors); });
        fillUi(uniqueActors);
    });
};
var moviesPageHandler = function () {
    var $movieTable = $("#moviesTableBody");
    var $yearMinInput = $("#yearMinInput");
    var $yearMaxInput = $("#yearMaxInput");
    var $titleInput = $("#titleInput");
    var $castInput = $("#castInput");
    var $genreInput = $("#genreInput");
    var $sortSelect = $("#sortInput");
    var $searchButton = $("#searchButton");
    var timeouts = [];
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
        timeouts.forEach(function (timeout) { return clearTimeout(timeout); });
        $movieTable.empty();
        var sortedMovies = sortMovies(movies, $sortSelect.val());
        sortedMovies.forEach(function (_a) {
            var title = _a.title, year = _a.year, cast = _a.cast, genres = _a.genres;
            timeouts.push(setTimeout(function () {
                var castLinks = cast
                    .sort(function (a, b) { return a.localeCompare(b); })
                    .map(function (actor) { return "<a href=\"".concat(ORIGIN, "/actor/").concat(actor, "\">").concat(actor, "</a>"); });
                $movieTable.append("<tr>\n            <td><a href=\"".concat(ORIGIN, "/movie/").concat(title, "\">").concat(title, "</a></td>\n            <td>").concat(year, "</td>\n            <td>").concat(castLinks.join(", "), "</td>\n            <td>").concat(genres.sort(function (a, b) { return a.localeCompare(b); }).join(", "), "</td>\n          </tr>"));
            }, 0));
        });
    };
    var onSearch = function (movies) {
        var titleFilter = $titleInput.val().toString().toLowerCase();
        var yearMinFilter = +$yearMinInput.val();
        var yearMaxFilter = +$yearMaxInput.val();
        var castFilter = $castInput.val().toString().toLowerCase();
        var genreFilter = $genreInput.val().toString().toLowerCase();
        var resolvedMovies = movies.filter(function (_a) {
            var title = _a.title, year = _a.year, cast = _a.cast, genres = _a.genres;
            if (!title.toLowerCase().includes(titleFilter))
                return false;
            if (year < yearMinFilter || year > yearMaxFilter)
                return false;
            if (!cast.reduce(function (pre, cur) { return pre || cur.toLowerCase().includes(castFilter); }, false))
                return false;
            if (!genres.reduce(function (pre, cur) { return pre || cur.toLowerCase().includes(genreFilter); }, false))
                return false;
            return true;
        });
        fillUi(resolvedMovies);
    };
    getDataThen(function (movies) {
        $searchButton.on("click", function () { return onSearch(movies); });
        $sortSelect.on("change", function () { return onSearch(movies); });
        fillUi(movies);
    });
};
var actorPageHandler = function (actor) {
    var $displayArea = $("#actorInfo");
    getDataThen(function (movies) {
        var myMovies = movies.filter(function (movie) { return movie.cast.includes(actor); });
        __spreadArray([], __read(new Set(myMovies)), false).forEach(function (_a) {
            var title = _a.title;
            $displayArea.append("<li><a href=\"".concat(ORIGIN, "/movie/").concat(title, "\">").concat(title, "</a></li>"));
        });
    });
};
var moviePageHandler = function (movieTitle) {
    var $displayArea = $("#movieInfo");
    getDataThen(function (movies) {
        var movie = movies.find(function (movie) { return movie.title === movieTitle; });
        var actors = __spreadArray([], __read(new Set(movie.cast)), false).sort(function (a, b) { return a.localeCompare(b); });
        var genres = __spreadArray([], __read(new Set(movie.genres)), false).sort(function (a, b) {
            return a.localeCompare(b);
        });
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
