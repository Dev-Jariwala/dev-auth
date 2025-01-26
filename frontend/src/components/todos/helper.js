// create todo's data.js file

import { todos } from "./data";

// export const status = [
//     { value: 'pending', label: 'Pending' },
//     { value: 'completed', label: 'Completed' },
//     { value: 'onhold', label: 'On Hold' },
//     { value: 'cancelled', label: 'Cancelled' },
//     { value: 'inreview', label: 'In Review' }
// ]

// export const todos = [
//     { id: 1, title: 'Todo 1', description: 'Description 1', status: 'pending', completed: false },
//     { id: 2, title: 'Todo 2', description: 'Description 2', status: 'completed', completed: true },
//     { id: 3, title: 'Todo 3', description: 'Description 3', status: 'onhold', completed: false },
//     { id: 4, title: 'Todo 4', description: 'Description 4', status: 'cancelled', completed: false },
//     { id: 5, title: 'Todo 5', description: 'Description 5', status: 'inreview', completed: false },
//     { id: 6, title: 'Todo 6', description: 'Description 6', status: 'pending', completed: false },
//     { id: 7, title: 'Todo 7', description: 'Description 7', status: 'completed', completed: true },
//     { id: 8, title: 'Todo 8', description: 'Description 8', status: 'onhold', completed: false },
//     { id: 9, title: 'Todo 9', description: 'Description 9', status: 'cancelled', completed: false },
//     { id: 10, title: 'Todo 10', description: 'Description 10', status: 'inreview', completed: false },
//     { id: 11, title: 'Todo 11', description: 'Description 11', status: 'pending', completed: false },
//     { id: 12, title: 'Todo 12', description: 'Description 12', status: 'completed', completed: true },
//     { id: 13, title: 'Todo 13', description: 'Description 13', status: 'onhold', completed: false },
//     { id: 14, title: 'Todo 14', description: 'Description 14', status: 'cancelled', completed: false },
//     { id: 15, title: 'Todo 15', description: 'Description 15', status: 'inreview', completed: false },
//     { id: 16, title: 'Sub Todo 1', description: 'Sub Description 1', status: 'pending', completed: false, todoId: 1 },
//     { id: 17, title: 'Sub Todo 2', description: 'Sub Description 2', status: 'completed', completed: true, todoId: 2 },
//     { id: 18, title: 'Sub Todo 3', description: 'Sub Description 3', status: 'onhold', completed: false, todoId: 3 },
//     { id: 19, title: 'Sub Todo 4', description: 'Sub Description 4', status: 'cancelled', completed: false, todoId: 4 },
//     { id: 20, title: 'Sub Todo 5', description: 'Sub Description 5', status: 'inreview', completed: false, todoId: 5 },
//     { id: 21, title: 'Sub Todo 6', description: 'Sub Description 6', status: 'pending', completed: false, todoId: 6 },
//     { id: 22, title: 'Sub Todo 7', description: 'Sub Description 7', status: 'completed', completed: true, todoId: 7 },
//     { id: 23, title: 'Sub Todo 8', description: 'Sub Description 8', status: 'onhold', completed: false, todoId: 8 },
//     { id: 24, title: 'Sub Todo 9', description: 'Sub Description 9', status: 'cancelled', completed: false, todoId: 9 },
//     { id: 25, title: 'Sub Todo 10', description: 'Sub Description 10', status: 'inreview', completed: false, todoId: 10 },
//     { id: 26, title: 'Sub Todo 11', description: 'Sub Description 11', status: 'pending', completed: false, todoId: 11 },
//     { id: 27, title: 'Sub Todo 12', description: 'Sub Description 12', status: 'completed', completed: true, todoId: 12 },
//     { id: 28, title: 'Sub Todo 13', description: 'Sub Description 13', status: 'onhold', completed: false, todoId: 13 },
//     { id: 29, title: 'Sub Todo 14', description: 'Sub Description 14', status: 'cancelled', completed: false, todoId: 14 },
//     { id: 30, title: 'Sub Todo 15', description: 'Sub Description 15', status: 'inreview', completed: false, todoId: 15 },
//     { id: 31, title: 'Sub Sub Todo 1', description: 'Sub Sub Description 1', status: 'pending', completed: false, todoId: 16 },
//     { id: 32, title: 'Sub Sub Todo 2', description: 'Sub Sub Description 2', status: 'completed', completed: true, todoId: 17 },
//     { id: 33, title: 'Sub Sub Todo 3', description: 'Sub Sub Description 3', status: 'onhold', completed: false, todoId: 18 },
//     { id: 34, title: 'Sub Sub Todo 4', description: 'Sub Sub Description 4', status: 'cancelled', completed: false, todoId: 19 },
//     { id: 35, title: 'Sub Sub Todo 5', description: 'Sub Sub Description 5', status: 'inreview', completed: false, todoId: 20 },
//     { id: 36, title: 'Sub Sub Todo 6', description: 'Sub Sub Description 6', status: 'pending', completed: false, todoId: 21 },
//     { id: 37, title: 'Sub Sub Todo 7', description: 'Sub Sub Description 7', status: 'completed', completed: true, todoId: 22 },
//     { id: 38, title: 'Sub Sub Todo 8', description: 'Sub Sub Description 8', status: 'onhold', completed: false, todoId: 23 },
//     { id: 39, title: 'Sub Sub Todo 9', description: 'Sub Sub Description 9', status: 'cancelled', completed: false, todoId: 24 },
//     { id: 40, title: 'Sub Sub Todo 10', description: 'Sub Sub Description 10', status: 'inreview', completed: false, todoId: 25 },
//     { id: 41, title: 'Sub Sub Todo 11', description: 'Sub Sub Description 11', status: 'pending', completed: false, todoId: 26 },
//     { id: 42, title: 'Sub Sub Todo 12', description: 'Sub Sub Description 12', status: 'completed', completed: true, todoId: 27 },
//     { id: 43, title: 'Sub Sub Todo 13', description: 'Sub Sub Description 13', status: 'onhold', completed: false, todoId: 28 },
//     { id: 44, title: 'Sub Sub Todo 14', description: 'Sub Sub Description 14', status: 'cancelled', completed: false, todoId: 29 },
//     { id: 45, title: 'Sub Sub Todo 15', description: 'Sub Sub Description 15', status: 'inreview', completed: false, todoId: 30 },
//     { id: 46, title: 'Sub Sub Sub Todo 1', description: 'Sub Sub Sub Description 1', status: 'pending', completed: false, todoId: 31 },
// ];

export const getTodos = async ({ page = 1, pageSize = 10 }) => {
    try {
        console.log(`Fetching todos for page: ${page} and pageSize: ${pageSize}`);
        await new Promise(resolve => setTimeout(resolve, 500));

        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        const parentTodos = todos.filter((todo) => {
            return !todo.todoId;
        }).map((todo) => {
            const hasSubTodos = todos.some((subTodo) => subTodo.todoId === todo.id);
            return {
                ...todo,
                hasSubTodos
            }
        });

        return { todos: parentTodos.slice(start, end), total: parentTodos.length, nextPage: end < parentTodos.length ? page + 1 : undefined };
    } catch (error) {
        console.error(error);
        return { todos: [], total: 0 };
    }
};

export const getTodo = async (id) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        return todos.find((todo) => todo.id === id);
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getSubTodos = async (todoId) => {
    try {
        console.log(`Fetching sub todos for todoId: ${todoId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const subTodos = todos.filter((todo) => todo.todoId === todoId).map((todo) => {
            const hasSubTodos = todos.some((subTodo) => subTodo.todoId === todo.id);
            return {
                ...todo,
                hasSubTodos
            }
        });
        return { todoId, subTodos };
    } catch (error) {
        console.error(error);
        return [];
    }
}