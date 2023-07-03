import React from 'react';
import { List } from '@mui/material';
import DataGridRow from './DataGridRow';
import './DataGrid.scss';

const TodoTxtDataGrid = ({ todoObjects }) => {
  if (!todoObjects || Object.keys(todoObjects).length === 0) {
    return null;
  }

  const rows = [];

  for (const [key, data] of Object.entries(todoObjects)) {
    const header = { group: true, key: key };
    const todos = data.filter(todo => todo.body.trim() !== '').map(todo => ({
      ...todo,
      id: todo.id,
      group: false,
    }));

    rows.push(header, ...todos);
  }

  return (
    <List className="todoTxtGrid" data-testid="data-grid-component">
      {rows.map((row, index) => (
        <DataGridRow key={index} todoObject={row} />
      ))}
    </List>
  );
};

export default TodoTxtDataGrid;
