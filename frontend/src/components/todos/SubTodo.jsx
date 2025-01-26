/* eslint-disable react/prop-types */
import { TableCell, TableRow, } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { flexRender } from "@tanstack/react-table";
import { getSubTodos } from "./helper";
import { useEffect } from "react";
import { toast } from "react-toastify";
import useTodoHelper from "./useTodoHelper";

const SubRow = ({ row }) => {
    const queryClient = useQueryClient();
    const { updateTodoKey } = useTodoHelper();
    const isExpanded = row.getIsExpanded();

    const { data: subTodosData, isLoading: isSubTodosDataLoading, error: subTodosDataError } = useQuery({
        queryKey: ['subTodos', row.original.id, isExpanded],
        queryFn: async () => {
            return getSubTodos(row.original.id);
        },
        enabled: !!isExpanded,
    });

    useEffect(() => {
        if (subTodosData) {
            updateTodoKey({ id: row.original.id, data: subTodosData.subTodos, key: 'subTodos' });
        }
    }, [subTodosData, queryClient, row.original.id]);

    useEffect(() => {
        if (subTodosDataError) {
            toast.error(`Failed to fetch sub todos for todo: ${subTodosDataError.message}`);
        }
    }, [subTodosDataError]);
    
    return (
        <>
            <TableRow
                data-state={row.getIsSelected() && "selected"}
                className=""
            >
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                    </TableCell>
                ))}
            </TableRow>
            {isSubTodosDataLoading && <TableRow>
                <TableCell >
                    <div className="text-center">Loading...</div>
                </TableCell>
            </TableRow>}
            {row.original.subTodos && row.original.subTodos.length === 0 && <TableRow>
                <TableCell >
                    <div className="text-center">No sub todos found.</div>
                </TableCell>
            </TableRow>}
        </>
    );
};

export default SubRow