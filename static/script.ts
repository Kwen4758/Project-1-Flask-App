interface Movie {
  title: string;
  year: number;
  cast: string[];
  genres: string[];
}

const getDataThen = (onSuccess: (movies: Movie[]) => void) => {
  $.ajax({
    type: "GET",
    url: `${window.location.origin}/static/movies.json`,
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
  uniqueActors.sort();
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
  getDataThen((movies) => {
    const uniqueActors = getUniqueActors(movies);
    uniqueActors.forEach((actor) => {
      $displayArea.append(
        `<li><a href="${window.location.origin}/actor/${actor}">${actor}</a></li>`
      );
    });
  });
};

const moviesPageHandler = () => {
  const $displayArea = $("#moviesList");
  getDataThen((movies) => {
    const movieTitles = movies.map((movie) => movie.title).sort();
    movieTitles.forEach((title) => {
      $displayArea.append(

        `<li><a href="${window.location.origin}/movie/${title}"><em>${title}</em></a></li>`
      );
    });
  });
};

const actorPageHandler = (actor: string) => {
  const $displayArea = $("#actorInfo");
  getDataThen((movies) => {
    console.log(actor);
    const myMovies = movies.filter((movie) => movie.cast.includes(actor));
    [...new Set(myMovies)].forEach((movie) => {
      const title = movie.title;
      $displayArea.append(
        `<li><a href="${window.location.origin}/movie/${title}">${title}</a></li>`
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
          `<li><a href="${window.location.origin}/actor/${actor}">${actor}</a></li>`
        );
      });
    }
  });
};
