import { useQueryClient } from "@tanstack/react-query";

const useTodoHelper = () => {
    const queryClient = useQueryClient();

    const updateTodoKey = ({ id, data, key }) => {
        console.log(`Updating todo with id: ${id} and key: ${key} with data:`, data);
        const todoData = queryClient.getQueriesData({ queryKey: ['todos'] });
        if (todoData && todoData?.length === 0) {
            console.log('No data found');
        } else {
            for (const entry of todoData) {
                queryClient.setQueryData(['todos', entry[0][1]], (oldData) => {
                    if (!oldData) return;
                    // console.log('oldData', oldData);
                    const updateTodoRecursively = (todos) => {
                        return todos.map((todo) => {
                            if (todo.id === id) {
                                return {
                                    ...todo,
                                    [key]: data,
                                };
                            }
                            if (todo.subTodos && todo.subTodos.length > 0) {
                                return {
                                    ...todo,
                                    subTodos: updateTodoRecursively(todo.subTodos),
                                };
                            }
                            return todo;
                        });
                    };
                    const newData = updateTodoRecursively(oldData.todos);
                    return { ...oldData, todos: newData };
                })
            }
        }
    }
    return {
        updateTodoKey
    }
}

export default useTodoHelper