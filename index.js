/////////////////////////////////////////////////////////////////////////////
//REDUCERS///////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

const todo = (state = {}, action) => {
  switch (action.type) {
    case "ADD":
      return {
        id: action.id,
        text: action.text,
        isChecked: false
      };
    case "TOGGLE":
      if (state.id !== action.id) {
        return state;
      }
      let r = {
        ...state,
        isChecked: !state.isChecked
      };
      return r;
    default:
      return [...state];
  }
};

const todos = (state = [], action) => {
  switch (action.type) {
    case "ADD":
      return [...state, todo(null, action)];
    case "TOGGLE":
      return state.slice().map(s => {
        return todo(s, action);
      });
    default:
      return [...state];
  }
};

const visibilityFilter = (state = "SHOW ALL", action) => {
  switch (action.type) {
    case "SET_VISIBILITY_FILTER":
      return action.filter || "SHOW ALL";
    default:
      return state;
  }
};

const testAddTod = () => {
  const stateBefore = [];
  let stateAfter = todos(stateBefore, {
    id: "1",
    text: "Todo 1",
    type: "ADD",
    isChecked: false
  });
  expect(stateAfter).toEqual([
    {
      id: "1",
      text: "Todo 1",
      isChecked: false
    }
  ]);
};

const testToggleTodo = () => {
  const stateBefore = [
    {
      id: "1",
      text: "Todo 1",
      isChecked: false
    }
  ];
  let stateAfter = todos(stateBefore, {
    id: "1",
    type: "TOGGLE"
  });
  expect(stateAfter).toEqual([
    {
      id: "1",
      text: "Todo 1",
      isChecked: true
    }
  ]);
};

const {createStore, combineReducers} = Redux;
const {Provider, connect} = ReactRedux;

const todoApp = combineReducers({
  todos,
  visibilityFilter
});


/////////////////////////////////////////////////////////////////////////////
//ACTION CREATORS////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

let count = 0;
const addTodo = (text) => {
  return {type: "ADD", text, id: count++}
};

const setVisibilityFilter = (filter) => {
  return {type: "SET_VISIBILITY_FILTER", filter: filter};
};

const toogleTodo = (id) => {
  return {type: "TOGGLE", id};
};


/////////////////////////////////////////////////////////////////////////////
//COMPONENETS////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

const Link = ({
                children,
                active,
                onClick
              }) => {
  if (active) {
    return <span>{children}</span>;
  }
  return (
    <a href="#"
       onClick={e => {
         e.preventDefault();
         onClick();
       }}>
      {children}
    </a>
  );
};

const mapStateToProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter));
    }
  }
};

const FilterLink = connect(mapStateToProps, mapDispatchToProps)(Link);


const Todo = ({text, isChecked, onToggle}) => (
  <li style={{textDecoration: isChecked ? "line-through" : "none"}}>
    <a href="">x</a>
    <input type="checkbox" onChange={onToggle}/>
    {text}
  </li>
);

const filterTodos = ({todos, visibilityFilter}) => {
  switch (visibilityFilter) {
    case "SHOW_ALL":
      return todos;
    case "SHOW_ACTIVE":
      return todos.filter(t => !t.isChecked);
    case "SHOW_COMPLETED":
      return todos.filter(t => t.isChecked);
    default:
      return todos;
  }
};

let AddToDo = ({dispatch}) => {
  let some;
  return (
    <p>
      <input
        type="text"
        ref={blee => {
          some = blee;
        }}
      />
      <button
        onClick={() => {
          dispatch(addTodo(some.value));
          some.value = "";
        }}
      >
        Add todo
      </button>
    </p>
  );
};

AddToDo = connect()(AddToDo);

const Footer = () => (
  <p>
    Show:{" "}
    <FilterLink filter="SHOW_ALL">
      All
    </FilterLink>{" "}
    <FilterLink filter="SHOW_ACTIVE">
      Acive
    </FilterLink>{" "}
    <FilterLink filter="SHOW_COMPLETED">
      Completed
    </FilterLink>
  </p>
);

const TodosList = ({
                     todos,
                     onTodoToggle
                   }) => {
  let todoList = todos.map(t => {
    return (
      <Todo
        isChecked={t.isChecked}
        id={t.id}
        text={t.text}
        toggle={t}
        onToggle={() => onTodoToggle(t.id)}
      />
    );
  });

  return (
    <div>
      <ul>{todoList}</ul>
    </div>
  );
};

const mapStateToProps1 = (state) => {
  return {
    todos: filterTodos({
      todos: state.todos,
      visibilityFilter: state.visibilityFilter
    })
  }
};

const mapDispatchToProps1 = (dispatch => {
  return {
    onTodoToggle: (id) => {
      dispatch(toogleTodo(id))
    }
  }
});

const VisibleTodos = connect(mapStateToProps1, mapDispatchToProps1)(TodosList);

const TodoApp = () => (
  <div>
    <h1>Todos app</h1>
    <AddToDo/>
    <VisibleTodos/>
    <Footer/>
  </div>
);


ReactDOM.render(<Provider store={createStore(todoApp)}>
    <TodoApp/>
  </Provider>,
  document.getElementById("root"));

testAddTod();
testToggleTodo();
console.log("All tests passed");
