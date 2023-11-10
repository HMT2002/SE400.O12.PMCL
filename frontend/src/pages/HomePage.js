import React, { useEffect, useState, useCallback } from 'react';

import SectionList from '../components/sections/SectionList';
import ReactLoading from 'react-loading';

import { GETAllThreadAction } from '../APIs/thread-apis';
import axios from 'axios';

const HomePage = () => {
  const tags = [
    // "Popular",
    'Trending',
    'Latest Movies',
    'Latest TV Shows',
    'Coming Soon',
  ];

  const [threads, setThreads] = useState([]); // all threads in loaded in homepage

  const fetchThreadsHandler = useCallback(async () => {
    try {
      const response = await GETAllThreadAction();

      if (response.status === 'ok') {
        setThreads(response.data.allInfo);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  // load all threads for the first time access homepage
  // should change to load a set (10-15) of newest threads for #Popular secion
  useEffect(() => {
    fetchThreadsHandler();
  }, [fetchThreadsHandler]);

  return (
    <React.Fragment>
      {threads.length === 0 && (
        <div className="account-page__loading">
          <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
        </div>
      )}
      {threads.length > 0 && <SectionList labels={tags} threads={threads} />}
    </React.Fragment>
  );
};

export default HomePage;
