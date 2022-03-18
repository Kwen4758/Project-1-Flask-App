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

const homePageHandler = () => {
  const $displayArea = $("#moviesInfo");
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
  getDataThen((movies) => {
    const genres = getMovieGenres(movies);
    const actors = getUniqueActors(movies);
    $displayArea.append(`<li>Number of Actors: <span style="color: red">${actors.length}</span> </li>`);
    $displayArea.append(`<li>Number of Movies: <span style="color: red"> ${movies.length}</span></li>`);
    $displayArea.append(`<li>Number of Movies in Each Genre:</li>`);
    Object.entries(genres).forEach(([genre, count]) => {
     $displayArea.append(`<li>Number of ${genre} Movies: <span style="color: red">${count}</span> </li>`);
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
  const $movieTable = $("#moviesTableBody");
  const $yearMinInput = $("#yearMinInput");
  const $yearMaxInput = $("#yearMaxInput");
  const $titleInput = $("#titleInput");
  const $castInput = $("#castInput");
  const $genreInput = $("#genreInput");
  const $sortSelect = $("#sortInput");
  const $searchButton = $("#searchButton");
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
    $movieTable.empty();
    const sortedMovies = sortMovies(movies, $sortSelect.val() as string);
    sortedMovies.forEach(({ title, year, cast, genres }) => {
      const castLinks = cast
        .sort((a, b) => a.localeCompare(b))
        .map((actor) => `<a href="${ORIGIN}/actor/${actor}">${actor}</a>`);
      $movieTable.append(
        `<tr>
          <td><a href="${ORIGIN}/movie/${title}"><em>${title}</em></a></td>
          <td>${year}</td>
          <td>${castLinks.join(", ")}</td>
          <td>${genres.sort((a, b) => a.localeCompare(b)).join(", ")}</td>
        </tr>`
      );
    });
  };
  const onSearch = (movies: Movie[]) => {
    const titleFilter = $titleInput.val().toString().toLowerCase();
    const yearMinFilter = +$yearMinInput.val();
    const yearMaxFilter = +$yearMaxInput.val();
    const castFilter = $castInput.val().toString().toLowerCase();
    const genreFilter = $genreInput.val().toString().toLowerCase();
    const resolvedMovies = movies.filter(({ title, year, cast, genres }) => {
      if (!title.toLowerCase().includes(titleFilter)) return false;
      if (year < yearMinFilter || year > yearMaxFilter) return false;
      if (
        !cast.reduce(
          (pre, cur) => pre || cur.toLowerCase().includes(castFilter),
          false
        )
      )
        return false;
      if (
        !genres.reduce(
          (pre, cur) => pre || cur.toLowerCase().includes(genreFilter),
          false
        )
      )
        return false;
      return true;
    });
    fillUi(resolvedMovies);
  };
  getDataThen((movies) => {
    $searchButton.on("click", () => onSearch(movies));
    $sortSelect.on("change", () => onSearch(movies));
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
