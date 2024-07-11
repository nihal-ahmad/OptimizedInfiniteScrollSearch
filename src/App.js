import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./App.css";
import { Search } from "lucide-react";

let timer;
const App = () => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error,setError] = useState(false);
  const observer = useRef();

  const lastElement = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      console.log("in", entries);
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPageNumber) => prevPageNumber + 1);
      }
    });
    console.log("node", node);
    if (node) observer.current.observe(node);
  };

  console.log("oberser", observer);

  useEffect(() => {
    setData([]);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const getSearchItems = async () => {
      try {
        if(query!=""){
          const shows = await axios.get(
            `http://openlibrary.org/search.json?title=${query}&page=${page}`
          );
          setLoading(false);
          setHasMore(shows.data.docs.length > 0);
          setData((prevBooks) => {
            return [
              ...new Set([...prevBooks, ...shows.data.docs.map((b) => b.title)]),
            ];
          });
        }

      } catch (error) {
        setError(true);
      }

    };

    getSearchItems();
  }, [query, page]);

  const handleChange = (e) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      if(e.target.value!=undefined)
        {
          setQuery(e.target.value);
          setPage(1);
        }
        else if(e.target.value=="")
          setQuery("");

    }, 1000);
  };

  return (
    <div className="searchContainer">
      <div style={{display: "flex",justifyContent: "space-between",alignItems: "center"}}>
      <input className="input" type="text" onChange={(e) => handleChange(e)} />
      <span className="search-icon" onClick={handleChange}><Search></Search></span>
      </div>
      {data.map((book, index) => {
        if (data.length === index + 1) {
          return (
            <div className="searchTitle" ref={lastElement} key={book}>
              {book}
            </div>
          );
        } else {
          return (
            <div className="searchtTitle" key={book}>
              {book}
            </div>
          );
        }
      })}
      <div>{loading && query=="" && 'Search for books to show results ...'}</div>
      <div>{!error && loading && !query=="" && 'Loading...'}</div>
      <div>{error && 'Error'}</div>
    </div>
  );
};

export default App;
