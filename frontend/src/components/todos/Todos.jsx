import { useQuery } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, getPaginationRowModel, getExpandedRowModel, useReactTable, } from "@tanstack/react-table";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight, } from "react-icons/md";
import { toast } from "react-toastify";
import { getTodos } from "./helper";
import SubRow from "./SubTodo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { statusOptions } from "./data";
import useTodoHelper from "./useTodoHelper";

const Todos = () => {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });
    const [expanded, setExpanded] = useState({});
    const { updateTodoKey } = useTodoHelper();

    const { data: todosData, isLoading: isTodosDataLoading, error: todosDataError } = useQuery({
        queryKey: ["todos", pagination],
        queryFn: async () => {
            const data = await getTodos({ page: pagination.pageIndex + 1, pageSize: pagination.pageSize });
            return data;
        }
    });

    const data = useMemo(() => todosData?.todos ?? [], [todosData]);

    const handleStatusChange = ({ id, status }) => {
        updateTodoKey({ id, data: status, key: 'status' });
    }

    useEffect(() => {
        if (todosDataError) {
            toast.error(`Error getting todos: ${todosDataError.message}`);
        }
    }, [todosDataError]);

    useEffect(() => {
        setExpanded({});
    }, [pagination])

    const columns = useMemo(() => [
        {
            header: "Todo ID",
            accessorKey: 'id',
            cell: ({ row, getValue }) => {
                const canExpand = row.getCanExpand();
                return (
                    <div className="flex items-center" style={{
                        paddingLeft: `${row.depth * 2}rem`,
                    }}>
                        {canExpand && (
                            <button
                                onClick={row.getToggleExpandedHandler()}
                                className="mr-2 text-blue-500"
                            >
                                {row.getIsExpanded() ? '👇' : '👉'}
                            </button>
                        )}
                        {getValue()}
                    </div>
                );
            },
        },
        {
            header: "Title",
            accessorKey: "title",
        },
        {
            header: "Description",
            accessorKey: 'description',
        },
        {
            header: "Status",
            accessorKey: 'status',
            cell: ({ row, getValue }) => {
                const status = getValue();
                return (
                    <Select value={status} onValueChange={(value) => handleStatusChange({ id: row.original.id, status: value })} >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                )
            },
        },
        {
            header: "Completed",
            accessorKey: 'completed',
        }
    ], []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        rowCount: todosData?.total ?? -1,
        state: {
            pagination,
            expanded,
        },
        onPaginationChange: setPagination,
        onExpandedChange: setExpanded,
        getSubRows: row => row.subTodos,
        getPaginationRowModel: getPaginationRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: (row) => row.original.hasSubTodos,
        manualPagination: true,
    });

    return (
        <>
            {isTodosDataLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="">Loading...</div>
                </div>
            ) : <>
                <ScrollArea className="w-full overflow-y-auto">
                    <div className="mt-3">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow className="border-t" key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className=" whitespace-nowrap"
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <Fragment key={row.original.id}>
                                            <SubRow row={row} />
                                        </Fragment>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <div className="flex items-center justify-between p-4">
                    <div className="">{table.getRowCount()} Todos</div>
                    <div className="flex items-center space-x-2 ">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <MdKeyboardDoubleArrowLeft />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <IoIosArrowBack />
                        </Button>
                        <Button variant="outline">{pagination.pageIndex + 1}</Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <IoIosArrowForward />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <MdKeyboardDoubleArrowRight />
                        </Button>
                    </div>
                </div>
            </>}
        </>
    );
};

export default Todos;
