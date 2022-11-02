import type {
  Column,
  Table,
  FilterFn,
  SortingFn,
} from "@tanstack/table-core";

import {
  useReactTable,
  createColumnHelper,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  sortingFns,
  filterFns,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

import { getMockData } from "../Utils/mockData";
import type { MockData } from "../Utils/mockData";
import React, { useState } from "react";

declare module "@tanstack/table-core" {
  interface FilterFns {
    between: FilterFn<any>;
    patient: FilterFn<any>;
    laboratory: FilterFn<any>;
  }
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
}

interface Laboratory {
  id: number;
  name: string;
}

const patientFilter: FilterFn<MockData> = (row, colId, val) => {
  const patient: Patient = row.getValue(colId);
  return (
    patient.firstName.toLowerCase().includes(val.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(val.toLowerCase()) ||
    patient.id.toString().includes(val)
  );
};

const labFilter: FilterFn<MockData> = (row, colId, val) => {
  const lab: Laboratory = row.getValue(colId);
  return (
    lab.name.toLowerCase().includes(val.toLowerCase()) ||
    lab.id.toString().includes(val)
  );
};

const between: FilterFn<MockData> = (row, colId, val) => {
  const date = new Date(row.getValue(colId));

  if (val[0] === "" && val[1] === "") return true;
  else if (val[0] === "") {
    const end = new Date(val[1]).getTime();
    return date.getTime() <= end;
  } else if (val[1] === "") {
    const start = new Date(val[0]).getTime();
    return date.getTime() >= start;
  } else {
    const start = new Date(val[0]).getTime();
    const end = new Date(val[1]).getTime();
    return date.getTime() >= start && date.getTime() <= end;
  }
};

const colHelper = createColumnHelper<MockData>();

const columns = [
  colHelper.accessor("date", {
    header: "DATUM",
    cell: (props) => props.getValue().toLocaleDateString("de-DE"),
    filterFn: between,
    sortingFn: sortingFns.datetime,
  }),
  colHelper.accessor("orderNumber", {
    header: "AUFTRAGSNR.",
    cell: (props) => props.getValue(),
    filterFn: filterFns.weakEquals,
  }),
  colHelper.accessor("Patient", {
    header: "PATIENT",
    cell: (props) => (
      <span>
        {props.getValue().firstName} {props.getValue().lastName}
      </span>
    ),
    filterFn: patientFilter,
  }),
  colHelper.accessor("Laboratory", {
    header: "LABOR",
    cell: (props) => props.getValue().name,
    filterFn: labFilter,
  }),
  colHelper.accessor("deliveryDate", {
    header: "LIEFERDATUM",
    cell: (props) => props.getValue().toLocaleDateString("de-DE"),
    filterFn: between,
    sortingFn: sortingFns.datetime,
  }),
  colHelper.accessor("status", {
    header: "STATUS",
    cell: (props) => props.getValue(),
  }),
];

export default function Home() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<MockData[]>(getMockData());

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<unknown, any>[],
    filterFns: {
      between,
      patient: patientFilter,
      laboratory: labFilter,
    },
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getSortedRowModel: getSortedRowModel(),
    debugAll: true,
  });

  return (
    <div className="table-container">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    <>
                      <div
                        {...{
                          className: header.column.getCanSort() ? "sort" : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                      {header.column.getCanFilter() ? (
                        <div>
                          <Filter column={header.column} table={table} />
                        </div>
                      ) : null}
                    </>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const Filter = ({
  column,
  table,
}: {
  column: Column<any, unknown>;
  table: Table<any>;
}) => {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0].getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  if (firstValue instanceof Date) {
    return (
      <div>
        <DebouncedInput
          type={"date"}
          value={(columnFilterValue as [string, string])?.[0] ?? ""}
          onChange={(value) => {
            column.setFilterValue((columnFilterValue: [string, string]) => [
              value,
              columnFilterValue?.[1],
            ]);
          }}
        />
        <DebouncedInput
          type={"date"}
          value={(columnFilterValue as [string, string])?.[1] ?? ""}
          onChange={(value) => {
            column.setFilterValue((columnFilterValue: [string, string]) => [
              columnFilterValue?.[0],
              value,
            ]);
          }}
        />
      </div>
    );
  } else {
    return (
      <DebouncedInput
        value={columnFilterValue as string}
        onChange={column.setFilterValue}
        placeholder={`Search (${column.getFacetedUniqueValues().size})`}
      />
    );
  }
};

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) => {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};
