import type { Meta, StoryObj } from "@storybook/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { DataTable } from "./DataTable";

interface Row {
  id: string;
  name: string;
  college: string;
  readiness: number;
}

const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({
  id: `st-${i}`,
  name: `Student ${i + 1}`,
  college: i % 2 ? "SCMHRD Pune" : "IIM Indore",
  readiness: 40 + ((i * 7) % 55),
}));
const big: Row[] = Array.from({ length: 1000 }, (_, i) => ({
  ...rows[i % 25]!,
  id: `b-${i}`,
  name: `Student ${i + 1}`,
}));

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "college", header: "College" },
  { accessorKey: "readiness", header: "Readiness", cell: (c) => `${c.getValue()}%` },
];

const meta: Meta = { title: "Shared/DataTable" };
export default meta;
type S = StoryObj;

function Demo(props: { data?: Row[]; loading?: boolean; error?: boolean }) {
  const [page, setPage] = useState(1);
  const data = props.data ?? rows;
  return (
    <div className="p-6">
      <DataTable
        caption="Students"
        columns={columns}
        data={data}
        total={data.length}
        page={page}
        pageSize={25}
        onPageChange={setPage}
        loading={props.loading}
        error={props.error}
        onRetry={() => {}}
        emptyTitle="No students match"
      />
    </div>
  );
}

export const Default: S = { render: () => <Demo /> };
export const Virtualised1000: S = { render: () => <Demo data={big} /> };
export const Loading: S = { render: () => <Demo loading /> };
export const Empty: S = { render: () => <Demo data={[]} /> };
export const ErrorState: S = { render: () => <Demo error /> };
export const Phone: S = {
  render: () => <Demo />,
  parameters: { viewport: { defaultViewport: "phone" } },
};
