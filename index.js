const todo = (state = {}, action) => {
  switch (action.type) {
    case "ADD":
      return {
        id: action.id,
        text: action.text,
        isChecked: false
      };
    case "TOGGLE":
      console.log("t o g g l i n g :: ", state, action);
      if (state.id !== action.id) {
        return state;
      }
      let r = {
        ...state,
        isChecked: !state.isChecked
      };
      console.log("State after toggle: ", r);
      return r;
    default:
      return [...state];
  }
};

const todos = (state = [], action) => {
  console.log("dispatch: ", state, action);
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

const todoApp = (state = {}, action) => {
  return {
    todos: todos(state.todos, action),
    visibilityFilter: visibilityFilter(state.visibilityFilter, action)
  };
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

const {createStore} = Redux;
const {combineReducers} = Redux;
const store = createStore(todoApp);

combineReducers({
  todos,
  visibilityFilter
});

/////////////////////////////////////////////////////////////////////////////
//COMPONENETS////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

class FilterLink extends React.Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    const state = store.getState();
    return <Link
      active={props.filter === state.visibilityFilter}
      onClick={() => {
        store.dispatch({type: "SET_VISIBILITY_FILTER", filter: props.filter});
      }}>{props.children}</Link>
  }
}


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

const Todo = ({text, isChecked, onToggle}) => (
  <li style={{textDecoration: isChecked ? "line-through" : "none"}}>
    <a href="">x</a>
    <input type="checkbox" onChange={onToggle}/>
    {text}
  </li>
);

const filterTodos = ({todos, visibilityFilter}) => {
  console.log("filtering %s todos:: %o", visibilityFilter, todos);
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

const AddToDo = () => {
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
          store.dispatch({type: "ADD", text: some.value, id: count++});
          some.value = "";
        }}
      >
        Add todo
      </button>
    </p>
  );
};

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

class VisibleTodos extends React.Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    const state = store.getState();

    return <TodosList todos={filterTodos({
      todos: state.todos,
      visibilityFilter: state.visibilityFilter
    })}
                      onTodoToggle={id => store.dispatch({type: "TOGGLE", id})}>
    </TodosList>
  }
}

console.log(
  "store.getState().visibilityFilter on loading:::",
  store.getState().visibilityFilter
);

let count = 0;
const TodoApp = () => (
  <div>
    <h1>Todos app</h1>
    <AddToDo/>
    <VisibleTodos/>
    <Footer/>
  </div>
);

ReactDOM.render(<TodoApp/>, document.getElementById("root"));

testAddTod();
testToggleTodo();
console.log("All tests passed");
