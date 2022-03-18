interface Movie {
  title: string;
  year: number;
  cast: string[];
  genres: string[];
}

const ORIGIN = window.location.origin;

const getDataThen = (onSuccess: (movies: Movie[]) => void) => {
  $.ajax({
    type: "GET",
    url: `${ORIGIN}/static/movies.json`,
    dataType: "json",
    success: onSuccess,
  });
};

const getUniqueActors = (movies: Movie[]) => {
  const allActorsWithDuplicates: string[] = [];
  movies.forEach((movie) => {
    allActorsWithDuplicates.push(...movie.cast);
  });
  const uniqueActors = [...new Set(allActorsWithDuplicates)];
  uniqueActors.sort((a, b) => a.localeCompare(b));
  return uniqueActors;
};

const getMovieGenres = (movies: Movie[]) => {
  const allGenres: { [title: string]: number } = {};
  movies.forEach((movie) => {
    const myGenres = [...new Set(movie.genres)];
    myGenres.forEach((genre) => {
      if (allGenres[genre]) allGenres[genre]++;
      else allGenres[genre] = 1;
    });
  });
  return allGenres;
};

const homePageHandler = () => {
  const $displayArea = $("#moviesInfo");
  getDataThen((movies) => {
    const genres = getMovieGenres(movies);
    const actors = getUniqueActors(movies);
    $displayArea.append(`<li>Number of Actors: ${actors.length}</li>`);
    $displayArea.append(`<li>Number of Movies: ${movies.length}</li>`);
    $displayArea.append(`<li>Number of Movies in Each Genre:</li>`);
    Object.entries(genres).forEach(([genre, count]) => {
      $displayArea.append(`<li>Number of ${genre} Movies: ${count}</li>`);
    });
  });
};

const actorsPageHandler = () => {
  const $displayArea = $("#actorsList");
  const $nameInput = $("#nameInput");
  const fillUi = (actors: string[]) => {
    $displayArea.empty();
    actors.forEach((actor) => {
      $displayArea.append(
        `<li><a href="${ORIGIN}/actor/${actor}">${actor}</a></li>`
      );
    });
  };
  const onInputChange = (actors: string[]) => {
    const nameFilter = $nameInput.val().toString().toLowerCase();
    const resolvedActors = actors.filter((name) =>
      name.toLowerCase().includes(nameFilter)
    );
    fillUi(resolvedActors);
  };
  getDataThen((movies) => {
    const uniqueActors = getUniqueActors(movies);
    $nameInput.on("input", () => onInputChange(uniqueActors));
    fillUi(uniqueActors);
  });
};

const moviesPageHandler = () => {
  const $displayArea = $("#moviesList");
  const $yearInput = $("#yearInput");
  const $titleInput = $("#titleInput");
  const $sortInput = $("#sortInput");
  const sortMovies = (rawMovies: Movie[], sortType: string) => {
    const sortedMovies = [...rawMovies];
    if (sortType === "title_d") {
      sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortType === "title_a") {
      sortedMovies.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortType === "year_d") {
      sortedMovies.sort((a, b) => a.year - b.year);
    } else if (sortType === "year_a") {
      sortedMovies.sort((a, b) => b.year - a.year);
    }
    return sortedMovies;
  };
  const fillUi = (movies: Movie[]) => {
    $displayArea.empty();
    const sortedMovies = sortMovies(movies, $sortInput.val() as string);
    const movieTitles = sortedMovies.map((movie) => movie.title);
    movieTitles.forEach((title) => {
      $displayArea.append(
        `<li><a href="${ORIGIN}/movie/${title}">${title}</a></li>`
      );
    });
  };
  const onInputChange = (movies: Movie[]) => {
    const titleFilter = $titleInput.val().toString().toLowerCase();
    const yearFilter = +$yearInput.val();
    const resolvedMovies = movies.filter((movie) => {
      if (yearFilter > 1000 && yearFilter < 3000) {
        if (movie.year !== yearFilter) return false;
      }
      if (movie.title.toLowerCase().includes(titleFilter)) return true;
      else return false;
    });
    fillUi(resolvedMovies);
  };
  getDataThen((movies) => {
    $yearInput.on("input", () => onInputChange(movies));
    $titleInput.on("input", () => onInputChange(movies));
    $sortInput.on("change", () => fillUi(movies));
    fillUi(movies);
  });
};

const actorPageHandler = (actor: string) => {
  const $displayArea = $("#actorInfo");
  getDataThen((movies) => {
    const myMovies = movies.filter((movie) => movie.cast.includes(actor));
    [...new Set(myMovies)].forEach((movie) => {
      const title = movie.title;
      $displayArea.append(
        `<li><a href="${ORIGIN}/movie/${title}">${title}</a></li>`
      );
    });
  });
};

const moviePageHandler = (movieTitle: string) => {
  const $displayArea = $("#movieInfo");
  getDataThen((movies) => {
    const movie = movies.find((movie) => movie.title === movieTitle);
    const actors = [...new Set(movie.cast)];
    const genres = [...new Set(movie.genres)];
    $displayArea.append(`<li>Year Released: ${movie.year}</li>`);
    if (genres.length > 0) {
      $displayArea.append(`<li>Movie Genres:</li>`);
      genres.forEach((genre) => {
        $displayArea.append(`<li>${genre}</li>`);
      });
    }
    if (actors.length > 0) {
      $displayArea.append(`<li>Movie Cast (${actors.length} actors):</li>`);
      actors.forEach((actor) => {
        $displayArea.append(
          `<li><a href="${ORIGIN}/actor/${actor}">${actor}</a></li>`
        );
      });
    }
  });
};
