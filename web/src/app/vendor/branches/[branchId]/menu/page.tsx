'use client';

import { useRouter } from 'next/navigation';
import { useBranchMenu } from './hooks';
import { CategoryForm } from './components/CategoryForm';
import { ItemForm } from './components/ItemForm';
import { OptionForm } from './components/OptionForm';
import type { CategoryFormValues, ItemFormValues, OptionFormValues } from './schemas';

interface BranchMenuPageProps {
  params: {
    branchId: string;
  };
}

export default function BranchMenuPage({ params }: BranchMenuPageProps) {
  const router = useRouter();
  const { branchId } = params;

  const {
    loading,
    categories,
    createCategory,
    createItem,
    createOption,
    deleteCategory,
    deleteItem,
    toggleItemAvailability,
    deleteOption,
  } = useBranchMenu(branchId);

  const onCreateCategory = async (values: CategoryFormValues) => {
    await createCategory(values);
  };

  const onCreateItem = async (values: ItemFormValues) => {
    await createItem(values);
  };

  const onCreateOption = async (values: OptionFormValues) => {
    await createOption(values);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Delete this category and all its items?')) {
      return;
    }

    await deleteCategory(categoryId);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Delete this menu item?')) {
      return;
    }

    await deleteItem(itemId);
  };

  const handleToggleItemAvailability = async (
    itemId: string,
    current: boolean,
  ) => {
    await toggleItemAvailability(itemId, current);
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!window.confirm('Delete this menu option?')) {
      return;
    }

    await deleteOption(optionId);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-black">
        <div className="flex w-full max-w-5xl flex-col gap-6 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allItems = categories.flatMap((category) =>
    category.items.map((item) => ({ id: item.id, name: item.name, categoryName: category.name })),
  );

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="flex w-full max-w-5xl flex-col gap-6 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Branch Menu
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Manage categories, items, and options for this branch.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/vendor')}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Back to vendor portal
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <CategoryForm onSubmit={onCreateCategory} />
          <ItemForm
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            onSubmit={onCreateItem}
          />
          <OptionForm items={allItems} onSubmit={onCreateOption} />
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Current menu
          </h2>

          {categories.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No categories or items have been created yet.
            </p>
          )}

          {categories.map((category) => (
            <div
              key={category.id}
              className="space-y-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {category.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Sort order: {category.sortOrder}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                >
                  Delete category
                </button>
              </div>

              {category.items.length === 0 && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  No items in this category yet.
                </p>
              )}

              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {item.name}
                        </p>
                        {!item.isAvailable && (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                            Unavailable
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
                        {`Price: ${Number(item.basePrice).toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleItemAvailability(item.id, item.isAvailable)
                        }
                        className="rounded-md border border-zinc-300 px-2 py-1 text-[11px] font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
                      >
                        {item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-md border border-red-300 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                      >
                        Delete item
                      </button>
                    </div>
                  </div>

                  {item.options.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between rounded border border-dashed border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                        >
                          <div>
                            <p className="font-medium text-zinc-800 dark:text-zinc-100">
                              {option.name}
                            </p>
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                              {option.type}
                              {option.priceDelta
                                ? ` • +${Number(option.priceDelta).toFixed(2)}`
                                : ''}
                              {option.isRequired ? ' • Required' : ''}
                              {option.maxSelection
                                ? ` • Max ${option.maxSelection}`
                                : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(option.id)}
                            className="rounded-md border border-red-300 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
