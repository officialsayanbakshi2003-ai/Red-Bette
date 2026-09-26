export const SIZE_CHART = {
  hoodies: {
    title: "Hoodies & sweatshirts (oversized fit)",
    headers: ["Size", "Chest (in)", "Length (in)", "Shoulder (in)", "Sleeve (in)"],
    rows: [
      ["XS", "42", "26", "21", "22"],
      ["S", "44", "27", "22", "23"],
      ["M", "46", "28", "23", "23.5"],
      ["L", "48", "29", "24", "24"],
      ["XL", "50", "30", "25", "24.5"],
      ["XXL", "52", "31", "26", "25"],
    ],
  },
  tees: {
    title: "Oversized tees",
    headers: ["Size", "Chest (in)", "Length (in)", "Shoulder (in)", "Sleeve (in)"],
    rows: [
      ["XS", "40", "27", "20", "8.5"],
      ["S", "42", "28", "21", "9"],
      ["M", "44", "29", "22", "9.5"],
      ["L", "46", "30", "23", "10"],
      ["XL", "48", "31", "24", "10.5"],
      ["XXL", "50", "32", "25", "11"],
    ],
  },
  joggers: {
    title: "Joggers (relaxed fit)",
    headers: ["Size", "Waist (in, relaxed)", "Hip (in)", "Length (in)", "Inseam (in)"],
    rows: [
      ["S", "28 to 30", "40", "39", "28"],
      ["M", "30 to 32", "42", "40", "28.5"],
      ["L", "32 to 34", "44", "41", "29"],
      ["XL", "34 to 36", "46", "42", "29.5"],
      ["XXL", "36 to 38", "48", "43", "30"],
    ],
  },
} as const;

export function SizeTable({ chart }: { chart: (typeof SIZE_CHART)[keyof typeof SIZE_CHART] }) {
  return (
    <div>
      <p className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.15em]">{chart.title}</p>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="bg-smoke">
            <tr>
              {chart.headers.map((h) => (
                <th key={h} scope="col" className="px-3 py-2.5 text-[0.68rem] font-semibold uppercase tracking-wider text-mist">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {chart.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) => (
                  <td key={i} className={i === 0 ? "px-3 py-2.5 font-semibold" : "px-3 py-2.5 text-mist"}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function chartForCategory(slug: string) {
  if (slug === "oversized-tees") return SIZE_CHART.tees;
  if (slug === "joggers") return SIZE_CHART.joggers;
  if (slug === "hoodies" || slug === "sweatshirts") return SIZE_CHART.hoodies;
  return null;
}
