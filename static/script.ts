interface Movie {
  title: string;
  year: number;
  cast: string[];
  genres: string[];
}

interface Actor {
  name: string;
  movies: Movie[];
  yearsActive: number[];
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

const getUniqueActors = (movies: Movie[]): Actor[] => {
  const partialActors: { [name: string]: { name: string; movies: Movie[] } } =
    {};
  movies.forEach((movie) => {
    movie.cast.forEach((name) => {
      if (!partialActors[name]) partialActors[name] = { name, movies: [movie] };
      else partialActors[name].movies.push(movie);
    });
  });
  const finalActors: Actor[] = Object.values(partialActors).map(
    ({ name, movies }) => {
      const dupeGenres: string[] = [];
      const dupeYears: number[] = [];
      movies.sort((a, b) => a.title.localeCompare(b.title));
      movies.forEach((movie) => {
        dupeGenres.push(...movie.genres);
        dupeYears.push(movie.year);
      });
      return {
        name,
        movies,
        yearsActive: [...new Set(dupeYears)].sort(),
        genres: [...new Set(dupeGenres)].sort((a, b) => a.localeCompare(b)),
      };
    }
  );
  finalActors.sort((a, b) => a.name.localeCompare(b.name));
  return finalActors;
};

const yearChangeChecker = ($inputElement: JQuery<HTMLElement>) => {
  if (+$inputElement.val() < 1900) $inputElement.val(1900);
  if (+$inputElement.val() > 2018) $inputElement.val(2018);
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
    $displayArea.append(`<li>Number of Actors: ${actors.length}</li>`);
    $displayArea.append(`<li>Number of Movies: ${movies.length}</li>`);
    $displayArea.append(`<li>Number of Movies in Each Genre:</li>`);
    Object.entries(genres).forEach(([genre, count]) => {
      $displayArea.append(`<li>Number of ${genre} Movies: ${count}</li>`);
    });
  });
};

const actorsPageHandler = () => {
  const $actorsTable = $("#actorsTableBody");
  const $nameInput = $("#nameInput");
  const $genreInput = $("#genreInput");
  const $movieInput = $("#movieInput");
  const timeouts: NodeJS.Timeout[] = [];
  const fillUi = (actors: Actor[]) => {
    timeouts.forEach((timeout) => clearTimeout(timeout));
    timeouts.length = 0;
    $actorsTable.empty();
    actors.forEach(({ name, movies, genres }) => {
      timeouts.push(
        setTimeout(() => {
          const movieLinks = movies
            .sort((a, b) => a.title.localeCompare(b.title))
            .map(
              ({ title }) => `<a href="${ORIGIN}/movie/${title}">${title}</a>`
            );
          $actorsTable.append(
            `<tr>
              <td><a href="${ORIGIN}/actor/${name}">${name}</a></td>
              <td>${movieLinks.join(", ")}</td>
              <td>${genres.join(", ")}</td>
            </tr>`
          );
        }, 0)
      );
    });
  };
  const onSearch = (actors: Actor[]) => {
    const nameFilter = $nameInput.val().toString().toLowerCase();
    const movieFilter = $movieInput.val().toString().toLowerCase();
    const genreFilter = $genreInput.val().toString().toLowerCase();
    const resolvedActors = actors.filter(({ name, movies, genres }) => {
      if (!name.toLowerCase().includes(nameFilter)) return false;
      if (
        !movies.reduce(
          (pre, cur) => pre || cur.title.toLowerCase().includes(movieFilter),
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
    fillUi(resolvedActors);
  };
  getDataThen((movies) => {
    const uniqueActors = getUniqueActors(movies);
    $nameInput.on("input", () => onSearch(uniqueActors));
    $genreInput.on("input", () => onSearch(uniqueActors));
    $movieInput.on("input", () => onSearch(uniqueActors));
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
  const timeouts: NodeJS.Timeout[] = [];
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
    timeouts.forEach((timeout) => clearTimeout(timeout));
    timeouts.length = 0;
    $movieTable.empty();
    const sortedMovies = sortMovies(movies, $sortSelect.val() as string);
    sortedMovies.forEach(({ title, year, cast, genres }) => {
      timeouts.push(
        setTimeout(() => {
          const castLinks = cast
            .sort((a, b) => a.localeCompare(b))
            .map((actor) => `<a href="${ORIGIN}/actor/${actor}">${actor}</a>`);
          $movieTable.append(
            `<tr>
              <td><a href="${ORIGIN}/movie/${title}">${title}</a></td>
              <td>${year}</td>
              <td>${castLinks.join(", ")}</td>
              <td>${genres.sort((a, b) => a.localeCompare(b)).join(", ")}</td>
            </tr>`
          );
        }, 0)
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
    const yearHandler = () => {
      yearChangeChecker($yearMaxInput);
      yearChangeChecker($yearMinInput);
      onSearch(movies);
    };
    $sortSelect.on("change", () => onSearch(movies));
    $yearMinInput.on("change", () => yearHandler());
    $yearMaxInput.on("change", () => yearHandler());
    $titleInput.on("input", () => onSearch(movies));
    $genreInput.on("input", () => onSearch(movies));
    $castInput.on("input", () => onSearch(movies));
    fillUi(movies);
  });
};

const actorPageHandler = (actor: string) => {
  const $displayArea = $("#actorInfo");
  getDataThen((movies) => {
    const myMovies = movies.filter((movie) => movie.cast.includes(actor));
    [...new Set(myMovies)].forEach(({ title }) => {
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
    const actors = [...new Set(movie.cast)].sort((a, b) => a.localeCompare(b));
    const genres = [...new Set(movie.genres)].sort((a, b) =>
      a.localeCompare(b)
    );
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
