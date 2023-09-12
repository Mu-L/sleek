import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, Button, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import './Search.scss';

const ipcRenderer = window.electron.ipcRenderer;

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const Search = ({ headers, searchString, setSearchString, isSearchOpen, setIsSearchOpen, searchFieldRef }) => {
  
  const label = headers?.availableObjects
    ? `Showing ${headers.visibleObjects} of ${headers.availableObjects}`
    : null;

  const handleInput = (event) => {
    const searchString = event.target.value;
    setSearchString(searchString);
  };

  const handleAddTodo = (event) => {
    ipcRenderer.send('writeTodoToFile', undefined, searchString);
    setSearchString('');
    searchFieldRef.current.focus();
  };

  const handleXClick = () => {
    setSearchString('');
    searchFieldRef.current.focus();
  };

  useEffect(() => {
    if (searchString === null) return;
    const handleSearch = () => {
      ipcRenderer.send('requestData', searchString);
    };
    const delayedSearch = debounce(handleSearch, 200);
    delayedSearch();
    return delayedSearch.cancel;
  }, [searchString]);

  useEffect(() => {
    if (isSearchOpen && searchFieldRef.current) {
      searchFieldRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <>
      {isSearchOpen && (
        <Box 
          id='Search'
          className={isSearchOpen ? 'active' : ''}
        >
          <TextField
            variant='outlined'
            placeholder={`Searching ${headers.availableObjects} todos`}
            inputRef={searchFieldRef}
            value={searchString === null ? '' : searchString}
            onChange={handleInput}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  {searchString && searchString.length > 0 && (
                    <Button onClick={handleAddTodo}>Add as todo</Button>
                  )}
                  {searchString && searchString.length > 0 && (
                    <button
                      tabIndex={0}
                      className='xClick'
                      onClick={handleXClick}
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}
    </>
  );
};

export default Search;
