import { useEffect, useMemo, useState } from "react";
import {flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, } from "@tanstack/react-table";
import styles from "./App.module.css";

const initialFormData = {
  guitarModel: "",
  bodyType: "",
  brandName: "",
  stockQuantity: "",
  manufacturerName: "",
  userRole: "",
};

function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const [guitars, setGuitars] = useState([]);

  const [currentView, setCurrentView] = useState("form");

  const [selectedGuitar, setSelectedGuitar] = useState(null);

    // Stores the guitar displayed in the complete detail card
  const [activeGuitar, setActiveGuitar] = useState(null);

  // Controls the Merchant and Consumer table filter
  const [roleFilter, setRoleFilter] = useState("All");

  // Synchronizes the selected table row with the active detail card
  useEffect(() => {
    setActiveGuitar(selectedGuitar);
  }, [selectedGuitar]);

  function validateField(name, value) {
    const cleanedValue =
      typeof value === "string" ? value.trim() : value;

    if (!cleanedValue) {
      return "This field is required.";
    }

    if (name === "guitarModel" && cleanedValue.length < 3) {
      return "Guitar model must have at least 3 characters.";
    }

    if (name === "stockQuantity") {
      const stock = Number(value);

      if (!Number.isInteger(stock) || stock < 1 || stock > 100) {
        return "Stock quantity must be a whole number from 1 to 100.";
      }
    }

    return "";
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: validateField(name, value),
    }));
  }

  function handleBlur(event) {
    const { name, value } = event.target;

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: validateField(name, value),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newErrors = {};

    Object.keys(formData).forEach((fieldName) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName]
      );
    });

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(
      (errorMessage) => errorMessage !== ""
    );

    // Blocks submission when at least one error exists
    if (hasErrors) {
      return;
    }

    const newGuitar = {
      id: crypto.randomUUID(),
      guitarModel: formData.guitarModel.trim(),
      bodyType: formData.bodyType,
      brandName: formData.brandName.trim(),
      stockQuantity: Number(formData.stockQuantity),
      manufacturerName: formData.manufacturerName.trim(),
      userRole: formData.userRole,
    };

    // Adds the new guitar without directly modifying existing state
    setGuitars((currentGuitars) => [
      ...currentGuitars,
      newGuitar,
    ]);

    // Makes the newly submitted guitar the selected row
    setSelectedGuitar(newGuitar);

    // Clears the form after successful submission
    setFormData(initialFormData);
    setErrors({});

    // Automatically switches to the Registry Table View
    setCurrentView("registry");
  }

  function getInputClass(fieldName) {
    return errors[fieldName] ? styles.invalidInput : "";
  }

  const filteredGuitars = useMemo(() => {
  if (roleFilter === "All") {
    return guitars;
  }

  return guitars.filter(
    (guitar) => guitar.userRole === roleFilter
  );
  }, [guitars, roleFilter]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "guitarModel",
        header: "Guitar Model",
      },
      {
        accessorKey: "bodyType",
        header: "Body Type",
      },
      {
        accessorKey: "brandName",
        header: "Brand",
      },
      {
        accessorKey: "stockQuantity",
        header: "Stock",
      },
      {
        accessorKey: "manufacturerName",
        header: "Manufacturer",
      },
      {
        accessorKey: "userRole",
        header: "User Role",
        cell: (info) => {
          const role = info.getValue();

          return (
            <span
              className={
                role === "Merchant"
                  ? styles.merchantBadge
                  : styles.consumerBadge
              }
            >
              {role}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredGuitars,
    columns,

    // Four records will be displayed per page
    initialState: {
      pagination: {
        pageSize: 4,
      },
    },

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.label}>
            Set B Practical Examination
          </p>

          <h1>Guitar Store Inventory</h1>

          <p>
            Register guitars and manage inventory using React
            Hooks and TanStack Table.
          </p>
        </header>

        <nav className={styles.navigation}>
          <button
            type="button"
            className={
              currentView === "form"
                ? styles.activeNavigation
                : styles.navigationButton
            }
            onClick={() => setCurrentView("form")}
          >
            Register Guitar
          </button>

          <button
            type="button"
            className={
              currentView === "registry"
                ? styles.activeNavigation
                : styles.navigationButton
            }
            onClick={() => setCurrentView("registry")}
          >
            Inventory Registry ({guitars.length})
          </button>
        </nav>

        {currentView === "form" && (
          <section className={styles.formCard}>
            <div className={styles.formTitle}>
              <h2>Register a Guitar</h2>
              <p>Complete all required information below.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="guitarModel">
                    Guitar Model
                  </label>

                  <input
                    id="guitarModel"
                    type="text"
                    name="guitarModel"
                    placeholder="Example: Player Stratocaster"
                    value={formData.guitarModel}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass("guitarModel")}
                  />

                  <span className={styles.error}>
                    {errors.guitarModel}
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="bodyType">Body Type</label>

                  <select
                    id="bodyType"
                    name="bodyType"
                    value={formData.bodyType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass("bodyType")}
                  >
                    <option value="">Select body type</option>
                    <option value="Electric">Electric</option>
                    <option value="Acoustic">Acoustic</option>
                    <option value="Bass">Bass</option>
                    <option value="Classical">Classical</option>
                  </select>

                  <span className={styles.error}>
                    {errors.bodyType}
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="brandName">Brand Name</label>

                  <input
                    id="brandName"
                    type="text"
                    name="brandName"
                    placeholder="Example: Fender"
                    value={formData.brandName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass("brandName")}
                  />

                  <span className={styles.error}>
                    {errors.brandName}
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="stockQuantity">
                    Stock Quantity (1–100)
                  </label>

                  <input
                    id="stockQuantity"
                    type="number"
                    name="stockQuantity"
                    min="1"
                    max="100"
                    step="1"
                    placeholder="Example: 15"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass("stockQuantity")}
                  />

                  <span className={styles.error}>
                    {errors.stockQuantity}
                  </span>
                </div>

                <div
                  className={`${styles.formGroup} ${styles.fullWidth}`}
                >
                  <label htmlFor="manufacturerName">
                    Manufacturer Name
                  </label>

                  <input
                    id="manufacturerName"
                    type="text"
                    name="manufacturerName"
                    placeholder="Example: Fender Musical Instruments"
                    value={formData.manufacturerName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass(
                      "manufacturerName"
                    )}
                  />

                  <span className={styles.error}>
                    {errors.manufacturerName}
                  </span>
                </div>

                <fieldset
                  className={`${styles.roleGroup} ${styles.fullWidth}`}
                >
                  <legend>User Role</legend>

                  <div className={styles.roleOptions}>
                    <label
                      className={`${styles.roleCard} ${
                        formData.userRole === "Merchant"
                          ? styles.selectedRole
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value="Merchant"
                        checked={
                          formData.userRole === "Merchant"
                        }
                        onChange={handleChange}
                      />

                      <span className={styles.roleText}>
                        <strong>Merchant</strong>
                        <small>
                          Manages and sells guitar inventory
                        </small>
                      </span>
                    </label>

                    <label
                      className={`${styles.roleCard} ${
                        formData.userRole === "Consumer"
                          ? styles.selectedRole
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        value="Consumer"
                        checked={
                          formData.userRole === "Consumer"
                        }
                        onChange={handleChange}
                      />

                      <span className={styles.roleText}>
                        <strong>Consumer</strong>
                        <small>
                          Browses available guitar products
                        </small>
                      </span>
                    </label>
                  </div>

                  <span className={styles.error}>
                    {errors.userRole}
                  </span>
                </fieldset>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
              >
                Add Guitar to Inventory
              </button>
            </form>
          </section>
        )}

        {currentView === "registry" && (
          <section className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <div>
                <p className={styles.label}>
                  TanStack Registry
                </p>

                <h2>Guitar Inventory</h2>

                <p>
                  Click any table row to select it as the
                  active item.
                </p>
              </div>

              <div className={styles.tableActions}>
              <label className={styles.filterControl}>
                <span>Filter by Role</span>

                <select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(event.target.value);
                    table.setPageIndex(0);
                  }}
                >
                  <option value="All">All Roles</option>
                  <option value="Merchant">Merchant</option>
                  <option value="Consumer">Consumer</option>
                </select>
              </label>

              <button
                type="button"
                className={styles.addButton}
                onClick={() => setCurrentView("form")}
              >
                + Add Guitar
              </button>
            </div>
            </div>

            {selectedGuitar && (
              <div className={styles.activeSelection}>
                Active selection:
                <strong>
                  {" "}
                  {selectedGuitar.guitarModel}
                </strong>
              </div>
            )}

            <div className={styles.tableWrapper}>
              <table className={styles.inventoryTable}>
                <thead>
                  {table.getHeaderGroups().map(
                    (headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef
                                    .header,
                                  header.getContext()
                                )}
                          </th>
                        ))}
                      </tr>
                    )
                  )}
                </thead>

                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className={
                          selectedGuitar?.id ===
                          row.original.id
                            ? styles.selectedRow
                            : ""
                        }
                        onClick={() =>
                          setSelectedGuitar(row.original)
                        }
                      >
                        {row
                          .getVisibleCells()
                          .map((cell) => (
                            <td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className={styles.emptyTable}
                      >
                        No guitar records yet. Click “Add
                        Guitar” to register your first item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>

              <span>
                Page{" "}
                {table.getState().pagination.pageIndex + 1}{" "}
                of {Math.max(table.getPageCount(), 1)}
              </span>

              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </div>

            <div className={styles.profileSection}>
            {activeGuitar ? (
              <article className={styles.detailCard}>
                <div className={styles.detailTop}>
                  <div>
                    <p className={styles.label}>
                      Active Item Profile
                    </p>

                    <h3>{activeGuitar.guitarModel}</h3>
                  </div>

                  <span
                    className={
                      activeGuitar.userRole === "Merchant"
                        ? styles.merchantBadge
                        : styles.consumerBadge
                    }
                  >
                    {activeGuitar.userRole}
                  </span>
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      Guitar Model
                    </span>

                    <strong className={styles.detailValue}>
                      {activeGuitar.guitarModel}
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      Body Type
                    </span>

                    <strong className={styles.detailValue}>
                      {activeGuitar.bodyType}
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      Brand Name
                    </span>

                    <strong className={styles.detailValue}>
                      {activeGuitar.brandName}
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      Stock Quantity
                    </span>

                    <strong className={styles.detailValue}>
                      {activeGuitar.stockQuantity} units
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      Manufacturer
                    </span>

                    <strong className={styles.detailValue}>
                      {activeGuitar.manufacturerName}
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      Assigned User Role
                    </span>

                    <strong className={styles.detailValue}>
                      {activeGuitar.userRole}
                    </strong>
                  </div>
                </div>
              </article>
            ) : (
              <div className={styles.emptyDetail}>
                <h3>No active guitar selected</h3>

                <p>
                  Click a table row to display its complete details.
                </p>
              </div>
            )}
          </div>

          </section>
        )}
      </div>
    </main>
  );
}

export default App;